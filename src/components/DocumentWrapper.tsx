import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Container, Stack, Typography } from "@mui/material";
import DocumentLibraryGrid from "./DocumentLibrary";
import type {
  DocumentLibraryColumn,
  DocumentLibraryDocumentType,
  DocumentLibraryGraphClient,
  DocumentLibraryGridRow,
} from "../types";
import { createGraphClient } from "../queries";
import { normalizeColumnsInput, normalizeLookupKey } from "../utils/columns";
import type { DocumentLibraryActions } from "../types/actions";

export type DocumentWrapperProps = {
  /** Microsoft Graph access token used to authenticate API requests. */
  graphToken: string;

  /** SharePoint site URL that hosts the document library. */
  siteUrl: string;

  /** Name of the SharePoint document library. */
  listName: string;

  /** Optional library containing the content types used for uploads. */
  contentTypesLibrary?: string;

  /** Optional document set that serves as the root folder for the library view. */
  documentSetName?: string;

  /** List of SharePoint columns to display in the document grid. */
  columns?: unknown;

  /** Controls whether document actions are enabled. */
  showActions?: boolean;

  /** Controls whether the breadcrumb navigation is displayed. */
  showBreadcrumb?: boolean;

  /** Controls whether upload controls are displayed. */
  showUploadControls?: boolean;

  /** Controls whether row selection checkboxes are displayed. */
  showRowCheckbox?: boolean;

  /** Grid viewport height as pixels or a CSS height value. */
  gridHeight?: number | string;

  /** List of document properties that can be edited by users. */
  editableProperties?: unknown;

  /** Returns the currently selected document rows. */
  onSelectionChange?: (rows: DocumentLibraryGridRow[]) => void;

  /** Controls whether the document action toolbar/hamburger menu is displayed. */
  showToolbar?: boolean;

  /** Controls which document actions are available in the action menu. */
  actions?: DocumentLibraryActions;

  /** Toolbar / tab display title only. */
  dashboardName?: string;

  /** Notifies the consuming application when a document action starts or finishes. */
  onActionLoadingChange?: (loading: boolean) => void;

  /** Which document source to fetch @default "library" */
  documentType?: DocumentLibraryDocumentType;

  /** Current user's email/UPN used to resolve the site-specific SharePoint user ID for checkout documents. */
  userEmail?: string;
};

export default function DocumentWrapper(props: DocumentWrapperProps) {
  const {
    graphToken,
    siteUrl,
    listName,
    contentTypesLibrary,
    documentSetName,
    columns,
    showActions = true,
    showBreadcrumb = true,
    showUploadControls = true,
    showRowCheckbox = true,
    // When omitted, the properties form shows all available columns (read-only respected).
    editableProperties,
    onSelectionChange,
    showToolbar = false,
    actions,
    onActionLoadingChange,
    dashboardName = "",
    documentType = "library",
    userEmail,
    gridHeight
  } = props;
  const [docSetItemId, setDocSetItemId] = useState<string | undefined>();
  const [resolveError, setResolveError] = useState<string | null>(null);

  useEffect(() => {
    setDocSetItemId(undefined);
    setResolveError(null);
  }, [documentSetName]);

  const defaultGridColumns = useMemo<DocumentLibraryColumn[]>(
    () => [
      {
        key: "Title",
        headerName: "Title",
        kind: "text",
        useDocumentClientUrl: true,
      },
      { key: "ContentType", headerName: "Content Type", kind: "text" },
      { key: "CreatedBy", headerName: "Created By", kind: "user" },
      { key: "ModifiedBy", headerName: "Last Modified", kind: "user" },
    ],
    [],
  );

  const uploadPrefillProperties = useMemo(() => ({ Title: "New upload" }), []);
  const columnsSignature = JSON.stringify(columns ?? null);
  const normalizedColumns = useMemo(
    () => normalizeColumnsInput(columns),
    [columnsSignature],
  );

  // const resolvedEditableProperties = useMemo(() => {
  //   if (editableProperties != null) return editableProperties;
  //   if (columns != null) return normalizedColumns;
  //   return [];
  // },[editableProperties, columns, normalizedColumns])

  const gridColumns = useMemo<DocumentLibraryColumn[]>(() => {
    if (normalizedColumns.length === 0) return defaultGridColumns;

    return normalizedColumns.map((key) => {
      const lower = normalizeLookupKey(key);
      const prettyHeader = key
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();

      return {
        key,
        headerName: prettyHeader || key,
        kind:
          lower === "createdby" || lower === "modifiedby"
            ? "user"
            : lower === "modified" || lower === "created"
              ? "date"
              : "text",
        useDocumentClientUrl: lower === "title" || lower === "name",
      };
    });
  }, [normalizedColumns, defaultGridColumns]);

  const graphClient = useMemo<DocumentLibraryGraphClient | null>(() => {
    if (!graphToken) return null;
    if (!siteUrl || !listName) return null;

    return createGraphClient({
      siteUrl,
      listName,
      contentTypesLibrary,
      columns: normalizedColumns,
      getAccessToken: async () => graphToken,
      userEmail,
      documentType
    });
  }, [
    graphToken,
    siteUrl,
    listName,
    contentTypesLibrary,
    normalizedColumns,
    userEmail,
    documentType
  ]);

  useEffect(() => {
    if (graphClient && documentSetName && !docSetItemId) {
      setResolveError(null);
      graphClient
        .getDriveItemIdByName({ name: documentSetName })
        .then((id) => setDocSetItemId(id))
        .catch((err) => {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to resolve document set.";
          setResolveError(message);
        });
    }
  }, [graphClient, documentSetName, docSetItemId]);

  const parentDriveItemId = docSetItemId ?? "";
  const isResolving = !!(graphClient && documentSetName && !docSetItemId);

  return (
    <Container sx={{ py: 3 }}>
      <Stack spacing={2}>
        {!graphClient ? (
          <Alert severity="warning">
            Enter an access token, site URL, and library (list) name to load
            documents from SharePoint via Microsoft Graph.
          </Alert>
        ) : null}

        {resolveError ? <Alert severity="error">{resolveError}</Alert> : null}

        {graphClient && isResolving ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
            }}
          >
            <Typography color="text.secondary">Loading Data..</Typography>
          </Box>
        ) : null}

        {graphClient && !isResolving ? (
          <DocumentLibraryGrid
            client={graphClient}
            parentDriveItemId={parentDriveItemId}
            libraryRootLabel={listName || "Library"}
            initialSegmentName={
              docSetItemId ? documentSetName || undefined : undefined
            }
            showActions={showActions}
            showBreadcrumb={showBreadcrumb}
            showUploadControls={showUploadControls}
            showRowCheckbox={showRowCheckbox}
            documentClientUrlFieldKey="DocumentClientUrl"
            columns={gridColumns}
            editableProperties={editableProperties}
            uploadPrefillProperties={uploadPrefillProperties}
            onSelectionChange={onSelectionChange}
            showToolbar={showToolbar}
            actions={actions}
            dashboardName={dashboardName}
            onActionLoadingChange={onActionLoadingChange}
            documentType={documentType}
            gridHeight={gridHeight}
          />
        ) : null}
      </Stack>
    </Container>
  );
}
