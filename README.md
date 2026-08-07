# Docmentum

SharePoint document library UI for React --- browse folders, upload,
edit properties, version history, delete, and perform document actions
such as checkout, cancel checkout, export, copy URL, and add to
favorites. Built with MUI and AG Grid.

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
        siteUrl="https://genstargenesis.sharepoint.com/sites/Indexing-Dev"
        listName="Documents"
        documentSetName="My Document Set"
        documentType="library"
        userEmail={auth.email}
        columns={{ Title: "", ContentType: "", CreatedBy: "" }}
        editableProperties={{ Title: "", ContentType: "" }}
        showRowCheckbox
        showToolbar
        actions={{
          editDocumentProperties: true,
          checkoutDocuments: true,
          cancelDocumentCheckout: true,
          deleteDocuments: true,
          exportDocuments: true,
          copyDocumentUrls: true,
          addDocumentsToFavorites: true,
        }}
        onSelectionChange={(rows) => {
          console.log("Selected rows:", rows);
        }}
        onActionLoadingChange={setActionLoading}
      />
    </ThemeProvider>
  );
}
```

---

Prop Description

---

`graphToken` Microsoft Graph bearer token

`siteUrl` SharePoint site URL

`listName` Library display name

`documentSetName` Optional --- opens inside this document
set

`columns` Columns to show (see below)

`editableProperties` Fields editable on upload / right-click

`contentTypesLibrary` List for Content Type choices (default:
`ContentTypesLibraryTest`)

`showActions` / UI toggles (default: `true`)
`showBreadcrumb` /  
 `showUploadControls`

`showRowCheckbox` Shows checkboxes for selecting documents

`onSelectionChange` Returns the currently selected document
rows

`showToolbar` Controls whether the document action
toolbar is displayed

`actions` Controls which document actions are
available in the action menu

`onActionLoadingChange` Notifies the consuming application when
a document action starts or finishes

`documentType` Document source to display: `library`,
`favorites`, or `checkout`

`userEmail` Current user's email. Used to resolve
the site-specific SharePoint user ID for
Checked Out Docs

`gridHeight` Optional grid height (`number` or CSS
string). Defaults to
`calc(100vh - 230px)` when not supplied

`externalRows` Optional array of document rows supplied by
the consuming application. When provided, the
grid displays these rows instead of loading
documents from SharePoint. Existing grid
features such as grouping, selection, filtering,
and document actions continue to work.

`onFavorite` Optional callback invoked when the user adds
selected documents to favorites. Receives the
selected `itemIds`. When provided, this
replaces the built-in Graph favorite call so
the consuming application can wire its own
API.

`onUnfavorite` Optional callback invoked when the user
removes selected documents from favorites.
Receives the selected `itemIds`. When
provided, this replaces the built-in Graph
unfavorite call.

`favoriteItemIDs` Optional array of item IDs used to populate
the `favorites` view (`documentType="favorites"`)
when the consuming application supplies its
own list of favorited item IDs instead of
relying on Graph's `/me/drive/following`.

---

## External document rows

By default, `DocumentWrapper` loads documents directly from SharePoint using
the configured Graph client.

For scenarios such as Advanced Search, where the consuming application has
already retrieved a filtered result set, you can provide those rows directly
using `externalRows`.

```tsx
<DocumentWrapper
  graphToken={accessToken}
  siteUrl={siteUrl}
  listName="Documents"
  externalRows={searchResults}
/>
```

## Document actions

Document actions can be enabled or disabled dynamically by the consuming
application.

```tsx
<DocumentWrapper
  showToolbar
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

- Edit Properties
- Checkout Selected Docs
- Cancel Checkout Selected Docs
- Delete Selected Docs
- Export Selected Docs
- Copy URL of Selected Docs
- Add Selected Docs to Favorites

Each action can be controlled independently by passing `true` or
`false`.

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

## Grid height and infinite loading

The document grid uses a bounded, scrollable layout and supports
incremental loading for large result sets. By default, the grid height
is `calc(100vh - 230px)`, allowing it to use the available viewport
while leaving space for the surrounding page controls and toolbar.

For `documentType="library"`, the package loads the first Microsoft
Graph page immediately and keeps the returned `@odata.nextLink`. When
the user approaches the bottom of the grid, the next Graph page is
requested and appended to the existing rows. This avoids loading every
document in a large document set before rendering the grid.

The default height can be overridden by the consuming application:

```tsx
<DocumentWrapper documentType="library" gridHeight={600} />
```

CSS height values are also supported:

```tsx
<DocumentWrapper documentType="library" gridHeight="70vh" />
```

For library/document-set views, the total immediate child count is
loaded separately from the drive item's `folder.childCount`. This allows
the grid to display the full document count even while the rows
themselves are loaded incrementally.

For `documentType="checkout"`, checked-out documents are also loaded
incrementally. The initial query returns the first page of checked-out
documents and subsequent pages are loaded using Graph's
`@odata.nextLink` as the user scrolls.

The checkout count is intentionally not displayed. The filtered Graph
list-items query used for checked-out documents does not provide an
inexpensive exact total count, and loading every page only to calculate
the count would defeat the purpose of incremental loading.

`documentType="favorites"` retains its existing loading behavior.

## Checked out documents by user

Set `documentType="checkout"` and pass the current user's email to
display only documents checked out by that user.

