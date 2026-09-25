export const DEFAULT_DRIVE_SELECT_COLUMNS = [
  "id",
  "name",
  "webUrl",
  "folder",
  "file",
  "package",
  "parentReference",
  "createdBy",
  "lastModifiedBy",
];

export const DEFAULT_FIELD_SELECT_COLUMNS = [
  "Title",
  "ContentType",
  "CreatedBy",
  "ModifiedBy",
];

export const COLUMN_GROUP_LABELS: Record<string, string> = {
  document: "Document Information",
  claim: "Claim Information",
  enterprise: "Enterprise Information",
};

export const GROUP_ORDER = ["document", "claim", "enterprise"];

export const DROPDOWN_VALUES_SITE_URL =
  "https://genstargenesis.sharepoint.com/sites/Config-Dev";
