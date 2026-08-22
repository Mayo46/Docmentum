export type DocumentLibraryColumnKind =
  | "text"
  | "date"
  | "number"
  | "user"
  | "link";

export type DocumentLibraryColumn = {
  key: string;
  headerName: string;
  kind?: DocumentLibraryColumnKind;
  useDocumentClientUrl?: boolean;
};

export type DocumentLibraryUploadColumn = {
  key: string;
  label: string;
  inputType?: "text" | "number" | "date";
};

export type DocumentLibraryEditableProperty = {
  key: string;
  label?: string;
};

export type DocumentLibraryFieldType =
  | "text"
  | "multiline"
  | "choice"
  | "number"
  | "dateTime"
  | "boolean";

export type DocumentLibraryFieldDefinition = {
  key: string;
  displayName: string;
  fieldType: DocumentLibraryFieldType;
  choices?: string[];
  allowMultipleChoices?: boolean;
  readOnly?: boolean;
  columnGroup?: string;
};

export type FieldUpdateFailure = {
  itemId: string;
  message: string;
};

export type DocumentLibraryItemRow = {
  itemId: string;
  name: string;
  webUrl?: string;
  isContainer?: boolean;
  fields: Record<string, unknown>;
  createdByDisplayName?: string;
  modifiedByDisplayName?: string;
  documentClientUrl?: string;
  contentTypeName?: string;
};

export type DocumentLibraryPage = {
  rows: DocumentLibraryItemRow[];
  nextLink?: string;
};

export type DocumentLibraryItemsPage = {
  rows: DocumentLibraryItemRow[];
  nextLink?: string;
};

export type DocumentLibraryGroupRow = {
  rowType: "group";
  id: string;
  level: number;
  fieldKey: string;
  fieldHeaderName: string;
  groupValue: string;
  childCount: number;
  expanded: boolean;
};

export type DocumentLibraryDataGridRow = DocumentLibraryItemRow & {
  rowType: "data";
  treeLevel: number;
};

export type DocumentLibraryGridRow =
  | DocumentLibraryGroupRow
  | DocumentLibraryDataGridRow;

export type DocumentLibraryVersion = {
  id: string;
  lastModifiedDateTime?: string;
  lastModifiedBy?: unknown;
  size?: number;
  createdDateTime?: string;
  comment?: string;
};

export type UploadFailure = {
  fileName: string;
  message: string;
};

export type OnRefresh = () => void;

export type DocumentLibraryGraphClient = {
  getDriveItemIdByName: (params: { name: string }) => Promise<string>;
  listChildren: (params: {
    parentDriveItemId?: string;
  }) => Promise<DocumentLibraryItemRow[]>;
  listChildrenPage: (params: {
    parentDriveItemId?: string;
    nextLink?: string;
  }) => Promise<DocumentLibraryItemsPage>;
  getChildrenCount: (params: { parentDriveItemId?: string }) => Promise<number>;
  /** Favorited (followed) items in this library, with default metadata columns. */
  listFavorites: () => Promise<
    DocumentLibraryItemRow[]
  >; /** Documents currently checked out in this library. */
  listCheckoutDocuments: () => Promise<DocumentLibraryItemRow[]>;
  listCheckoutDocumentsPage: (params?: {
    nextLink?: string;
  }) => Promise<DocumentLibraryPage>;
  /* When amitted or empty, return all available list columns */
  getFieldDefinitions: (params: {
    fieldKeys?: string[];
  }) => Promise<DocumentLibraryFieldDefinition[]>;
  getListItemFieldValues: (params: {
    itemId: string;
    fieldKeys: string[];
  }) => Promise<Record<string, unknown>>;
  updateListItemFields: (params: {
    itemIds: string[];
    properties: Record<string, unknown>;
  }) => Promise<{ failures: FieldUpdateFailure[] }>;
  deleteItem: (params: { itemId: string }) => Promise<void>;
  listVersions: (params: {
    itemId: string;
  }) => Promise<DocumentLibraryVersion[]>;
  restoreVersion: (params: {
    itemId: string;
    versionId: string;
  }) => Promise<void>;
  uploadFiles: (params: {
    parentDriveItemId?: string;
    files: File[];
    contentType: string;
    properties: Record<string, unknown>;
    conflictBehavior?: "rename" | "replace" | "fail";
  }) => Promise<{ uploadedItemIds: string[]; failures: UploadFailure[] }>;
  checkoutItem: (params: { itemId: string }) => Promise<void>;
  checkinItem: (params: { itemId: string }) => Promise<void>;
  cancelCheckoutItem: (params: { itemId: string }) => Promise<void>;
  downloadItem: (params: { itemId: string }) => Promise<Blob>;
  favoriteItem: (params: { itemId: string }) => Promise<void>;
  unfavoriteItem: (params: { itemId: string }) => Promise<void>;
};

export type GraphAccessTokenClaims = {
  name?: string;
  preferred_username?: string;
  unique_name?: string;
  email?: string;
  upn?: string;
  given_name?: string;
  family_name?: string;
};

export type {
  DocumentLibraryProps,
  DocumentLibraryPropertiesEditTarget,
  DocumentLibraryContextMenuState,
  DocumentLibraryToast,
  DocumentLibraryDocumentType,
} from "./documentLibrary";
