import axios from "axios";
import { displayNameFromGraphAccessToken } from "../common/helpers";
import type {
  DocumentLibraryGraphClient,
  DocumentLibraryItemRow,
  DocumentLibraryVersion,
  UploadFailure,
} from "../types";
import { buildDriveItemSelect, buildFieldSelect } from "../utils/columns";
type GraphClientOptions = {
  driveId?: string;
  siteUrl?: string;
  listName?: string;
  columns?: unknown;
  graphBaseUrl?: string;
  /**
   * Map decoded token display name onto **existing** SharePoint list columns during upload.
   * Use the columns’ **internal names** (List settings → column → column name).
   * Omit this entirely if you do not have writable text columns for this (the grid can still
   * show “Created by” from Microsoft Graph on `listChildren`, which does not use list fields).
   */
  uploadIdentityFieldKeys?: { created?: string; modified?: string };
  /**
   * Return a valid access token for Microsoft Graph.
   */
  getAccessToken: () => Promise<string>;
};

function getFieldDisplayName(person?: unknown): string | undefined {
  if (!person || typeof person !== "object") return undefined;
  const p = person as any;
  return (
    p?.user?.displayName ??
    p?.application?.displayName ??
    p?.user?.id ??
    p?.userPrincipalName ??
    undefined
  );
}

