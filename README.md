# Docmentum

SharePoint document library UI for React --- browse folders, upload,
edit properties, version history, delete, and perform document actions
such as checkout, check-in, cancel checkout, export, copy URL, and add
or remove favorites. Built with MUI and AG Grid.

The grid supports grouping, row selection, infinite scrolling, host-supplied
search results, and role-based permissions (`admin`, `importer`, `viewer`).

## Install

```bash
npm install docmentum react react-dom @mui/material @mui/icons-material @emotion/react @emotion/styled ag-grid-community ag-grid-react
```

Build from source: `npm run build:lib`

Wrap your app in MUI `ThemeProvider` (AG Grid CSS is included in the
package).

## Quick start (Graph token)

```tsx
import { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { DocumentWrapper } from "docmentum";

export function Library() {
  const [actionLoading, setActionLoading] = useState(false);

  return (
    <ThemeProvider theme={createTheme()}>
      <DocumentWrapper
        graphToken={accessToken}
        siteUrl="https://contoso.sharepoint.com/sites/Claims-Dev"
        listName="Documents"
        documentSetName="My Document Set"
        documentType="library"
        userEmail={auth.email}
        userRole="admin"
        dashboardName="Library"
        dropdownList="ClaimDocIdentifier"
        columns={{ Title: "", ContentType: "", CreatedBy: "" }}
        editableProperties={[
          {
            key: "DocumentName",
            displayName: "Document Name",
            group: "document",
            required: true,
            columnType: "text",
          },
          {
            key: "DocumentType",
            displayName: "Document Type",
            group: "document",
            columnType: "choice",
          },
        ]}
        showRowCheckbox
        showToolbar
        actions={{
          editDocumentProperties: true,
          checkoutDocuments: true,
          checkinDocuments: true,
          cancelDocumentCheckout: true,
          deleteDocuments: true,
          exportDocuments: true,
          copyDocumentUrls: true,
          addDocumentsToFavorites: true,
          removeDocumentsToFavorites: true,
        }}
        onSelectionChange={(rows) => {
          console.log("Selected rows:", rows);
        }}
        onActionLoadingChange={setActionLoading}
        onFavorite={async (itemIds) => {
          await myApi.addFavorites(itemIds);
        }}
        onUnfavorite={async (itemIds) => {
          await myApi.removeFavorites(itemIds);
        }}
        onDeleteDocuments={async (itemIds, docSetId) => {
          await myApi.deleteDocuments(itemIds, docSetId);
        }}
      />
    </ThemeProvider>
  );
}
```

---

## `DocumentWrapper` props

