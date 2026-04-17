import { useMemo, useState, useEffect } from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import DocumentLibraryGrid from "./documentLibrary/DocumentLibraryGrid";
import type {
    DocumentLibraryGraphClient,
    DocumentLibraryItemRow,
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
    const [docSetItemName, setDocSetItemName] = useState(
        import.meta.env.VITE_APP_DOC_SET_ITEM_NAME ?? "",
    );

    const [mockRows, setMockRows] = useState<DocumentLibraryItemRow[]>(() => []);

    const columns = useMemo(
        () => [
            { key: "ItemId", headerName: "Item ID", kind: "text" as const },
            {
                key: "Title",
                headerName: "Title",
                kind: "text" as const,
                useDocumentClientUrl: true,
            },
            { key: "CreatedBy", headerName: "Created By", kind: "user" as const },
            { key: "ModifiedBy", headerName: "Last Modified", kind: "user" as const },
        ],
        [],
    );

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

    const mockClient = useMemo<DocumentLibraryGraphClient>(() => {
        return {
            async getDriveItemIdByName({ name }) {
                return `mock-id-for-${name}`;
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
                    itemId: `mock-${Date.now()}-${idx}`,
                    name: f.name,
                    webUrl: undefined,
                    createdByDisplayName: "Mock User",
                    modifiedByDisplayName: "Mock User",
                    fields: {
                        Title:
                            (properties.Title as string | undefined) ??
                            f.name.replace(/\.[^.]+$/, ""),
                        DocumentClientUrl: `https://client.app/doc/mock-${Date.now()}-${idx}`,
                    },
                }));

                setMockRows((prev) => [...next, ...prev]);
                for (const n of next) uploadedItemIds.push(n.itemId);

                return { uploadedItemIds, failures };
            },
        };
    }, [mockRows]);

    const clientToUse = graphClient ?? mockClient;
    const parentDriveItemId = graphClient ? (docSetItemId ?? "") : "mock-parent";

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

                        <Button variant="outlined" onClick={() => { }}>
                            Use Graph
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
            </Stack>
        </Container>
    );
}