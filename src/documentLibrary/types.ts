export type DocumentLibraryColumnKind = 'text' | 'date' | 'number' | 'user' | 'link'

export type DocumentLibraryColumn = {
  key: string
  headerName: string
  kind?: DocumentLibraryColumnKind
  /**
   * If true, the cell renders a link to `documentClientUrl`.
   * Useful for "Title" columns.
   */
  useDocumentClientUrl?: boolean
}

export type DocumentLibraryUploadColumn = {
  key: string
  label: string
  inputType?: 'text' | 'number' | 'date'
}

export type DocumentLibraryItemRow = {
  itemId: string
  name: string
  webUrl?: string
  /**
   * SharePoint list item field values.
   * Keys should match the internal column names you're passing in via `columns`.
   */
  fields: Record<string, unknown>
  createdByDisplayName?: string
  modifiedByDisplayName?: string
  documentClientUrl?: string
}

export type DocumentLibraryVersion = {
  id: string
  createdDateTime?: string
  lastModifiedDateTime?: string
  size?: number
  comment?: string
}

export type UploadFailure = {
  fileName: string
  message: string
}

export type SharePointColumnOption = {
  key: string
  headerName: string
  kind?: DocumentLibraryColumnKind
}

export type DocumentLibraryGraphClient = {
  getDriveItemIdByName: (params: { name: string }) => Promise<string>
  listAvailableColumns: () => Promise<SharePointColumnOption[]>
  listChildren: (params: {
    parentDriveItemId?: string
    selectedColumnKeys?: string[]
  }) => Promise<DocumentLibraryItemRow[]>
  deleteItem: (params: { itemId: string }) => Promise<void>
  listVersions: (params: { itemId: string }) => Promise<DocumentLibraryVersion[]>
  restoreVersion: (params: { itemId: string; versionId: string }) => Promise<void>
  uploadFiles: (params: {
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

