import {
  DROPDOWN_COLUMN_ALIASES,
  DROPDOWN_VALUES_SITE_URL,
} from "../../utils/constants";
import { normalizeLookupKey } from "../../utils/columns";
import { graphRequest } from "./graphRequest";
import { parseSiteUrl } from "./helpers";

type DropdownRow = {
  id?: string;
  fields?: Record<string, unknown>;
};

const SYSTEM_FIELD_KEYS = new Set(
  [
    "id",
    "@odata.etag",
    "ContentType",
    "Modified",
    "Created",
    "Author",
    "Editor",
    "AuthorLookupId",
    "EditorLookupId",
    "_ColorTag",
    "ComplianceAssetId",
    "LinkTitle",
    "LinkTitleNoMenu",
    "Edit",
    "ItemChildCount",
    "FolderChildCount",
    "Attachments",
    "GUID",
    "AppAuthorLookupId",
    "AppEditorLookupId",
    "_UIVersionString",
    "FileLeafRef",
    "FileRef",
    "FileDirRef",
  ].map(normalizeLookupKey),
);

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const lookup = value as { LookupValue?: unknown; lookupValue?: unknown };
    return asText(lookup.LookupValue ?? lookup.lookupValue);
  }
  return "";
}

function asTexts(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(asTexts).filter(Boolean);
  }
  const one = asText(value);
  return one ? [one] : [];
}

const ALIAS_BY_SOURCE = new Map(
  Object.entries(DROPDOWN_COLUMN_ALIASES).map(([source, targets]) => [
    normalizeLookupKey(source),
    targets,
  ]),
);

function aliasesForColumn(column: string): readonly string[] {
  return ALIAS_BY_SOURCE.get(normalizeLookupKey(column)) ?? [];
}

function isSystemColumn(column: string): boolean {
  if (column.startsWith("@")) return true;
  if (column.endsWith("LookupId")) return true;
  return SYSTEM_FIELD_KEYS.has(normalizeLookupKey(column));
}

function sortDistinct(values: Set<string>): string[] {
  return [...values].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

function indexChoices(
  choices: Record<string, string[]>,
  key: string,
  values: string[],
) {
  choices[key] = values;
  choices[normalizeLookupKey(key)] = values;
}

function distinctValuesFromAllColumns(
  items: DropdownRow[],
): Record<string, string[]> {
  const buckets = new Map<string, Set<string>>();

  for (const item of items) {
    for (const [column, raw] of Object.entries(item.fields ?? {})) {
      if (isSystemColumn(column)) continue;
      const values = asTexts(raw);
      if (values.length === 0) continue;
      let set = buckets.get(column);
      if (!set) {
        set = new Set();
        buckets.set(column, set);
      }
      for (const value of values) set.add(value);
    }
  }

  const choices: Record<string, string[]> = {};
  for (const [column, values] of buckets) {
    const sorted = sortDistinct(values);
    indexChoices(choices, column, sorted);
    for (const alias of aliasesForColumn(column)) {
      indexChoices(choices, alias, sorted);
    }
  }
  return choices;
}

async function loadAllItems(
  url: string,
  accessToken: string,
): Promise<DropdownRow[]> {
  const items: DropdownRow[] = [];
  let nextUrl: string | undefined = url;

  while (nextUrl) {
    const page: { value?: DropdownRow[]; ["@odata.nextLink"]?: string } =
      await graphRequest({
        url: nextUrl,
        method: "GET",
        accessToken,
      });
    items.push(...(page.value ?? []));
    nextUrl = page["@odata.nextLink"];
  }

  return items;
}

/** Loads distinct values for every column on a Config-Dev dropdown list. */
export async function fetchDistinctDropdownValues(params: {
  graphBaseUrl: string;
  accessToken: string;
  listName: string;
}): Promise<Record<string, string[]>> {
  const { graphBaseUrl, accessToken, listName } = params;

  const { hostname, sitePath } = parseSiteUrl(DROPDOWN_VALUES_SITE_URL);
  const site = await graphRequest<{ id: string }>({
    url: `${graphBaseUrl}/sites/${encodeURIComponent(hostname)}:${sitePath}?$select=id`,
    method: "GET",
    accessToken,
  });

  const list = await graphRequest<{ id: string }>({
    url:
      `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}` +
      `/lists/${encodeURIComponent(listName)}?$select=id`,
    method: "GET",
    accessToken,
  });

  const items = await loadAllItems(
    `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}` +
      `/lists/${encodeURIComponent(list.id)}/items?$expand=fields&$top=200`,
    accessToken,
  );

  return distinctValuesFromAllColumns(items);
}

export function createDropdownValuesHelper(params: {
  graphBaseUrl: string;
  dropdownList?: string;
}) {
  const { graphBaseUrl, dropdownList } = params;
  const listName = dropdownList?.trim();
  let cache: Record<string, string[]> | null = null;

  async function getDropdownChoices(
    accessToken: string,
  ): Promise<Record<string, string[]>> {
    if (cache) return cache;
    if (!listName) {
      cache = {};
      return cache;
    }

    cache = await fetchDistinctDropdownValues({
      graphBaseUrl,
      accessToken,
      listName,
    });
    return cache;
  }

  return { getDropdownChoices };
}

export type DropdownValuesHelper = ReturnType<typeof createDropdownValuesHelper>;
