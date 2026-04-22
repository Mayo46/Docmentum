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
    DocumentLibraryUploadColumn,
} from "./documentLibrary/types";
import { createGraphClient } from "./documentLibrary/graphClient";

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

    const columns = useMemo(
        () => [
            { key: "ItemId", headerName: "Item ID", kind: "text" as const },
            {
                key: "Title",
                headerName: "Title",
                kind: "text" as const,
                useDocumentClientUrl: true,
            },
            {
                key: "ContentType",
                headerName: "Content Type",
                kind: "text" as const,
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

    const parentDriveItemId = docSetItemId ?? "";
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
                <Typography variant="h6">SharePoint connection</Typography>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems="flex-start"
                >
                    <TextField
                        label="Graph access token"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="Paste a Microsoft Graph access token"
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
                                setDocSetItemId(undefined);
                            }}
                        />

                        <Button variant="outlined" onClick={() => {}}>
                            Connect
                        </Button>
                    </Stack>
                </Stack>

                {!graphClient ? (
                    <Alert severity="warning">
                        Enter an access token, site URL, and library (list) name to load
                        documents from SharePoint via Microsoft Graph.
                    </Alert>
                ) : null}

                {graphClient && isResolving ? (
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
                ) : null}

                {graphClient && !isResolving ? (
                    <DocumentLibraryGrid
                        client={graphClient}
                        parentDriveItemId={parentDriveItemId}
                        libraryRootLabel={listName || "Library"}
                        initialSegmentName={
                            docSetItemId ? docSetItemName || undefined : undefined
                        }
                        documentClientUrlFieldKey="DocumentClientUrl"
                        columns={columns}
                        uploadColumns={uploadColumns}
                        uploadPrefillProperties={uploadPrefillProperties}
                    />
                ) : null}
            </Stack>
        </Container>
    );
}