async function graphRequest<T>(params: {
  url: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  accessToken: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<T> {
  const { url, method, accessToken, headers, body } = params;

  try {
    const res = await axios({
      url,
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...headers,
      },
      data: body,
    });
    return res.data as T;
  } catch (error: any) {
    let message = error.response
      ? `${error.response.status} ${error.response.statusText}`
      : error.message;
    const err = error.response?.data;
    message = err?.error?.message ?? err?.message ?? message;
    throw new Error(message);
  }
}

async function graphRequestNoJson(params: {
  url: string;
  method: "POST" | "DELETE";
  accessToken: string;
}) {
  try {
    await axios({
      url: params.url,
      method: params.method,
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    });
  } catch (error: any) {
    let message = error.response
      ? `${error.response.status} ${error.response.statusText}`
      : error.message;
    const err = error.response?.data;
    message = err?.error?.message ?? err?.message ?? message;
    throw new Error(message);
  }
}

function parseSiteUrl(siteUrl: string) {
  const u = new URL(siteUrl);
  const hostname = u.hostname;
  const sitePath = u.pathname;
  return { hostname, sitePath };
}

function escapeODataString(value: string) {
  return value.replace(/'/g, "''");
}

function buildUploadIdentityStamp(
  identityName: string | undefined,
  keys: GraphClientOptions["uploadIdentityFieldKeys"],
): Record<string, unknown> {
  if (!identityName || !keys) return {};
  const out: Record<string, unknown> = {};
  const created = keys.created?.trim();
  const modified = keys.modified?.trim();
  if (created) out[created] = identityName;
  if (modified) out[modified] = identityName;
  return out;
}

export function createGraphClient(
  opts: GraphClientOptions,
): DocumentLibraryGraphClient {
  const graphBaseUrl = opts.graphBaseUrl ?? "https://graph.microsoft.com/v1.0";
  let resolvedDriveId: string | null = opts.driveId ?? null;

  async function ensureDriveId(accessToken: string): Promise<string> {
    if (resolvedDriveId) return resolvedDriveId;

    if (!opts.siteUrl || !opts.listName) {
      throw new Error("Missing driveId or siteUrl/listName for Graph client.");
    }

    const { hostname, sitePath } = parseSiteUrl(opts.siteUrl); // Step 1: Get Site
    const site = await graphRequest<{ id: string }>({
      url: `${graphBaseUrl}/sites/${encodeURIComponent(hostname)}:${sitePath}?$select=id`,
      method: "GET",
      accessToken,
    });

    // Step 2: Resolve the list by displayName (server-side filtered).
    const escapedListName = escapeODataString(opts.listName);
    const lists = await graphRequest<{
      value: Array<{ id: string; displayName: string }>;
    }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}/lists` +
        `?$select=id,displayName&$filter=displayName eq '${escapedListName}'`,
      method: "GET",
      accessToken,
    });

    const list = lists.value[0];
    if (!list) {
      throw new Error(
        `List (Library) '${opts.listName}' not found in site lists.`,
      );
    }

    // Step 3: Get the drive that backs this list.
    const drive = await graphRequest<{ id: string; name: string }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}` +
        `/lists/${encodeURIComponent(list.id)}/drive?$select=id,name`,
      method: "GET",
      accessToken,
    });

    resolvedDriveId = drive.id;
    return drive.id;
  }
  async function getContext() {
    const accessToken = await opts.getAccessToken();
    const driveId = await ensureDriveId(accessToken);
    return { accessToken, driveId };
  }

  return {
    async getDriveItemIdByName({ name }) {
      const { accessToken, driveId } = await getContext();
      try {
        const res = await axios.get(
          `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}/root:/${encodeURIComponent(name)}?$select=id`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        return res.data.id;
      } catch (error: any) {
        let message = error.response
          ? `${error.response.status} ${error.response.statusText}`
          : error.message;
        const err = error.response?.data;
        message = err?.error?.message ?? err?.message ?? message;
        throw new Error(`Failed to find Document Set '${name}': ${message}`);
      }
    },

    async listChildren({ parentDriveItemId }) {
      const { accessToken, driveId } = await getContext();
      const selectClause = buildDriveItemSelect(opts.columns);
      const fieldSelectClause = buildFieldSelect(opts.columns);
      let nextUrl =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `${parentDriveItemId ? `/items/${encodeURIComponent(parentDriveItemId)}` : "/root"}/children` +
        `?$select=${encodeURIComponent(selectClause)}` +
        `&$expand=listItem($expand=fields($select=${encodeURIComponent(fieldSelectClause)}))`;
      const rows: DocumentLibraryItemRow[] = [];
      while (nextUrl) {
        let json: any;
        try {
          const res = await axios.get(nextUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          json = res.data;
        } catch (error: any) {
          let message = error.response
            ? `${error.response.status} ${error.response.statusText}`
            : error.message;
          const err = error.response?.data;
          message = err?.error?.message ?? err?.message ?? message;
          throw new Error(message);
        }
        const items = (json?.value ?? []) as any[];

        for (const item of items) {
          const fields: Record<string, unknown> =
            (item?.listItem?.fields as Record<string, unknown>) ?? {};

          const ctRaw = fields.ContentType;
          let contentTypeName: string | undefined;
          if (typeof ctRaw === "string" && ctRaw.trim()) {
            const s = ctRaw.trim();
            contentTypeName =
              /^0x[0-9A-F]+$/i.test(s) && s.length > 8 ? undefined : s;
          } else if (ctRaw && typeof ctRaw === "object") {
            const o = ctRaw as Record<string, unknown>;
            const n = o.name ?? o.label ?? o.displayName;
            if (typeof n === "string") contentTypeName = n;
          }

          let isContainer = !!(item.folder || item.package);
          if (contentTypeName && /document\s*set/i.test(contentTypeName)) {
            isContainer = true;
          }

          rows.push({
            itemId: item.id,
            name: item.name,
            webUrl: item.webUrl,
            fields,
            contentTypeName,
            isContainer,
            createdByDisplayName: getFieldDisplayName(item.createdBy),
            modifiedByDisplayName: getFieldDisplayName(item.lastModifiedBy),
          });
        }

        nextUrl = json?.["@odata.nextLink"];
      }

      return rows;
    },

    async deleteItem({ itemId }) {
      const { accessToken, driveId } = await getContext();
      const url = `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}`;
      await graphRequestNoJson({ url, method: "DELETE", accessToken });
    },

    async listVersions({ itemId }) {
      const { accessToken, driveId } = await getContext();
      // driveItemVersion supports id, lastModifiedDateTime, size, lastModifiedBy, publication, content — not createdDateTime/comment.
      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/versions` +
        `?$select=id,lastModifiedDateTime,lastModifiedBy,size`;

      const json = await graphRequest<{ value: DocumentLibraryVersion[] }>({
        url,
        method: "GET" as any,
        accessToken,
      });

      return json.value ?? [];
    },

    async restoreVersion({ itemId, versionId }) {
      const { accessToken, driveId } = await getContext();
      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/versions/${encodeURIComponent(versionId)}/restoreVersion`;
      await graphRequestNoJson({ url, method: "POST", accessToken });
    },

    async uploadFiles({
      parentDriveItemId,
      files,
      contentType: _contentType,
      properties,
      conflictBehavior,
    }) {
      const { accessToken, driveId } = await getContext();

      const uploadedItemIds: string[] = [];
      const failures: UploadFailure[] = []; //Apply same properties to all files (as requested)

      const identityName = displayNameFromGraphAccessToken(accessToken);
      const patchProperties: Record<string, unknown> = {
        ...buildUploadIdentityStamp(identityName, opts.uploadIdentityFieldKeys),
        ...properties,
      };

      for (const file of files) {
        try {
          const fileNameEncoded = encodeURIComponent(file.name);
          const uploadUrl =
            `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
            `${parentDriveItemId ? `/items/${encodeURIComponent(parentDriveItemId)}` : "/root"}` +
            `:/${fileNameEncoded}:/content?` +
            `@microsoft.graph.conflictBehavior=${encodeURIComponent(conflictBehavior ?? "rename")}`;

          let uploaded: any;
          try {
            const uploadRes = await axios.put(uploadUrl, file, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": file.type || "application/octet-stream",
              },
            });
            uploaded = uploadRes.data;
          } catch (error: any) {
            let message = error.response
              ? `${error.response.status} ${error.response.statusText}`
              : error.message;
            const err = error.response?.data;
            message = err?.error?.message ?? err?.message ?? message;
            throw new Error(message);
          }

          const newItemId = uploaded?.id as string;
          if (!newItemId)
            throw new Error(
              "Upload succeeded but no drive item id was returned.",
            );

          const patchUrl =
            `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
            `/items/${encodeURIComponent(newItemId)}/listItem/fields`;

          if (Object.keys(patchProperties).length > 0) {
            try {
              await axios.patch(patchUrl, patchProperties, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              });
            } catch (error: any) {
              let message = error.response
                ? `${error.response.status} ${error.response.statusText}`
                : error.message;
              const err = error.response?.data;
              message = err?.error?.message ?? err?.message ?? message;
              throw new Error(message);
            }
          }

          uploadedItemIds.push(newItemId);
        } catch (e) {
          failures.push({
            fileName: file.name,
            message: e instanceof Error ? e.message : "Upload failed",
          });
        }
      }

      return { uploadedItemIds, failures };
    },
  };
}
