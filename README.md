# Docmentum

React components for building a SharePoint document library experience: browse folders and document sets, upload files, edit list item properties, view version history, and delete items. The grid is powered by [AG Grid](https://www.ag-grid.com/) and [MUI](https://mui.com/).

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start (Microsoft Graph)](#quick-start-microsoft-graph)
- [Production integration (`DocumentLibraryGrid`)](#production-integration-documentlibrarygrid)
- [Props reference](#props-reference)
- [Column configuration](#column-configuration)
- [Editable properties](#editable-properties)
- [Graph client contract](#graph-client-contract)
- [Microsoft Graph permissions](#microsoft-graph-permissions)
- [Features overview](#features-overview)
- [Development](#development)
- [Exports](#exports)

---

## Requirements

- **React** 19+
- **Peer dependencies** (must be installed in the host app):
  - `react`, `react-dom`
  - `@mui/material`, `@mui/icons-material`
  - `@emotion/react`, `@emotion/styled`
  - `ag-grid-community`, `ag-grid-react`

The host application should wrap the library in an MUI `ThemeProvider` (and optionally `CssBaseline`) so buttons, dialogs, and form controls render correctly.

AG Grid base styles are imported inside the package; no extra AG Grid CSS setup is required in the host app.

---

## Installation

Install the package and its peer dependencies:

```bash
npm install docmentum
npm install react react-dom @mui/material @mui/icons-material @emotion/react @emotion/styled ag-grid-community ag-grid-react
```

If you install from a local path or private registry, build the library first:

```bash
npm run build:lib
```

The published entry points are:

| Field    | Path                 |
|----------|----------------------|
| `main`   | `dist/index.cjs.js`  |
| `module` | `dist/index.esm.js`  |
| `types`  | `dist/index.d.ts`    |

---

## Quick start (Microsoft Graph)

Use `DocumentLibraryPlayground` when you already have a Microsoft Graph access token and want to wire up a library with minimal code. It creates a Graph client internally and renders `DocumentLibraryGrid`.

```tsx
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { DocumentLibraryPlayground } from "docmentum";

const theme = createTheme();

export function DocumentLibraryPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DocumentLibraryPlayground
        graphToken={accessToken}
        siteUrl="https://contoso.sharepoint.com/sites/MySite"
        listName="Documents"
        documentSetName="My Document Set"
        columns={{
          Title: "",
          ContentType: "",
          CreatedBy: "",
        }}
        editableProperties={{
          Title: "",
          ContentType: "",
          Queue: "",
        }}
      />
    </ThemeProvider>
  );
}
```

`graphToken` must be a valid bearer token for `https://graph.microsoft.com`. Refresh or replace it before it expires; the playground does not handle token lifecycle for you.

See [Playground props](#documentlibraryplayground-props) for all options.

---

## Production integration (`DocumentLibraryGrid`)

For full control (custom auth, caching, error handling, or a non-Graph backend), use `DocumentLibraryGrid` and pass a `DocumentLibraryGraphClient` implementation.

```tsx
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import {
  DocumentLibraryGrid,
  type DocumentLibraryColumn,
  type DocumentLibraryGraphClient,
} from "docmentum";

const theme = createTheme();

const columns: DocumentLibraryColumn[] = [
  {
    key: "Title",
    headerName: "Title",
    kind: "text",
    useDocumentClientUrl: true,
  },
  { key: "ContentType", headerName: "Content Type", kind: "text" },
  { key: "CreatedBy", headerName: "Created By", kind: "user" },
  { key: "ModifiedBy", headerName: "Last Modified", kind: "user" },
];

export function DocumentLibraryPage({
  client,
  rootFolderId,
}: {
  client: DocumentLibraryGraphClient;
  rootFolderId: string;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DocumentLibraryGrid
        client={client}
        parentDriveItemId={rootFolderId}
        libraryRootLabel="Documents"
        documentClientUrlFieldKey="DocumentClientUrl"
        columns={columns}
        editableProperties={["Title", "ContentType"]}
        uploadPrefillProperties={{ Title: "New upload" }}
      />
    </ThemeProvider>
  );
}
```

### Resolving the root folder

`parentDriveItemId` is the SharePoint **drive item ID** of the folder or document set to open initially.

- Pass `""` (empty string) to start at the library root.
- For a named document set, resolve its drive item ID first (e.g. via `client.getDriveItemIdByName({ name: "My Document Set" })`) and pass that ID as `parentDriveItemId`. Optionally set `initialSegmentName` so the breadcrumb shows the document set name.

`DocumentLibraryPlayground` performs this resolution automatically when `documentSetName` is provided.

### Reference Graph client

The package includes a reference Microsoft Graph implementation at `src/queries/graphClient.ts` (`createGraphClient`). It is used by `DocumentLibraryPlayground` but is **not** part of the public package exports today. You can:

1. Copy or adapt `createGraphClient` into your app, or
2. Implement `DocumentLibraryGraphClient` against your own API layer.

Example adapter shape (conceptual):

```ts
import type { DocumentLibraryGraphClient } from "docmentum";

export function createMyGraphClient(getAccessToken: () => Promise<string>): DocumentLibraryGraphClient {
  return {
    getDriveItemIdByName: async ({ name }) => { /* ... */ },
    listChildren: async ({ parentDriveItemId }) => { /* ... */ },
    getFieldDefinitions: async ({ fieldKeys }) => { /* ... */ },
    getListItemFieldValues: async ({ itemId, fieldKeys }) => { /* ... */ },
    updateListItemFields: async ({ itemIds, properties }) => ({ failures: [] }),
    deleteItem: async ({ itemId }) => { /* ... */ },
    listVersions: async ({ itemId }) => { /* ... */ },
    restoreVersion: async ({ itemId, versionId }) => { /* ... */ },
    uploadFiles: async ({ parentDriveItemId, files, contentType, properties }) => ({
      uploadedItemIds: [],
      failures: [],
    }),
  };
}
```

---

## Props reference

### `DocumentLibraryGrid` props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `client` | `DocumentLibraryGraphClient` | Yes | — | Data layer for list, upload, properties, versions, and delete. |
| `parentDriveItemId` | `string` | Yes | — | Drive item ID of the initial folder/document set. Use `""` for library root. |
| `documentClientUrlFieldKey` | `string` | Yes | — | SharePoint internal column name whose value is used as the document open URL (e.g. `"DocumentClientUrl"`). Falls back to `webUrl` when empty. |
| `columns` | `DocumentLibraryColumn[]` | Yes | — | Grid columns to display. See [Column configuration](#column-configuration). |
| `libraryRootLabel` | `string` | No | `"Library"` | Label for the root breadcrumb segment. |
| `initialSegmentName` | `string` | No | — | Display name for the current folder when it is not the library root (e.g. document set name). |
| `showActions` | `boolean` | No | `true` | Show per-row actions (open, version history, delete). |
| `showBreadcrumb` | `boolean` | No | `true` | Show folder breadcrumb navigation. |
| `showUploadControls` | `boolean` | No | `true` | Show upload button and upload dialog. |
| `uploadColumns` | `DocumentLibraryUploadColumn[]` | No | `[]` | Simple upload form fields when `editableProperties` is not set. Ignored when `editableProperties` is provided. |
| `editableProperties` | `unknown` | No | — | SharePoint columns editable on upload and via right-click. See [Editable properties](#editable-properties). |
| `uploadPrefillProperties` | `Record<string, unknown>` | No | — | Default field values in the upload dialog and bulk property editor. |
| `titleColumnKey` | `string` | No | — | Reserved for future use. |

### `DocumentLibraryPlayground` props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `graphToken` | `string` | Yes | — | Microsoft Graph access token. |
| `siteUrl` | `string` | Yes | — | SharePoint site URL (e.g. `https://contoso.sharepoint.com/sites/MySite`). |
| `listName` | `string` | Yes | — | Document library **display name** (list title). |
| `contentTypesLibrary` | `string` | No | `"ContentTypesLibraryTest"` | Secondary list used to populate Content Type dropdown choices. |
| `documentSetName` | `string` | No | — | If set, resolves this document set and opens the grid inside it. |
| `columns` | `unknown` | No | Built-in defaults | Column keys to show. See [Column configuration](#column-configuration). |
| `editableProperties` | `unknown` | No | `["Title"]` | Columns editable on upload and via context menu. |
| `showActions` | `boolean` | No | `true` | Passed through to `DocumentLibraryGrid`. |
| `showBreadcrumb` | `boolean` | No | `true` | Passed through to `DocumentLibraryGrid`. |
| `showUploadControls` | `boolean` | No | `true` | Passed through to `DocumentLibraryGrid`. |

---

## Column configuration

### `DocumentLibraryColumn`

```ts
type DocumentLibraryColumn = {
  key: string;           // SharePoint internal column name (e.g. "Title", "ContentType")
  headerName: string;    // Column header in the grid
  kind?: "text" | "date" | "number" | "user" | "link";
  useDocumentClientUrl?: boolean;  // Render as link using documentClientUrlFieldKey / webUrl
};
```

### Flexible column input (playground)

`DocumentLibraryPlayground` accepts several shorthand forms for `columns`:

**Object map** (keys are column names; values can be empty strings or label overrides):

```ts
columns={{
  Title: "",
  ContentType: "",
  CreatedBy: "",
}}
```

**String array:**

```ts
columns={["Title", "ContentType", "CreatedBy"]}
```

**Full column objects** (use with `DocumentLibraryGrid`):

```ts
columns={[
  { key: "Title", headerName: "Title", kind: "text", useDocumentClientUrl: true },
  { key: "Queue", headerName: "Queue", kind: "text" },
]}
```

Common column keys are normalized automatically (`createdby` → `CreatedBy`, `contenttype` → `ContentType`, etc.).

---

## Editable properties

When `editableProperties` is set, the library:

1. Loads field definitions from the client (`getFieldDefinitions`) and renders appropriate controls (text, choice, date, etc.).
2. Enables **right-click → Edit properties** on rows.
3. Enables **bulk edit** on grouped rows (when grouping is active).
4. Replaces `uploadColumns` with schema-driven upload fields.

Accepted shapes (same as column shorthand):

```ts
// Array of internal column names
editableProperties={["Title", "ContentType", "Queue"]}

// Object map (optional string values are label overrides)
editableProperties={{
  Title: "",
  ContentType: "",
  Queue: "Queue name",
}}

// Explicit objects
editableProperties={[
  { key: "Title", label: "Document title" },
  { key: "Queue" },
]}
```

Use `uploadPrefillProperties` to pre-fill values on upload or bulk edit:

```ts
uploadPrefillProperties={{ Title: "New upload", Queue: "Default" }}
```

---

## Graph client contract

Implement `DocumentLibraryGraphClient` to connect the UI to your backend. All methods are async.

### `getDriveItemIdByName`

Resolve a drive item ID by path/name (used for document sets).

```ts
getDriveItemIdByName(params: { name: string }): Promise<string>
```

### `listChildren`

List items in a folder. Return rows the grid can render.

```ts
listChildren(params: { parentDriveItemId?: string }): Promise<DocumentLibraryItemRow[]>
```

Each `DocumentLibraryItemRow`:

```ts
type DocumentLibraryItemRow = {
  itemId: string;
  name: string;
  webUrl?: string;
  isContainer?: boolean;       // true for folders / document sets
  fields: Record<string, unknown>;  // keys match your column keys
  createdByDisplayName?: string;
  modifiedByDisplayName?: string;
  documentClientUrl?: string;
  contentTypeName?: string;
};
```

### `getFieldDefinitions`

Return metadata for editable columns (control type, choices, labels).

```ts
getFieldDefinitions(params: { fieldKeys: string[] }): Promise<DocumentLibraryFieldDefinition[]>
```

### `getListItemFieldValues`

Load current values when opening the properties drawer for a single item.

```ts
getListItemFieldValues(params: {
  itemId: string;
  fieldKeys: string[];
}): Promise<Record<string, unknown>>
```

### `updateListItemFieldValues`

Patch list item fields for one or many items.

```ts
updateListItemFields(params: {
  itemIds: string[];
  properties: Record<string, unknown>;
}): Promise<{ failures: FieldUpdateFailure[] }>
```

### `deleteItem`

Delete a drive item.

```ts
deleteItem(params: { itemId: string }): Promise<void>
```

### `listVersions` / `restoreVersion`

Power the version history dialog.

```ts
listVersions(params: { itemId: string }): Promise<DocumentLibraryVersion[]>
restoreVersion(params: { itemId: string; versionId: string }): Promise<void>
```

### `uploadFiles`

Upload one or more files with metadata.

```ts
uploadFiles(params: {
  parentDriveItemId?: string;
  files: File[];
  contentType: string;
  properties: Record<string, unknown>;
  conflictBehavior?: "rename" | "replace" | "fail";
}): Promise<{ uploadedItemIds: string[]; failures: UploadFailure[] }>
```

Return partial failures in `failures` rather than throwing when individual files fail, so the UI can show a useful message.

---

## Microsoft Graph permissions

When using Microsoft Graph directly, typical delegated permissions include:

| Permission | Used for |
|------------|----------|
| `Sites.Read.All` or `Sites.ReadWrite.All` | Resolve site, list, columns, list item fields |
| `Files.Read.All` or `Files.ReadWrite.All` | List children, versions, upload, delete |

Exact scopes depend on whether your app reads only or also uploads, edits metadata, and deletes files. Request the minimum set required for your scenario.

`siteUrl` must be the full SharePoint site URL. `listName` must match the library’s **display name** as returned by Graph (`lists?$filter=displayName eq '...'`).

---

## Features overview

| Feature | Behavior |
|---------|----------|
| **Folder navigation** | Click folder/document set names to drill in; use breadcrumbs to go back. |
| **Grouping** | Group-by dropdown in the toolbar (default: Content Type). Supports expand/collapse and bulk selection. |
| **Upload** | Select files → metadata dialog → upload via `client.uploadFiles`. |
| **Properties** | Right-click a row (when `editableProperties` is set) to edit fields. |
| **Bulk properties** | Right-click a group header to edit selected items in that group. |
| **Version history** | Per-file version list and restore (non-container items). |
| **Delete** | Confirm dialog, then `client.deleteItem`. |

---

## Development

```bash
# Install dependencies
npm install

# Local demo app
npm run dev

# Storybook (includes DocumentLibraryPlayground)
npm run storybook

# Build library for publishing
npm run build:lib
```

Storybook runs on port `6006` by default and is useful for trying props interactively.

---

## Exports

```ts
export { DocumentLibraryGrid } from "docmentum";
export { DocumentLibraryPlayground } from "docmentum";
export * from "docmentum"; // types: DocumentLibraryGraphClient, DocumentLibraryColumn, etc.
```

`DocumentLibraryGrid` is the default export from the underlying module aliased as above in `src/index.ts`.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Grid is empty | `parentDriveItemId`, Graph token expiry, and `listChildren` return shape. |
| Columns show blank | `fields` on each row must include keys matching `columns[].key`. |
| Content Type edit fails | Content type name must exist on the **target** library; IDs from another list are not applied. |
| Upload disabled | Upload requires a resolved folder ID (`parentDriveItemId` non-empty after navigation). |
| Styles look wrong | Ensure MUI `ThemeProvider` wraps the component tree. |

For questions or issues, refer to the Storybook examples in `src/App.stories.tsx` or open an issue in your team’s repository.
