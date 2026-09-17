import { DROPDOWN_VALUES_SITE_URL } from "../../utils/constants";
import { graphRequest } from "./graphRequest";
import { parseSiteUrl } from "./helpers";

export type DocIdentifierMapping = {
  DocIdentifier: string;
  Category: string;
  SubCategory: string;
  Workflow: string;
  Function: string;
  Companies: string[];
  IsExistingClaim: boolean;
};

type DropdownRow = {
  fields?: Record<string, unknown>;
};

const MAPPING_SELECT =
  "DocIdentifier,Category,SubCategory,Workflow,Function,IsExistingClaim,Companies";

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
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

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return value === 1;
}

function toMapping(
  fields?: Record<string, unknown>,
): DocIdentifierMapping | null {
  const DocIdentifier = asText(fields?.DocIdentifier);
  if (!DocIdentifier) return null;
  return {
    DocIdentifier,
    Category: asText(fields?.Category),
    SubCategory: asText(fields?.SubCategory),
    Workflow: asText(fields?.Workflow),
    Function: asText(fields?.Function),
    Companies: asTexts(fields?.Companies),
    IsExistingClaim: asBoolean(fields?.IsExistingClaim),
  };
}

function sortDistinct(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

/** Form fields filled from a DocIdentifier row (same as the consuming app). */
export function derivedFieldsFromMapping(
  mapping: DocIdentifierMapping | null,
): Record<string, string> {
  return {
    _Category: mapping?.Category ?? "",
    SubCategory: mapping?.SubCategory ?? "",
    Workflow: mapping?.Workflow ?? "",
    ClaimWorkflow: mapping?.Workflow ?? "",
    Function: mapping?.Function ?? "",
    G2CompanyName: mapping?.Companies?.[0] ?? "",
  };
}

export function choicesFromMappings(
  mappings: DocIdentifierMapping[],
): Record<string, string[]> {
  return {
    DocumentType: sortDistinct(mappings.map((row) => row.DocIdentifier)),
    Function: sortDistinct(mappings.map((row) => row.Function).filter(Boolean)),
    G2CompanyName: sortDistinct(mappings.flatMap((row) => row.Companies)),
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

/**
 * Graph equivalent of the consuming app's PnP mapping fetch:
 * ClaimDocIdentifier / FinancialSupportingDocIdentifier rows keyed by DocIdentifier.
 */
export async function fetchDocIdentifierMappings(params: {
  graphBaseUrl: string;
  accessToken: string;
  listName: string;
}): Promise<DocIdentifierMapping[]> {
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

  const listUrl =
    `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}` +
    `/lists/${encodeURIComponent(list.id)}/items?$top=200`;

  let items: DropdownRow[];
  try {
    items = await loadAllItems(
      `${listUrl}&$expand=fields($select=${MAPPING_SELECT})`,
      accessToken,
    );
  } catch {
    items = await loadAllItems(`${listUrl}&$expand=fields`, accessToken);
  }

  return items
    .map((item) => toMapping(item.fields))
    .filter((row): row is DocIdentifierMapping => row != null);
}

export function createDropdownValuesHelper(params: {
  graphBaseUrl: string;
  dropdownList?: string;
}) {
  const { graphBaseUrl, dropdownList } = params;
  const listName = dropdownList?.trim();
  let cache: DocIdentifierMapping[] | null = null;

  async function getDocIdentifierMappings(
    accessToken: string,
  ): Promise<DocIdentifierMapping[]> {
    if (cache) return cache;
    if (!listName) {
      cache = [];
      return cache;
    }
    cache = await fetchDocIdentifierMappings({
      graphBaseUrl,
      accessToken,
      listName,
    });
    return cache;
  }

  async function getDropdownChoices(
    accessToken: string,
  ): Promise<Record<string, string[]>> {
    const mappings = await getDocIdentifierMappings(accessToken);
    return choicesFromMappings(mappings);
  }

  return { getDropdownChoices, getDocIdentifierMappings };
}

export type DropdownValuesHelper = ReturnType<
  typeof createDropdownValuesHelper
>;
