import axios from "axios";
import type {
  DocumentLibraryGraphClient,
  DocumentLibraryItemRow,
  DocumentLibraryVersion,
  UploadFailure,
} from "./types";

type GraphClientOptions = {
  driveId?: string;
  siteUrl?: string;
  listName?: string;
  graphBaseUrl?: string; /**
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
    }); // Step 2: Get drives

    const drives = await graphRequest<{
      value: Array<{ id: string; name: string }>;
    }>({
      url: `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}/drives?$select=id,name`,
      method: "GET",
      accessToken,
    }); // Step 3: Find matching drive
    const drive = drives.value.find((d) => d.name === opts.listName);
    if (!drive) {
      throw new Error(
        `Drive (Library) '${opts.listName}' not found in site drives.`,
      );
    }

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
      let nextUrl =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `${parentDriveItemId ? `/items/${encodeURIComponent(parentDriveItemId)}` : "/root"}/children` +
        `?$select=id,name,webUrl,createdBy,lastModifiedBy,createdDateTime,lastModifiedDateTime`;
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
          const fields: Record<string, unknown> = item?.listItem?.fields ?? {};

          rows.push({
            itemId: item.id,
            name: item.name,
            webUrl: item.webUrl,
            fields,
            createdByDisplayName: getFieldDisplayName(item.createdBy),
            modifiedByDisplayName: getFieldDisplayName(item.lastModifiedBy),
          });
        }
        console.log("rowa", rows);

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
      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/versions` +
        `?$select=id,createdDateTime,lastModifiedDateTime,size,comment`;

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
        `/items/${encodeURIComponent(itemId)}/versions/${encodeURIComponent(versionId)}/restore`;
      await graphRequestNoJson({ url, method: "POST", accessToken });
    },

    async uploadFiles({
      parentDriveItemId,
      files,
      contentType,
      properties,
      conflictBehavior,
    }) {
      const { accessToken, driveId } = await getContext();

      const uploadedItemIds: string[] = [];
      const failures: UploadFailure[] = []; //Apply same properties to all files (as requested)

      const patchProperties: Record<string, unknown> = {
        ...properties, //Placeholder for future mapping to actual SharePoint "content type"
        // contentType,
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
