export type DocumentLibraryColumnKind = 'text' | 'date' | 'number' | 'user' | 'link'

export type DocumentLibraryColumn = {
    key: string
    headerName: string
    kind?: DocumentLibraryColumnKind
    /**
     * If true, the cell renders a link to `documentClientUrl`.
     * Useful for "Title" columns.
     */
    useDocumentClientUrl?: boolean
}

export type DocumentLibraryUploadColumn = {
    key: string
    label: string
    inputType?: 'text' | 'number' | 'date'
}

/** Host-configured list columns that can be edited on upload or via the properties drawer. */
export type DocumentLibraryEditableProperty = {
    /** SharePoint internal column name (e.g. `Title`, `Category`). */
    key: string
    /** Optional label override when Graph display name is unavailable. */
    label?: string
}

export type DocumentLibraryFieldType =
    | 'text'
    | 'multiline'
    | 'choice'
    | 'number'
    | 'date'
    | 'boolean'

/** Resolved from Microsoft Graph list column definitions. */
export type DocumentLibraryFieldDefinition = {
    key: string
    displayName: string
    fieldType: DocumentLibraryFieldType
    choices?: string[]
    allowMultipleChoices?: boolean
}

export type FieldUpdateFailure = {
    itemId: string
    message: string
}

export type DocumentLibraryItemRow = {
    itemId: string
    name: string
    webUrl?: string
    /**
     * True when this item is a folder or document-set-like container (navigate in-app).
     */
    isContainer?: boolean
    /**
     * SharePoint list item field values.
     * Keys should match the internal column names you're passing in via `columns`.
     */
    fields: Record<string, unknown>
    createdByDisplayName?: string
    modifiedByDisplayName?: string
    documentClientUrl?: string
    /** Display name of the SharePoint Content Type (e.g. "Document", "Report"). */
    contentTypeName?: string
}

/** Full-width header row when grid grouping is enabled (AG Grid). */
export type DocumentLibraryGroupRow = {
    rowType: 'group'
    id: string
    level: number
    fieldKey: string
    fieldHeaderName: string
    groupValue: string
    childCount: number
    expanded: boolean
}

/** Data row in the grid when grouping is enabled (includes tree depth for indentation). */
export type DocumentLibraryDataGridRow = DocumentLibraryItemRow & {
    rowType: 'data'
    treeLevel: number
}

export type DocumentLibraryGridRow = DocumentLibraryGroupRow | DocumentLibraryDataGridRow

/** Mirrors Microsoft Graph `driveItemVersion` (no createdDateTime/comment on that type). */
export type DocumentLibraryVersion = {
    id: string
    lastModifiedDateTime?: string
    lastModifiedBy?: unknown
    size?: number
    /** Legacy / optional; not returned by Graph driveItemVersion $select. */
    createdDateTime?: string
    comment?: string
}

export type UploadFailure = {
    fileName: string
    message: string
}

export type onRefresh = () => void;

export type DocumentLibraryGraphClient = {
    getDriveItemIdByName: (params: { name: string }) => Promise<string>
    listChildren: (params: { parentDriveItemId?: string }) => Promise<DocumentLibraryItemRow[]>
    getFieldDefinitions: (params: {
        fieldKeys: string[]
    }) => Promise<DocumentLibraryFieldDefinition[]>
    getListItemFieldValues: (params: {
        itemId: string
        fieldKeys: string[]
    }) => Promise<Record<string, unknown>>
    updateListItemFields: (params: {
        itemIds: string[]
        properties: Record<string, unknown>
    }) => Promise<{ failures: FieldUpdateFailure[] }>
    deleteItem: (params: { itemId: string }) => Promise<void>
    listVersions: (params: { itemId: string }) => Promise<DocumentLibraryVersion[]>
    restoreVersion: (params: { itemId: string; versionId: string }) => Promise<void>
    uploadFiles: (params: {
        parentDriveItemId?: string
        files: File[]
        /**
         * Dialog-selected content type (currently fixed to "document", but passed through for future).
         */
        contentType: string
        /**
         * Site column values keyed by internal column name.
         */
        properties: Record<string, unknown>
        conflictBehavior?: 'rename' | 'replace' | 'fail'
    }) => Promise<{ uploadedItemIds: string[]; failures: UploadFailure[] }>;
    checkoutItem: (params: { itemId: string }) => Promise<void>;
    cancelCheckoutItem: (params: { itemId: string }) => Promise<void>;
    favoriteItem: (params: { itemId: string }) => Promise<void>;
    unfavoriteItem: (params: { itemId: string }) => Promise<void>;
}

export type {
    DocumentLibraryProps,
    DocumentLibraryPropertiesEditTarget,
    DocumentLibraryContextMenuState,
    DocumentLibraryToast,
} from "./documentLibrary";

