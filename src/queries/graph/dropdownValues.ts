import {
  DROPDOWN_VALUE_LIST,
  DROPDOWN_VALUES_SITE_URL,
} from "../../utils/constants";
import { graphRequest } from "./graphRequest";
import { parseSiteUrl } from "./helpers";

/**
 * ClaimDropdownValues rows:
 *   Parent = which field (DocumentType, Workflow)
 *   Title  = the option shown in the dropdown
 */
type DropdownRow = {
  id?: string;
  fields?: {
    Title?: unknown;
    Parent?: unknown;
    ParentLookupId?: number | string;
  };
};

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const lookup = value as { LookupValue?: unknown; lookupValue?: unknown };
    return asText(lookup.LookupValue ?? lookup.lookupValue);
  }
  return "";
}

function fieldForParent(parent: string): string | null {
  const key = parent.replace(/\s+/g, "").toLowerCase();
  if (key === "documenttype") return "DocumentType";
  if (key === "workflow" || key === "claimworkflow") return "ClaimWorkflow";
  return null;
}

function groupByParent(items: DropdownRow[]): Record<string, string[]> {
  const titleById = new Map<string, string>();
  for (const item of items) {
    const title = asText(item.fields?.Title);
    if (item.id && title) titleById.set(item.id, title);
  }

  const grouped: Record<string, Set<string>> = {
    DocumentType: new Set(),
    ClaimWorkflow: new Set(),
  };

  for (const item of items) {
    const title = asText(item.fields?.Title);
    if (!title) continue;

    let parent = asText(item.fields?.Parent);
    if (!parent && item.fields?.ParentLookupId != null) {
      parent = titleById.get(String(item.fields.ParentLookupId)) ?? "";
    }

    const fieldKey = fieldForParent(parent);
    if (!fieldKey) continue;
    if (fieldForParent(title)) continue;

    grouped[fieldKey].add(title);
  }

  const sort = (values: Set<string>) =>
    [...values].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );

  return {
    DocumentType: sort(grouped.DocumentType),
    ClaimWorkflow: sort(grouped.ClaimWorkflow),
  };
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

export function createDropdownValuesHelper(params: { graphBaseUrl: string }) {
  const { graphBaseUrl } = params;
  let cache: Record<string, string[]> | null = null;

  async function getDropdownChoices(
    accessToken: string,
  ): Promise<Record<string, string[]>> {
    if (cache) return cache;

    const { hostname, sitePath } = parseSiteUrl(DROPDOWN_VALUES_SITE_URL);
    const site = await graphRequest<{ id: string }>({
      url: `${graphBaseUrl}/sites/${encodeURIComponent(hostname)}:${sitePath}?$select=id`,
      method: "GET",
      accessToken,
    });

    const list = await graphRequest<{ id: string }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}` +
        `/lists/${encodeURIComponent(DROPDOWN_VALUE_LIST)}?$select=id`,
      method: "GET",
      accessToken,
    });

    const listUrl =
      `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}` +
      `/lists/${encodeURIComponent(list.id)}/items?$top=200`;

    let items: DropdownRow[];
    try {
      items = await loadAllItems(
        `${listUrl}&$expand=fields($select=Title,Parent)`,
        accessToken,
      );
    } catch {
      items = await loadAllItems(`${listUrl}&$expand=fields`, accessToken);
    }

    cache = groupByParent(items);
    return cache;
  }

  return { getDropdownChoices };
}

export type DropdownValuesHelper = ReturnType<typeof createDropdownValuesHelper>;
