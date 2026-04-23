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
import DocumentLibraryGrid from "./DocumentLibraryGrid";
import type {
    DocumentLibraryGraphClient,
    DocumentLibraryUploadColumn,
} from "./types";
import { createGraphClient } from "./graphClient";

export type DocumentLibraryPlaygroundProps = {
    graphToken: string;
    siteUrl: string;
    listName: string;
    documentSetName: string;
};

export default function DocumentLibraryPlayground(
    props: DocumentLibraryPlaygroundProps,
) {
    const [accessToken, setAccessToken] = useState(props.graphToken);
    const [siteUrl, setSiteUrl] = useState(props.siteUrl);
    const [listName, setListName] = useState(props.listName);
    const [docSetItemId, setDocSetItemId] = useState<string | undefined>();
    const [docSetItemName, setDocSetItemName] = useState(props.documentSetName);

    useEffect(() => {
        setAccessToken(props.graphToken);
    }, [props.graphToken]);

    useEffect(() => {
        setSiteUrl(props.siteUrl);
    }, [props.siteUrl]);

    useEffect(() => {
        setListName(props.listName);
    }, [props.listName]);

    useEffect(() => {
        setDocSetItemId(undefined);
        setDocSetItemName(props.documentSetName);
    }, [props.documentSetName]);

    const columns = useMemo(
        () => [
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
                        GDocs - Docmentum
                    </Typography>
                </Box>
                <Divider />

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