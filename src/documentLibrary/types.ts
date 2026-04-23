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

export type DocumentLibraryGraphClient = {
    getDriveItemIdByName: (params: { name: string }) => Promise<string>
    listChildren: (params: { parentDriveItemId?: string }) => Promise<DocumentLibraryItemRow[]>
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
    }) => Promise<{ uploadedItemIds: string[]; failures: UploadFailure[] }>
}

