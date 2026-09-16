export const DEFAULT_DRIVE_SELECT_COLUMNS = [
  "id",
  "name",
  "webUrl",
  "folder",
  "file",
  "package",
  "createdBy",
  "lastModifiedBy",
];

export const DEFAULT_FIELD_SELECT_COLUMNS = [
  "Title",
  "ContentType",
  "CreatedBy",
  "ModifiedBy",
];

/**
 * Content types whose SharePoint columns are fetched for choice/lookup metadata.
 * Field schema (which fields, labels, required, readonly, type, group) comes from
 * `editableProperties` on the host, not from these mappings.
 */
export const SITE_CONTENT_TYPES: Record<string, string[]> = {
  Claims: ["G2 Claim", "G2 Claim Document"],

  Underwriting: ["G2 Underwriting", "G2 Underwriting Document"],

  FinancialSupportingDocuments: ["G2 Financial Supporting Document"],
};

export const COLUMN_GROUP_LABELS: Record<string, string> = {
  document: "Document Information",
  claim: "Claim Information",
  enterprise: "Enterprise Information",
};

export const GROUP_ORDER = ["document", "claim", "enterprise"];

export const DROPDOWN_VALUES_SITE_URL =
  "https://genstargenesis.sharepoint.com/sites/Config-Dev";
