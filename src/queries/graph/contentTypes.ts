import { normalizeLookupKey } from "../../utils/columns";
import { graphRequest } from "./graphRequest";
import { resolveListByDisplayName } from "./library";
import type { NormalizedPatchProperties } from "./types";

export function createContentTypeHelpers(params: {
  graphBaseUrl: string;
  contentTypesLibraryName: string;
}) {
  const { graphBaseUrl, contentTypesLibraryName } = params;
  let cachedContentTypeNames: string[] | null = null;
  let cachedCurrentListContentTypeMap: Map<string, string> | null = null;

  async function getContentTypeChoices(args: {
    accessToken: string;
    siteId: string;
  }): Promise<string[]> {
    if (cachedContentTypeNames) return cachedContentTypeNames;
    const ctList = await resolveListByDisplayName({
      graphBaseUrl,
      accessToken: args.accessToken,
      siteId: args.siteId,
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
        `${graphBaseUrl}/sites/${encodeURIComponent(args.siteId)}` +
        `/lists/${encodeURIComponent(ctList.id)}/contentTypes?$select=id,name`,
      method: "GET",
      accessToken: args.accessToken,
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

  async function getCurrentListContentTypeMap(args: {
    accessToken: string;
    siteId: string;
    listId: string;
  }): Promise<Map<string, string>> {
    if (cachedCurrentListContentTypeMap) return cachedCurrentListContentTypeMap;
    const json = await graphRequest<{
      value: Array<{ name?: string; id?: string }>;
    }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(args.siteId)}` +
        `/lists/${encodeURIComponent(args.listId)}/contentTypes?$select=id,name`,
      method: "GET",
      accessToken: args.accessToken,
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

  async function normalizePatchProperties(args: {
    accessToken: string;
    siteId: string;
    listId: string;
    properties: Record<string, unknown>;
  }): Promise<NormalizedPatchProperties> {
    const next: Record<string, unknown> = { ...args.properties };
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

    if (/^0x[0-9a-f]+$/i.test(value)) {
      delete next[contentTypePropKey];
      return { fieldProperties: next, contentTypeId: value };
    }

    try {
      const byName = await getCurrentListContentTypeMap({
        accessToken: args.accessToken,
        siteId: args.siteId,
        listId: args.listId,
      });
      const resolvedId = byName.get(value.toLowerCase());
      if (resolvedId) {
        delete next[contentTypePropKey];
        return { fieldProperties: next, contentTypeId: resolvedId };
      }
    } catch {
      // keep fallback behavior below
    }

    delete next[contentTypePropKey];
    return { fieldProperties: next, unresolvedContentTypeName: value };
  }

  return {
    getContentTypeChoices,
    getCurrentListContentTypeMap,
    normalizePatchProperties,
  };
}

export type ContentTypeHelpers = ReturnType<typeof createContentTypeHelpers>;
