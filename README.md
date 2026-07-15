# common-wrapper-document-library

SharePoint document library UI for React — browse folders, upload, edit properties, version history, and delete. Built with MUI and AG Grid.

## Install

```bash
npm install common-wrapper-document-library react react-dom @mui/material @mui/icons-material @emotion/react @emotion/styled ag-grid-community ag-grid-react
```

Build from source: `npm run build:lib`

Wrap your app in MUI `ThemeProvider` (AG Grid CSS is included in the package).

## Quick start

```tsx
import { ThemeProvider, createTheme } from "@mui/material";
import { DocumentWrapper } from "common-wrapper-document-library";

export function Library() {
  return (
    <ThemeProvider theme={createTheme()}>
      <DocumentWrapper
        graphToken={accessToken}
        siteUrl="https://contoso.sharepoint.com/sites/MySite"
        listName="Documents"
        documentSetName="My Document Set"
        columns={{ Title: "", ContentType: "", CreatedBy: "" }}
        editableProperties={{ Title: "", ContentType: "" }}
      />
    </ThemeProvider>
  );
}
```

| Prop | Description |
|------|-------------|
| `graphToken` | Microsoft Graph bearer token |
| `siteUrl` | SharePoint site URL |
| `listName` | Library display name |
| `documentSetName` | Optional — opens inside this document set |
| `columns` | Columns to show (see below) |
| `editableProperties` | Fields editable on upload / right-click |
| `contentTypesLibrary` | List for Content Type choices (default: `ContentTypesLibraryTest`) |
| `showActions` / `showBreadcrumb` / `showUploadControls` / `showRowCheckbox` | UI toggles |

## Columns & editable fields

`columns` and `editableProperties` accept:

- Object map: `{ Title: "", Queue: "Queue label" }`
- String array: `["Title", "ContentType"]`
- Comma-separated string: `"Title,ContentType,CreatedBy"`

## Graph

`DocumentWrapper` talks to Microsoft Graph using the token you pass.

**Typical permissions:** `Sites.Read.All` or `Sites.ReadWrite.All`, `Files.Read.All` or `Files.ReadWrite.All`.

## Scripts

```bash
npm run dev          # local app
npm run storybook    # interactive demo (port 6006)
npm run build:lib    # publishable dist/
```

## Exports

```ts
import { DocumentWrapper } from "common-wrapper-document-library";
import type { DocumentLibraryGraphClient, DocumentLibraryColumn } from "common-wrapper-document-library";
```
