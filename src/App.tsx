import { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DocumentLibraryGrid from "./documentLibrary/DocumentLibraryGrid";
import type {
  DocumentLibraryColumn,
  DocumentLibraryGraphClient,
  DocumentLibraryItemRow,
  SharePointColumnOption,
} from "./documentLibrary/types";
import { createGraphClient } from "./documentLibrary/graphClient";
import type { DocumentLibraryUploadColumn } from "./documentLibrary/types";

export default function App() {
  const [accessToken, setAccessToken] = useState("");
  const [siteUrl, setSiteUrl] = useState(
    import.meta.env.VITE_APP_SITE_URL ?? "",
  );
  const [listName, setListName] = useState(
    import.meta.env.VITE_APP_LIST_NAME ?? "",
  );
  const [docSetItemId, setDocSetItemId] = useState<string | undefined>();
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<SharePointColumnOption[]>([
      { key: "Title", headerName: "Title", kind: "text" },
    { key: "CreatedBy", headerName: "Created By", kind: "user" },
    { key: "ModifiedBy", headerName: "Modified By", kind: "user" },
  ]);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([
    "Title",
    "CreatedBy",
    "ModifiedBy",
  ]);

  const [docSetItemName, setDocSetItemName] = useState(
    import.meta.env.VITE_APP_DOC_SET_ITEM_NAME ?? "",
  );

  const [mockRows, setMockRows] = useState<DocumentLibraryItemRow[]>(() => []);

  const columns = useMemo<DocumentLibraryColumn[]>(() => {
    const map = new Map(availableColumns.map((c) => [c.key, c]));
    return selectedColumnKeys
      .map((key) => map.get(key))
      .filter((c): c is SharePointColumnOption => !!c)
      .map((c) => ({
        key: c.key,
        headerName: c.headerName,
        kind: c.kind ?? "text",
        useDocumentClientUrl: c.key.toLowerCase() === "title",
      }));
  }, [availableColumns, selectedColumnKeys]);

  const uploadColumns = useMemo<DocumentLibraryUploadColumn[]>(
    () => [{ key: "Title", label: "Title", inputType: "text" }],
    [],
  );

  const uploadPrefillProperties = useMemo(() => ({ Title: "New upload" }), []);

  const graphClient = useMemo<DocumentLibraryGraphClient | null>(() => {
    if (!accessToken) return null;
    if (!siteUrl || !listName) return null;
    return createGraphClient({
      siteUrl,
      listName,
      getAccessToken: async () => accessToken,
    });
  }, [accessToken, siteUrl, listName]);

  useEffect(() => {
    if (graphClient && docSetItemName && !docSetItemId) {
      graphClient
        .getDriveItemIdByName({ name: docSetItemName })
        .then((id) => setDocSetItemId(id))
        .catch((err) => console.error("Failed to resolve doc set name:", err));
    }
  }, [graphClient, docSetItemName, docSetItemId]);

  useEffect(() => {
    if (!graphClient) return;
    graphClient
      .listAvailableColumns()
      .then((cols) => {
        setAvailableColumns(cols);
        setSelectedColumnKeys((prev) => {
          if (prev.length > 0) return prev;
          const defaults = ["Title","CreatedBy", "ModifiedBy"];
          const allowed = new Set(cols.map((c) => c.key));
          return defaults.filter((k) => allowed.has(k));
        });
      })
      .catch(() => {
        // Keep defaults if fetching columns fails.
      });
  }, [graphClient]);

  const mockClient = useMemo<DocumentLibraryGraphClient>(() => {
    return {
      async getDriveItemIdByName({ name }) {
        return `mock-id-for-${name}`;
      },
      async listAvailableColumns() {
        return [
          { key: "Title", headerName: "Title", kind: "text" },
          { key: "CreatedBy", headerName: "Created By", kind: "user" },
          { key: "ModifiedBy", headerName: "Modified By", kind: "user" },
        ];
      },
      async listChildren() {
        return mockRows;
      },
      async deleteItem({ itemId }) {
        setMockRows((prev) => prev.filter((r) => r.itemId !== itemId));
      },
      async listVersions({ itemId }) {
        return [
          {
            id: `${itemId}-v1`,
            createdDateTime: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 7,
            ).toISOString(),
            comment: "Initial version",
          },
          {
            id: `${itemId}-v2`,
            createdDateTime: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 2,
            ).toISOString(),
            comment: "Latest version",
          },
        ];
      },
      async restoreVersion() {
        // no-op in mock
      },
      async uploadFiles({ files, properties }) {
        const uploadedItemIds: string[] = [];
        const failures: any[] = [];

        const next: DocumentLibraryItemRow[] = files.map((f, idx) => ({
          itemId: `${Date.now()}-${idx}`,
          name: f.name,
          webUrl: undefined,
          createdByDisplayName: "",
          modifiedByDisplayName: "",
          fields: {
            Title:
              (properties.Title as string | undefined) ??
              f.name.replace(/\.[^.]+$/, ""),
            DocumentClientUrl: `https://-${Date.now()}-${idx}`,
          },
        }));

        setMockRows((prev) => [...next, ...prev]);
        for (const n of next) uploadedItemIds.push(n.itemId);

        return { uploadedItemIds, failures };
      },
    };
  }, [mockRows]);

  const clientToUse = graphClient ?? mockClient;
  const parentDriveItemId = graphClient ? (docSetItemId ?? "") : "";

  const isResolving = !!(graphClient && docSetItemName && !docSetItemId);

  return (
    <Container sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Docmentum - Document Library Grid
          </Typography>

          <Typography variant="body2" color="text.secondary">
            AG Grid + document link, version history, delete, and drag & drop
            upload.
          </Typography>
        </Box>
        <Divider />
        <Typography variant="h6">Graph (optional)</Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="flex-start"
        >
          <TextField
            label="Graph access token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Paste token to use real Microsoft Graph"
            multiline
            minRows={3}
            fullWidth
          />

          <Stack spacing={2} sx={{ minWidth: 320 }}>
            <TextField
              label="Site URL"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
            />

            <TextField
              label="List Name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />

            <TextField
              label="Doc Set Name"
              value={docSetItemName}
              onChange={(e) => {
                setDocSetItemName(e.target.value);
                setDocSetItemId(undefined); // Clear ID so effect can re-resolve
              }}
            />

            <Button variant="outlined" onClick={() => {}}>
              Use Graph
            </Button>
            <Button
              variant="outlined"
              onClick={() => setColumnPickerOpen(true)}
              disabled={!availableColumns.length}
            >
              Select Columns
            </Button>
          </Stack>
        </Stack>

        {!graphClient ? (
          <Alert severity="info">
            Showing mock data. Provide `accessToken` + (`siteUrl` and
            `listName`) to switch to real Graph.
          </Alert>
        ) : null}

        {isResolving ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
            }}
          >
            <Typography color="text.secondary">
              Resolving Doc Set ID from name...
            </Typography>
          </Box>
        ) : (
          <DocumentLibraryGrid
            client={clientToUse}
            parentDriveItemId={parentDriveItemId}
            documentClientUrlFieldKey="DocumentClientUrl"
            columns={columns}
            uploadColumns={uploadColumns}
            uploadPrefillProperties={uploadPrefillProperties}
          />
        )}
        <Dialog open={columnPickerOpen} onClose={() => setColumnPickerOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Select columns to display</DialogTitle>
          <DialogContent>
            <FormGroup>
              {availableColumns.map((c) => (
                <FormControlLabel
                  key={c.key}
                  control={
                    <Checkbox
                      checked={selectedColumnKeys.includes(c.key)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedColumnKeys((prev) => {
                          if (checked) return Array.from(new Set([...prev, c.key]));
                          return prev.filter((k) => k !== c.key);
                        });
                      }}
                    />
                  }
                  label={`${c.headerName} (${c.key})`}
                />
              ))}
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setColumnPickerOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
}