| Prop                                                    | Description                                                                                                                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `graphToken`                                            | Microsoft Graph bearer token                                                                                                                                                         |
| `siteUrl`                                               | SharePoint site URL                                                                                                                                                                  |
| `listName`                                              | Library display name                                                                                                                                                                 |
| `documentSetName`                                       | Optional --- opens inside this document set                                                                                                                                          |
| `columns`                                               | Columns to show (see [Columns](#columns--editable-fields))                                                                                                                           |
| `editableProperties`                                    | Host-owned properties form schema used on upload and right-click edit                                                                                                                |
| `dropdownList`                                          | Config list whose column values populate Document Type choices and related derived fields (for example `ClaimDocIdentifier`)                                                         |
| `contentTypesLibrary`                                   | List for Content Type choices (default: `ContentTypesLibraryTest`)                                                                                                                   |
| `showActions` / `showBreadcrumb` / `showUploadControls` | UI toggles (default: `true`)                                                                                                                                                         |
| `showRowCheckbox`                                       | Shows checkboxes for selecting documents (default: `true` on `DocumentWrapper`)                                                                                                      |
| `onSelectionChange`                                     | Returns the currently selected document rows                                                                                                                                         |
| `showToolbar`                                           | Controls whether the document action toolbar is displayed (default: `false`)                                                                                                         |
| `dashboardName`                                         | Title shown next to the toolbar hamburger menu                                                                                                                                       |
| `actions`                                               | Controls which document actions are available in the action menu                                                                                                                     |
| `onActionLoadingChange`                                 | Notifies the host when a document action starts or finishes                                                                                                                          |
| `documentType`                                          | Document source: `library`, `favorites`, or `checkout`                                                                                                                               |
| `userEmail`                                             | Current user's email. Used to resolve checkout user ID and Importer delete ownership                                                                                                 |
| `userRole`                                              | Current user's role: `admin`, `importer`, or `viewer`                                                                                                                                |
| `onDeleteDocuments`                                     | Importer-only delete callback. Host handles delete via its private API. Receives owned item IDs and the parent document set drive item ID (`docSetId`). Called once per document set |
| `gridHeight`                                            | Optional grid height (`number` or CSS string). Defaults to `calc(100vh - 230px)`                                                                                                     |
| `externalRows`                                          | Optional rows supplied by the host. When provided, the grid displays these instead of loading from SharePoint                                                                        |
| `externalTotalCount`                                    | Optional total count for host-supplied rows                                                                                                                                          |
| `externalHasMore`                                       | Optional flag indicating more host-supplied rows are available                                                                                                                       |
| `onLoadMoreExternal`                                    | Optional callback used to load the next page of host-supplied rows                                                                                                                   |
| `onFavorite`                                            | Optional callback when the user favorites selected documents. Receives `itemIds`. Replaces the built-in Graph favorite call                                                          |
| `onUnfavorite`                                          | Optional callback when the user unfavorites selected documents. Receives `itemIds`. Replaces the built-in Graph unfavorite call                                                      |
| `favoriteItemIDs`                                       | Optional item IDs used to populate the `favorites` view when the host supplies its own favorite list                                                                                 |

---

## User roles

Pass `userRole` to restrict import, restore, and delete. Unknown or omitted
roles are treated as view-only for those operations.

| Role       | Import | Restore versions  | Delete                                                                               |
| ---------- | ------ | ----------------- | ------------------------------------------------------------------------------------ |
| `admin`    | Yes    | Yes               | Any document, via Microsoft Graph                                                    |
| `importer` | Yes    | Yes               | Only documents the current user imported. Delete is delegated to `onDeleteDocuments` |
| `viewer`   | No     | View history only | No                                                                                   |

```tsx
<DocumentWrapper
  userRole="importer"
  userEmail={auth.email}
  onDeleteDocuments={async (itemIds, docSetId) => {
    await myApi.deleteDocuments(itemIds, docSetId);
  }}
/>
```

Importer delete rules:

- The Delete action is shown only when `actions.deleteDocuments` is enabled
  and the role is `admin` or `importer`.
- An Importer can delete a document only when `userEmail` matches the
  document's `createdByEmail`.
- Mixed selections still open the delete dialog. Documents the Importer did
  not import are listed as skipped and are not deleted.
- If `onDeleteDocuments` is missing for an Importer, delete is rejected with
  an error toast.
- `docSetId` is the parent document set's Graph drive item ID. When the
  selection spans more than one document set, the callback is invoked once
  per set.

Viewers can open version history but cannot restore. Upload controls are
hidden for viewers.

---

## Document actions

Document actions can be enabled or disabled independently by the host.

```tsx
<DocumentWrapper
  showToolbar
  dashboardName="Library"
  actions={{
    editDocumentProperties: true,
    bulkUpdateClaimIDForSelectedDocuments: true,
    checkoutDocuments: true,
    checkinDocuments: true,
    cancelDocumentCheckout: true,
    deleteDocuments: true,
    exportDocuments: true,
    copyDocumentUrls: true,
    addDocumentsToFavorites: true,
    removeDocumentsToFavorites: true,
  }}
/>
```

Available actions:

- Edit Properties of Selected Docs
- Bulk Update Claim ID of Selected Docs
- Checkin Selected Docs
- Checkout Selected Docs
- Cancel Checkout Selected Docs
- Delete Selected Docs
- Export Selected Docs
- Copy URL of Selected Docs
- Add Selected Docs to Favorites
- Remove Selected Docs to Favorites

The toolbar hamburger is disabled until at least one document is selected.
Favorites and checkout views are flat dashboards: folder navigation,
breadcrumb, and upload controls are hidden.

## Selected rows

Use `onSelectionChange` to access the currently selected documents
outside the package.

```tsx
<DocumentWrapper
  showRowCheckbox
  onSelectionChange={(rows) => {
    console.log("Selected documents:", rows);
  }}
/>
```

---

## Grouping

Library views group by `ContentType` by default. Users can change the group
column from the Group By menu, or clear grouping.

When grouping is on:

- Group rows can be expanded and collapsed.
- Checkboxes select an entire group or individual documents.
- Right-click a group header to bulk-edit properties for that group.

Favorites and checkout views still support grouping, but remain flat (no
folder drill-in).

---

## Columns & editable fields

`columns` accepts:

- Object map: `{ Title: "", Queue: "Queue label" }`
- String array: `["Title", "ContentType"]`
- Comma-separated string: `"Name, ClaimID, CreatedBy"`
- Typed array (grid only): `{ key, headerName, kind?, useDocumentClientUrl? }`

`kind`: `text` \| `date` \| `number` \| `user` \| `link`

`editableProperties` is the host-owned form schema for upload and edit.
Accepted shapes:

- Rich array:

```tsx
editableProperties={[
  {
    key: "DocumentName",
    displayName: "Document Name",
    group: "document",
    readOnly: false,
    required: true,
    columnType: "text",
  },
  {
    key: "DocumentType",
    displayName: "Document Type",
    group: "document",
    columnType: "choice",
  },
  {
    key: "ClaimID",
    displayName: "Claim ID",
    group: "claim",
    readOnly: true,
    columnType: "text",
  },
]}
```

- String array: `["Title", "ContentType"]`
- Object map: `{ Title: "", DocumentType: "Document Type" }`

`columnType`: `text` \| `multiline` \| `choice` \| `number` \| `dateTime` \| `boolean`

`group` controls the form section. Known groups:

- `document` --- Document Information
- `claim` --- Claim Information
- `enterprise` --- Enterprise Information

Choice fields such as Document Type can be populated from `dropdownList`.
Selecting a Document Type copies related values onto matching form fields
(Category, SubCategory, Workflow, Company, and similar).

Document Name is validated against sibling documents in the same document
set on both upload and edit. Duplicate names are rejected with
`Document name cannot be the same.`

Upload is a two-step flow: file selection, then the properties drawer.
When multiple files are selected, Save & Next walks through each file.

---

## External document rows

By default, `DocumentWrapper` loads documents directly from SharePoint using
the configured Graph client.

For Advanced Search, where the host already has a filtered result set, pass
those rows with `externalRows`.

```tsx
<DocumentWrapper
  graphToken={accessToken}
  siteUrl={siteUrl}
  listName="Documents"
  externalRows={searchResults}
  externalTotalCount={totalMatches}
  externalHasMore={hasNextPage}
  onLoadMoreExternal={loadNextSearchPage}
/>
```

External rows are used only on the initial search page. Once the user opens
a Claim ID / document set, the grid loads that folder's children from
Microsoft Graph.

When `externalTotalCount`, `externalHasMore`, and `onLoadMoreExternal` are
omitted, the grid keeps the previous non-paginated behavior and shows
`externalRows.length` as the count.

---

## Favorites

Favorites are host-owned. Pass `favoriteItemIDs` to populate
`documentType="favorites"`, and handle add/remove with `onFavorite` /
`onUnfavorite`.

```tsx
<DocumentWrapper
  documentType="favorites"
  dashboardName="Favorites"
  favoriteItemIDs={favoriteIds}
  onFavorite={async (itemIds) => {
    await myApi.addFavorites(itemIds);
  }}
  onUnfavorite={async (itemIds) => {
    await myApi.removeFavorites(itemIds);
  }}
/>
```

The package loads those drive items in Graph `$batch` requests. It does not
call Graph's `/me/drive/following`.

---

## Grid height and infinite loading

The document grid uses a bounded, scrollable layout and supports
incremental loading for large result sets. By default, the grid height
is `calc(100vh - 230px)`.

For `documentType="library"`, the package loads the first Microsoft
Graph page immediately and keeps the returned `@odata.nextLink`. When
the user approaches the bottom of the grid, the next Graph page is
requested and appended to the existing rows.

```tsx
<DocumentWrapper documentType="library" gridHeight={600} />
<DocumentWrapper documentType="library" gridHeight="70vh" />
```

For library / document-set views, the total immediate child count is
loaded separately from the drive item's `folder.childCount`. This allows
the grid to display the full document count even while the rows
themselves are loaded incrementally.

For `documentType="checkout"`, checked-out documents are also loaded
incrementally. The checkout count is intentionally not displayed: the
filtered Graph list-items query does not provide an inexpensive exact
total, and loading every page only to calculate the count would defeat
incremental loading.

`documentType="favorites"` loads the host-supplied `favoriteItemIDs` in
batches and does not page with `@odata.nextLink`.

---

## Checked out documents by user

Set `documentType="checkout"` and pass the current user's email to
display only documents checked out by that user.

```tsx
<DocumentWrapper
  graphToken={accessToken}
  siteUrl="https://contoso.sharepoint.com/sites/Claims-Dev"
  listName="Documents"
  documentType="checkout"
  userEmail={auth.email}
/>
```

SharePoint user lookup IDs are site-specific, so the host does not need
to provide a SharePoint user ID. When the checkout view is loaded, the
package uses `userEmail` to resolve the current user's SharePoint user ID
for the configured site.

The package first finds the site's SharePoint User Information List and
queries the current user directly by email. The resolved site-specific
user ID is cached and then used to load the user's checked-out documents
by filtering the document library on `CheckoutUserLookupId`.

For large document libraries, `CheckoutUserLookupId` should be indexed
in SharePoint so the checked-out document query can be performed
efficiently on the server.

The checkout flow is:

1. `userEmail` identifies the current user.
2. The package resolves the user's SharePoint lookup ID for the
   configured `siteUrl`.
3. The site-specific lookup ID is cached for subsequent requests.
4. The package queries the document library using the indexed
   `CheckoutUserLookupId` field.
5. The first page of matching documents is displayed immediately.
6. If Graph returns an `@odata.nextLink`, additional pages are loaded
   and appended as the user approaches the bottom of the grid.
7. Only documents checked out by the current user are displayed.

The checkout query currently requests up to 200 items per page.
Subsequent pages use the `@odata.nextLink` returned by Microsoft Graph
rather than rebuilding the paging URL.

---

## External action loading state

The host can manage its own loader while document actions are running.

```tsx
const [actionLoading, setActionLoading] = useState(false);

<DocumentWrapper onActionLoadingChange={setActionLoading} />;
```

`onActionLoadingChange(true)` is called when an action starts and
`onActionLoadingChange(false)` when it finishes.

---

## Graph client

Implement `DocumentLibraryGraphClient` (exported types from the package)
when you need a custom data adapter. The built-in Graph client used by
`DocumentWrapper` lives at `src/queries/index.ts`
(`createGraphClient`).

| Method                            | Purpose                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `listChildren`                    | Load folder contents (used for duplicate-name checks)                                      |
| `listChildrenPage`                | Load one folder / document-set page for infinite scrolling                                 |
| `getChildrenCount`                | Load the total immediate child count for a folder / document set                           |
| `getParentDriveItemId`            | Resolve a document's parent folder                                                         |
| `listFavorites`                   | Load favorited items from `favoriteItemIDs`                                                |
| `listCheckoutDocumentsPage`       | Load one page of the current user's checked-out documents                                  |
| `getDriveItemIdByName`            | Resolve a document set by name                                                             |
| `getFieldDefinitions`             | Field metadata for forms                                                                   |
| `getListItemFieldValues`          | Load properties for the edit drawer                                                        |
| `updateListItemFields`            | Save properties (single or bulk)                                                           |
| `uploadFiles`                     | Upload with metadata                                                                       |
| `listVersions` / `restoreVersion` | Version history                                                                            |
| `checkoutItem`                    | Checkout a document                                                                        |
| `checkinItem`                     | Check in a document                                                                        |
| `cancelCheckoutItem`              | Cancel document checkout                                                                   |
| `deleteItem`                      | Delete a file or folder (Admin)                                                            |
| `downloadItem`                    | Download / export a document                                                               |
| `favoriteItem` / `unfavoriteItem` | Built-in Graph favorite helpers (hosts usually pass `onFavorite` / `onUnfavorite` instead) |

**Graph permissions (typical):** `Sites.Read.All` or
`Sites.ReadWrite.All`, `Files.Read.All` or `Files.ReadWrite.All`.

## Scripts

```bash
npm run dev          # local app
npm run storybook    # interactive demo (port 6006)
npm run build:lib    # publishable dist/
```

## Exports

```ts
import { DocumentWrapper } from "docmentum";
import type {
  DocumentLibraryGraphClient,
  DocumentLibraryColumn,
  DocumentLibraryItemRow,
  DocumentLibraryActions,
  DocumentLibraryUserRole,
} from "docmentum";
```

The published package name may also be
`@genre-g2docs/common-wrapper-document-library`.
