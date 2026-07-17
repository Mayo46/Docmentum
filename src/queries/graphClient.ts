import axios from "axios";
import type {
  DocumentLibraryFieldDefinition,
  DocumentLibraryGraphClient,
  DocumentLibraryItemRow,
  DocumentLibraryVersion,
  FieldUpdateFailure,
  UploadFailure,
} from "../types";
import { buildDriveItemSelect, buildFieldSelect, normalizeLookupKey } from "../utils/columns";
import {
  fallbackFieldDefinition,
  parseGraphListColumn,
} from "../utils/fieldDefinitions";
type GraphClientOptions = {
  driveId?: string;
  siteUrl?: string;
  listName?: string;
  /** Library/list display name used to source Content Type dropdown values. */
  contentTypesLibrary?: string;
  columns?: unknown;
  graphBaseUrl?: string;
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

type LibraryContext = {
  driveId: string;
  siteId: string;
  listId: string;
};

export function createGraphClient(
  opts: GraphClientOptions,
): DocumentLibraryGraphClient {
  const graphBaseUrl = opts.graphBaseUrl ?? "https://graph.microsoft.com/v1.0";
  const contentTypesLibraryName = opts.contentTypesLibrary?.trim() || "ContentTypesLibraryTest";
  let resolvedLibrary: LibraryContext | null = opts.driveId
    ? { driveId: opts.driveId, siteId: "", listId: "" }
    : null;
  let cachedListColumns: unknown[] | null = null;
  let cachedContentTypeNames: string[] | null = null;
  let cachedCurrentListContentTypeMap: Map<string, string> | null = null;

  async function resolveListByDisplayName(params: {
    accessToken: string;
    siteId: string;
    displayName: string;
  }): Promise<{ id: string; displayName: string } | null> {
    const escapedName = escapeODataString(params.displayName);
    const lists = await graphRequest<{
      value: Array<{ id: string; displayName: string }>;
    }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(params.siteId)}/lists` +
        `?$select=id,displayName&$filter=displayName eq '${escapedName}'`,
      method: "GET",
      accessToken: params.accessToken,
    });
    return lists.value[0] ?? null;
  }

  async function getContentTypeChoices(params: {
    accessToken: string;
    siteId: string;
  }): Promise<string[]> {
    if (cachedContentTypeNames) return cachedContentTypeNames;
    const ctList = await resolveListByDisplayName({
      accessToken: params.accessToken,
      siteId: params.siteId,
      displayName: contentTypesLibraryName,
    });
    if (!ctList) {
      cachedContentTypeNames = [];
      return cachedContentTypeNames;
    }

    const json = await graphRequest<{
      value: Array<{ name?: string; id?: string }>;
    }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(params.siteId)}` +
        `/lists/${encodeURIComponent(ctList.id)}/contentTypes?$select=id,name`,
      method: "GET",
      accessToken: params.accessToken,
    });

    const names: string[] = [];
    for (const ct of json.value ?? []) {
      const name = typeof ct.name === "string" ? ct.name.trim() : "";
      if (!name) continue;
      names.push(name);
    }
    cachedContentTypeNames = Array.from(new Set(names)).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
    return cachedContentTypeNames;
  }

  async function getCurrentListContentTypeMap(params: {
    accessToken: string;
    siteId: string;
    listId: string;
  }): Promise<Map<string, string>> {
    if (cachedCurrentListContentTypeMap) return cachedCurrentListContentTypeMap;
    const json = await graphRequest<{
      value: Array<{ name?: string; id?: string }>;
    }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(params.siteId)}` +
        `/lists/${encodeURIComponent(params.listId)}/contentTypes?$select=id,name`,
      method: "GET",
      accessToken: params.accessToken,
    });
    const map = new Map<string, string>();
    for (const ct of json.value ?? []) {
      const name = typeof ct.name === "string" ? ct.name.trim() : "";
      const id = typeof ct.id === "string" ? ct.id.trim() : "";
      if (!name || !id) continue;
      map.set(name.toLowerCase(), id);
    }
    cachedCurrentListContentTypeMap = map;
    return map;
  }

  async function normalizePatchProperties(params: {
    accessToken: string;
    siteId: string;
    listId: string;
    properties: Record<string, unknown>;
  }): Promise<{
    fieldProperties: Record<string, unknown>;
    contentTypeId?: string;
    unresolvedContentTypeName?: string;
  }> {
    const next: Record<string, unknown> = { ...params.properties };
    let contentTypePropKey: string | null = null;
    for (const key of Object.keys(next)) {
      if (normalizeLookupKey(key) === "contenttype") {
        contentTypePropKey = key;
        break;
      }
    }
    if (!contentTypePropKey) return { fieldProperties: next };

    const raw = next[contentTypePropKey];
    let value = "";
    if (typeof raw === "string") {
      value = raw.trim();
    } else if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      const idOrName = obj.id ?? obj.name ?? obj.label ?? obj.displayName ?? "";
      value = typeof idOrName === "string" ? idOrName.trim() : "";
    }
    if (!value) return { fieldProperties: next };

    // Caller can pass id directly (0x...).
    if (/^0x[0-9a-f]+$/i.test(value)) {
      delete next[contentTypePropKey];
      return { fieldProperties: next, contentTypeId: value };
    }

    try {
      const byName = await getCurrentListContentTypeMap({
        accessToken: params.accessToken,
        siteId: params.siteId,
        listId: params.listId,
      });
      const resolvedId = byName.get(value.toLowerCase());
      if (resolvedId) {
        delete next[contentTypePropKey];
        return { fieldProperties: next, contentTypeId: resolvedId };
      }
    } catch {
      // keep fallback behavior below
    }

    // Do NOT fall back to source-library ids. They may not be valid for target list.
    // Remove content type from regular fields payload and report unresolved selection.
    delete next[contentTypePropKey];
    return { fieldProperties: next, unresolvedContentTypeName: value };
  }

  async function ensureLibrary(accessToken: string): Promise<LibraryContext> {
    if (resolvedLibrary?.driveId) return resolvedLibrary;

    if (!opts.siteUrl || !opts.listName) {
      throw new Error("Missing driveId or siteUrl/listName for Graph client.");
    }

    const { hostname, sitePath } = parseSiteUrl(opts.siteUrl);
    const site = await graphRequest<{ id: string }>({
      url: `${graphBaseUrl}/sites/${encodeURIComponent(hostname)}:${sitePath}?$select=id`,
      method: "GET",
      accessToken,
    });

    // Step 2: Resolve the list by displayName (server-side filtered).
    const list = await resolveListByDisplayName({
      accessToken,
      siteId: site.id,
      displayName: opts.listName,
    });
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

    resolvedLibrary = {
      driveId: drive.id,
      siteId: site.id,
      listId: list.id,
    };
    return resolvedLibrary;
  }

  async function getContext() {
    const accessToken = await opts.getAccessToken();
    const lib = await ensureLibrary(accessToken);
    return { accessToken, driveId: lib.driveId, siteId: lib.siteId, listId: lib.listId };
  }

  function resolveRequestedFieldKeys(fieldKeys: string[]): Map<string, string> {
    const canonByNorm = new Map<string, string>();
    for (const k of fieldKeys) {
      const trimmed = k.trim();
      if (!trimmed) continue;
      canonByNorm.set(normalizeLookupKey(trimmed), trimmed);
    }
    return canonByNorm;
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

    async getFieldDefinitions({ fieldKeys }) {
      const { accessToken, siteId, listId } = await getContext();
      const requested = resolveRequestedFieldKeys(fieldKeys);
      if (requested.size === 0) return [];

      if (!siteId || !listId) {
        return fieldKeys.map((k) => fallbackFieldDefinition(k.trim()));
      }

      let columnRows = cachedListColumns;
      if (!columnRows) {
        // SharePoint Graph rejects $select on /lists/{id}/columns for many libraries (400).
        // Fetch the full column metadata once and cache it for the session.
        const json = await graphRequest<{ value: unknown[] }>({
          url:
            `${graphBaseUrl}/sites/${encodeURIComponent(siteId)}` +
            `/lists/${encodeURIComponent(listId)}/columns`,
          method: "GET",
          accessToken,
        });
        columnRows = json.value ?? [];
        cachedListColumns = columnRows;
      }

      const parsed = new Map<string, DocumentLibraryFieldDefinition>();
      for (const col of columnRows) {
        const def = parseGraphListColumn(col as Parameters<typeof parseGraphListColumn>[0]);
        if (!def) continue;
        const norm = normalizeLookupKey(def.key);
        if (requested.has(norm)) {
          parsed.set(norm, def);
        }
      }

      const out: DocumentLibraryFieldDefinition[] = [];
      for (const [, canonKey] of requested) {
        const norm = normalizeLookupKey(canonKey);
        const baseDef = parsed.get(norm) ?? fallbackFieldDefinition(canonKey);
        if (norm === "contenttype") {
          try {
            const choices = await getContentTypeChoices({ accessToken, siteId });
            if (choices.length > 0) {
              out.push({
                ...baseDef,
                fieldType: "choice",
                choices,
                allowMultipleChoices: false,
              });
              continue;
            }
          } catch {
            // Keep original field definition as fallback when CT lookup fails.
          }
        }
        out.push(baseDef);
      }
      return out;
    },

    async getListItemFieldValues({ itemId, fieldKeys }) {
      const { accessToken, driveId } = await getContext();
      const keys = fieldKeys.map((k) => k.trim()).filter(Boolean);
      if (keys.length === 0) return {};

      const select = keys.map(encodeURIComponent).join(",");
      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/listItem/fields` +
        `?$select=${select}`;

      return graphRequest<Record<string, unknown>>({
        url,
        method: "GET",
        accessToken,
      });
    },

    async updateListItemFields({ itemIds, properties }) {
      const { accessToken, driveId, siteId, listId } = await getContext();
      const failures: FieldUpdateFailure[] = [];
      const keys = Object.keys(properties);
      if (keys.length === 0) return { failures };
      const normalized = await normalizePatchProperties({
        accessToken,
        siteId,
        listId,
        properties,
      });
      if (normalized.unresolvedContentTypeName) {
        throw new Error(
          `Unable to resolve content type '${normalized.unresolvedContentTypeName}' for this library. ` +
          "Ensure this content type exists on the target list.",
        );
      }
      for (const itemId of itemIds) {
        try {
          if (normalized.contentTypeId) {
            const listItemUrl =
              `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
              `/items/${encodeURIComponent(itemId)}/listItem`;

            await graphRequest({
              url: listItemUrl,
              method: "PATCH",
              accessToken,
              body: { contentType: { id: normalized.contentTypeId } },
            });
          }

          if (Object.keys(normalized.fieldProperties).length > 0) {
            const fieldsUrl =
              `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
              `/items/${encodeURIComponent(itemId)}/listItem/fields`;
            await graphRequest({
              url: fieldsUrl,
              method: "PATCH",
              accessToken,
              body: normalized.fieldProperties,
            });
          }
        } catch (e) {
          failures.push({
            itemId,
            message: e instanceof Error ? e.message : "Update failed",
          });
        }
      }
      return { failures };
    },

    async deleteItem({ itemId }) {
      const { accessToken, driveId } = await getContext();
      const url = `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}`;
      await graphRequestNoJson({ url, method: "DELETE", accessToken });
    },
    async checkoutItem({ itemId }) {
      const { accessToken, driveId } = await getContext();

      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/checkout`;

      await graphRequestNoJson({
        url,
        method: "POST",
        accessToken,
      });
    },

    async cancelCheckoutItem({ itemId }) {
      const { accessToken, driveId } = await getContext();

      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/discardCheckout`;

      await graphRequestNoJson({
        url,
        method: "POST",
        accessToken,
      });
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
      const { accessToken, driveId, siteId, listId } = await getContext();

      const uploadedItemIds: string[] = [];
      const failures: UploadFailure[] = []; //Apply same properties to all files (as requested)

      const normalized = await normalizePatchProperties({
        accessToken,
        siteId,
        listId,
        properties,
      });
      if (normalized.unresolvedContentTypeName) {
        throw new Error(
          `Unable to resolve content type '${normalized.unresolvedContentTypeName}' for this library. ` +
          "Ensure this content type exists on the target list.",
        );
      }

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

          if (normalized.contentTypeId) {
            const listItemUrl =
              `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
              `/items/${encodeURIComponent(newItemId)}/listItem`;

            try {
              await axios.patch(
                listItemUrl,
                { contentType: { id: normalized.contentTypeId } },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                },
              );
            } catch (error: any) {
              let message = error.response
                ? `${error.response.status} ${error.response.statusText}`
                : error.message;
              const err = error.response?.data;
              message = err?.error?.message ?? err?.message ?? message;
              throw new Error(message);
            }
          }

          const patchUrl =
            `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
            `/items/${encodeURIComponent(newItemId)}/listItem/fields`;

          if (Object.keys(normalized.fieldProperties).length > 0) {
            try {
              await axios.patch(patchUrl, normalized.fieldProperties, {
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

    async favoriteItem({ itemId }) {
      const { accessToken, driveId } = await getContext();

      const url = `${graphBaseUrl}/drives/${encodeURIComponent(
        driveId,
      )}/items/${encodeURIComponent(itemId)}/follow`;

      await graphRequestNoJson({
        url,
        method: "POST",
        accessToken,
      });
    },

    async unfavoriteItem({ itemId }) {
      const { accessToken, driveId } = await getContext();

      const url = `${graphBaseUrl}/drives/${encodeURIComponent(
        driveId,
      )}/items/${encodeURIComponent(itemId)}/unfollow`;

      await graphRequestNoJson({
        url,
        method: "POST",
        accessToken,
      });
    },
  };
}
