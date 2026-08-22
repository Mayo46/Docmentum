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

export const SITE_CONTENT_TYPES: Record<string, string[]> = {
  Claims: ["G2 Claim", "G2 Claim Document"],

  "Indexing-Dev2": ["G2 Claim", "G2 Claim Document"],

  Underwriting: ["G2 Underwriting", "G2 Underwriting Document"],

  FinancialSupportingDocuments: ["G2 Financial Supporting Document"],
};

export const COLUMN_GROUPS = {
  DOCUMENT_SET: "G2 Claim",
  DOCUMENT: "G2 Claim Document",
  CORE: "Core Document Columns",
  FINANCIAL_ENTERPRISE: "Financial Enterprise Information",
} as const;

export const COLUMN_GROUP_LABELS: Record<string, string> = {
  [COLUMN_GROUPS.DOCUMENT_SET]: "Claim Information",
  [COLUMN_GROUPS.DOCUMENT]: "Document Information",
  [COLUMN_GROUPS.CORE]: "Document Information",
  [COLUMN_GROUPS.FINANCIAL_ENTERPRISE]: "Enterprise Information",
};

export const GROUP_ORDER = [
  COLUMN_GROUPS.DOCUMENT,
  COLUMN_GROUPS.DOCUMENT_SET,
  COLUMN_GROUPS.FINANCIAL_ENTERPRISE,
];

export const SITE_DOCUMENT_SET_GROUPS: Record<string, string[]> = {
  Claims: ["G2 Claim"],
  "Indexing-Dev2": ["G2 Claim"],
  Underwriting: ["G2 Underwriting"],
  FinancialSupportingDocuments: ["G2 Financial Supporting Document"],
};

/**
 * Required fields by site.
 */
export const SITE_REQUIRED_FIELDS: Record<string, string[]> = {
  Claims: [
    "DocumentName",
    "ReceivedDate",
    "SubCategory",
    "Category",
    "ClaimWorkflow",
    "ClaimID",
    "ContractID",
    "GenreCompany",
  ],

  "Indexing-Dev2": [
    "DocumentName",
    "ReceivedDate",
    "SubCategory",
    "Category",
    "ClaimWorkflow",
    "ClaimID",
    "ContractID",
    "GenreCompany",
  ],

  Underwriting: [],

  FinancialSupportingDocuments: [
    "DocumentName",
    "SubCategory",
    "Category",
    "ReceivedDate",
    "ClaimWorkflow",
    "GenreCompany",
  ],
};

/**
 * Readonly fields by site.
 */
export const SITE_READONLY_FIELDS: Record<string, string[]> = {
  Claims: ["ClaimCloseDate", "Created"],

  "Indexing-Dev2": ["ClaimCloseDate", "Created"],

  Underwriting: [],

  FinancialSupportingDocuments: [
    // Document Information
    "Created",

    // Enterprise / System Information
    "Area",
    "BatchID",
    "CreatorName",
    "DMSSource",
    "Format",
    "HoldApplied",
    "Sender",
    "FullContentSize",
    "Type",
    "UserModifiedDate",
    "VersionLabel",
    "VersionDescription",
  ],
};

/**
 * Financial Supporting Documents - Document Information order.
 */
export const FINANCIAL_DOCUMENT_FIELD_ORDER = [
  "DocumentName",
  "SubCategory",
  "Category",
  "Comments",
  "ReceivedDate",
  "Recipient",
  "ClaimWorkflow",
  "GenreCompany",
  "Created",
  "CheckedOutBy",
  "CheckedOutDate",
];

/**
 * Financial Supporting Documents - Enterprise Information order.
 */
export const FINANCIAL_ENTERPRISE_FIELD_ORDER = [
  "Area",
  "BatchID",
  "CreatorName",
  "DMSSource",
  "Format",
  "HoldApplied",
  "Sender",
  "FullContentSize",
  "Type",
  "UserModifiedDate",
  "VersionLabel",
  "VersionDescription",
];

export const DOCUMENT_FIELD_ORDER = [
  "DocumentType",
  "DocumentName",
  "ReceivedDate",
  "SubCategory",
  "Category",
  "ClaimWorkflow",
  "Recipient",
  "SendNotification",
  "Comments",
];

export const CLAIM_INFORMATION_FIELD_ORDER = [
  "ClaimIDSelection",
  "ClaimID",
  "ContractID",
  "ClaimCloseDate",
  "GenreCompany",
  "Created",
  "CheckedOutBy",
  "CheckedOutDate",
];

export const DROPDOWN_VALUES_SITE_URL =
  "https://genstargenesis.sharepoint.com/sites/Indexing-Dev2";

export const DROPDOWN_VALUE_LIST = "ClaimDropdownValues";
