import { DROPDOWN_VALUES_SITE_URL } from "../../utils/constants";
import { graphRequest } from "./graphRequest";
import { parseSiteUrl } from "./helpers";

export type DocIdentifierMapping = {
  DocIdentifier: string;
  Category: string;
  SubCategory: string;
  ClaimWorkflow?: string;
  DocumentName?: string;
};

type DropdownRow = {
  fields?: Record<string, unknown>;
};

type DropdownData = {
  mappings: DocIdentifierMapping[];
  choices: Record<string, string[]>;
};

type IdentifierListKind = "claims" | "financial" | "underwriting";
type IndependentDropdown = {
  key: string;
  sourceFields: string[];
};
type IdentifierListConfig = {
  kind: IdentifierListKind;
  independentDropdowns: IndependentDropdown[];
};

const IDENTIFIER_LIST_CONFIGS: Record<string, IdentifierListConfig> = {
  claimdocidentifier: {
    kind: "claims",
    independentDropdowns: [
      { key: "ClaimWorkflow", sourceFields: ["Workflow", "ClaimWorkflow"] },
      { key: "InputSource", sourceFields: ["InputSources"] },
      { key: "ClaimType", sourceFields: ["ClaimTypes"] },
    ],
  },
  financialsupportingdocidentifier: {
    kind: "financial",
    independentDropdowns: [
      { key: "Function", sourceFields: ["Function"] },
      { key: "G2CompanyName", sourceFields: ["Companies"] },
      { key: "Specialization", sourceFields: ["Specialization"] },
      { key: "Indexer", sourceFields: ["Indexer"] },
    ],
  },
  underwritingdocidentifier: {
    kind: "underwriting",
    independentDropdowns: [],
  },
};

function getListConfig(listName: string): IdentifierListConfig {
  // Keep Claims as the fallback to preserve existing callers with unknown list names.
  return (
    IDENTIFIER_LIST_CONFIGS[listName.trim().toLowerCase()] ??
    IDENTIFIER_LIST_CONFIGS.claimdocidentifier
  );
}

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) return asText(value[0]);
  if (value && typeof value === "object") {
    const candidate = value as {
      LookupValue?: unknown;
      lookupValue?: unknown;
      displayName?: unknown;
      title?: unknown;
    };
    return asText(
      candidate.LookupValue ??
        candidate.lookupValue ??
        candidate.displayName ??
        candidate.title,
    );
  }
  return "";
}

/** Adds scalar, array, and SharePoint lookup/person values to a distinct set. */
function addValues(target: Set<string>, value: unknown): void {
  if (value === undefined || value === null) return;

  if (Array.isArray(value)) {
    for (const item of value) addValues(target, item);
    return;
  }

  const text = asText(value);
  if (text) target.add(text);
}

function sortDistinct(values: Set<string>): string[] {
  return [...values].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

function buildDropdownData(
  items: DropdownRow[],
  listName: string,
): DropdownData {
  const config = getListConfig(listName);
  const mappings: DocIdentifierMapping[] = [];
  const optionSets: Record<string, Set<string>> = {
    DocumentType: new Set<string>(),
  };

  for (const dropdown of config.independentDropdowns) {
    optionSets[dropdown.key] ??= new Set<string>();
  }

  for (const item of items) {
    const fields = item.fields ?? {};
    const documentType = asText(fields.DocIdentifier);

    if (documentType) {
      optionSets.DocumentType.add(documentType);
      const mapping: DocIdentifierMapping = {
        DocIdentifier: documentType,
        Category: asText(fields.Category),
        SubCategory: asText(fields.SubCategory),
      };

      // Claims maps workflow from its identifier list. Financial identifiers
      // do not have a workflow field, and company is resolved from Claim ID
      // on the Claims side rather than from ClaimDocIdentifier.
      if (config.kind === "claims") {
        mapping.ClaimWorkflow =
          asText(fields.Workflow) || asText(fields.ClaimWorkflow);
      }

      // Keep DocumentName mapping available for the future Underwriting list.
      if (config.kind === "underwriting") {
        mapping.DocumentName = asText(fields.DocumentName);
      }

      mappings.push(mapping);
    }

    for (const dropdown of config.independentDropdowns) {
      const target = optionSets[dropdown.key];
      for (const sourceField of dropdown.sourceFields) {
        addValues(target, fields[sourceField]);
      }
    }
  }

  const choices: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(optionSets)) {
    const options = sortDistinct(values);
    if (options.length) choices[key] = options;
  }

  return { mappings, choices };
}

/**
 * Values copied into the form when DocumentType changes.
 * Pass listName so Financial does not derive ClaimWorkflow.
 */
export function derivedFieldsFromMapping(
  mapping: DocIdentifierMapping | null,
  listName = "ClaimDocIdentifier",
): Record<string, string> {
  const { kind } = getListConfig(listName);
  const commonFields = {
    _Category: mapping?.Category ?? "",
    SubCategory: mapping?.SubCategory ?? "",
  };

  if (kind === "financial") return commonFields;

  if (kind === "underwriting") {
    return {
      ...commonFields,
      DocumentName: mapping?.DocumentName ?? "",
    };
  }

  return {
    ...commonFields,
    ClaimWorkflow: mapping?.ClaimWorkflow ?? "",
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
      await graphRequest({ url: nextUrl, method: "GET", accessToken });
    items.push(...(page.value ?? []));
    nextUrl = page["@odata.nextLink"];
  }

  return items;
}

export async function fetchDocIdentifierMappings(params: {
  graphBaseUrl: string;
  accessToken: string;
  listName: string;
}): Promise<DropdownData> {
  const { graphBaseUrl, accessToken, listName } = params;
  const { hostname, sitePath } = parseSiteUrl(DROPDOWN_VALUES_SITE_URL);

  const site = await graphRequest<{ id: string }>({
    url: `${graphBaseUrl}/sites/${encodeURIComponent(hostname)}:${sitePath}?$select=id`,
    method: "GET",
    accessToken,
  });

  const list = await graphRequest<{ id: string }>({
    url: `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}/lists/${encodeURIComponent(listName)}?$select=id`,
    method: "GET",
    accessToken,
  });

  const itemsUrl =
    `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}` +
    `/lists/${encodeURIComponent(list.id)}/items?$expand=fields&$top=5000`;
  const items = await loadAllItems(itemsUrl, accessToken);

  return buildDropdownData(items, listName);
}

export function createDropdownValuesHelper(params: {
  graphBaseUrl: string;
  dropdownList?: string;
}) {
  const { graphBaseUrl, dropdownList } = params;
  const listName = dropdownList?.trim();
  let cachePromise: Promise<DropdownData> | null = null;

  async function load(accessToken: string): Promise<DropdownData> {
    if (!listName) return { mappings: [], choices: {} };
    if (cachePromise) return cachePromise;

    cachePromise = fetchDocIdentifierMappings({
      graphBaseUrl,
      accessToken,
      listName,
    }).catch((error: unknown) => {
      // Do not permanently cache a failed request; a later call can retry.
      cachePromise = null;
      throw error;
    });

    return cachePromise;
  }

  async function getDocIdentifierMappings(accessToken: string) {
    return (await load(accessToken)).mappings;
  }

  async function getDropdownChoices(accessToken: string) {
    return (await load(accessToken)).choices;
  }

  return { getDropdownChoices, getDocIdentifierMappings };
}

export type DropdownValuesHelper = ReturnType<
  typeof createDropdownValuesHelper
>;
