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

export const COLUMN_GROUPS = {
    GENERAL: "G2",
    DOCUMENT_SET: "G2 Claim",
    DOCUMENT: "G2 Claim Document",
    CORE: "Core Document Columns",
} as const;

export const COLUMN_GROUP_LABELS: Record<string, string> = {
    [COLUMN_GROUPS.GENERAL]: "General",
    [COLUMN_GROUPS.DOCUMENT_SET]: "Document Set",
    [COLUMN_GROUPS.DOCUMENT]: "Document",
    [COLUMN_GROUPS.CORE]: "General",
};

export const GROUP_ORDER = [
    COLUMN_GROUPS.DOCUMENT,
    COLUMN_GROUPS.DOCUMENT_SET,
    COLUMN_GROUPS.GENERAL,
];