```tsx
<DocumentWrapper
  graphToken={accessToken}
  siteUrl="https://genstargenesis.sharepoint.com/sites/Claims-GeneralStar-Dev"
  listName="Documents"
  documentType="checkout"
  userEmail={auth.email}
/>
```

SharePoint user lookup IDs are site-specific, so the consuming
application does not need to provide a SharePoint user ID. When the
checkout view is loaded, the package uses `userEmail` to resolve the
current user's SharePoint user ID for the configured site.

The package first finds the site's SharePoint User Information List and
queries the current user directly by email. The resolved site-specific
user ID is cached and then used to load the user's checked-out documents
by filtering the document library on `CheckoutUserLookupId`.

For large document libraries, `CheckoutUserLookupId` should be indexed
in SharePoint so the checked-out document query can be performed
efficiently on the server.

The checkout flow is:

1.  `userEmail` identifies the current user.
2.  The package resolves the user's SharePoint lookup ID for the
    configured `siteUrl`.
3.  The site-specific lookup ID is cached for subsequent requests.
4.  The package queries the document library using the indexed
    `CheckoutUserLookupId` field.
5.  The first page of matching documents is displayed immediately.
6.  If Graph returns an `@odata.nextLink`, additional pages are loaded
    and appended as the user approaches the bottom of the grid.
7.  Only documents checked out by the current user are displayed.

This allows the same user to work across different SharePoint sites even
when their SharePoint lookup ID differs between sites.

The checkout query currently requests up to 200 items per page.
Subsequent pages use the `@odata.nextLink` returned by Microsoft Graph
rather than rebuilding the paging URL.

When `documentType` is not `checkout`, the existing library and
favorites behavior remains unchanged.

## External action loading state

The consuming application can manage its own loader while document
actions are running.

```tsx
const [actionLoading, setActionLoading] = useState(false);

<DocumentWrapper onActionLoadingChange={setActionLoading} />;
```

`onActionLoadingChange(true)` is called when an action starts and
`onActionLoadingChange(false)` when it finishes.

## Production (`DocumentLibraryGrid`)

Use when you control auth and data. Pass a `DocumentLibraryGraphClient`
implementation.

```tsx
import { DocumentLibraryGrid, type DocumentLibraryColumn } from "docmentum";

const columns: DocumentLibraryColumn[] = [
  { key: "Title", headerName: "Title", useDocumentClientUrl: true },
  { key: "ContentType", headerName: "Content Type" },
];

<DocumentLibraryGrid
  client={myClient}
  parentDriveItemId={folderId}
  documentClientUrlFieldKey="DocumentClientUrl"
  columns={columns}
  editableProperties={["Title", "ContentType"]}
  libraryRootLabel="Documents"
/>;
```

---

Prop Required Description

---

`documentType` No Document source: `library`,
`favorites`, or `checkout`

`userEmail` No Current user's email used to
resolve the site-specific
SharePoint user ID for checkout
documents

`client` Yes Data adapter (see below)

`parentDriveItemId` Yes Drive item ID of starting folder
(`""` for root)

`documentClientUrlFieldKey` Yes SharePoint column for document
open URL

`columns` Yes Grid columns

`editableProperties` No Enables upload + right-click
property edit

`uploadPrefillProperties` No Default values for upload / bulk
edit

`uploadColumns` No Simple upload fields (ignored if
`editableProperties` set)

`libraryRootLabel` No Breadcrumb root label (default:
`"Library"`)

`initialSegmentName` No Breadcrumb label for current
folder

`showActions` / No UI toggles (default: `true`)
`showBreadcrumb` /  
 `showUploadControls`

`showRowCheckbox` No Shows checkboxes for document
selection

`onSelectionChange` No Returns the currently selected
document rows

`showToolbar` No Shows the document action
toolbar

`actions` No Controls available document
actions

`onActionLoadingChange` No Reports document action loading
state to the consuming
application

`gridHeight` No Grid height as a number (pixels)
or CSS height string. Defaults
to `calc(100vh - 230px)`

---

## Columns & editable fields

`columns` and `editableProperties` accept:

- Object map: `{ Title: "", Queue: "Queue label" }`
- String array: `["Title", "ContentType"]`
- Typed array (grid only):
  `{ key, headerName, kind?, useDocumentClientUrl? }`

`kind`: `text` \| `date` \| `number` \| `user` \| `link`

## Graph client

Implement `DocumentLibraryGraphClient` (exported types from
`docmentum`):

---

Method Purpose

---

`listChildren` Load folder contents using the
legacy/full-load flow

`listChildrenPage` Load one folder/document-set page
for infinite scrolling

`getChildrenCount` Load the total immediate child
count for a folder/document set

`listCheckoutDocumentsPage` Load one page of the current
user's checked-out documents

`getDriveItemIdByName` Resolve document set by name

`getFieldDefinitions` Field metadata for forms

`getListItemFieldValues` Load properties for edit drawer

`updateListItemFields` Save properties (single or bulk)

`uploadFiles` Upload with metadata

`listVersions` / `restoreVersion` Version history

`checkoutItem` Checkout a document

`cancelCheckoutItem` Cancel document checkout

`deleteItem` Delete a file or folder

`downloadItem` Download/export a document

---

Reference implementation: `src/queries/graphClient.ts`
(`createGraphClient` --- used by Playground, not exported from package
entry).

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
import { DocumentWrapper } from "@genre-g2docs/common-wrapper-document-library";
import type {
  DocumentLibraryGraphClient,
  DocumentLibraryColumn,
} from "@genre-g2docs/common-wrapper-document-library";
```
