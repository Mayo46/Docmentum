import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
    ICellRendererParams,
    ColDef,
    ValueGetterParams,
} from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import type {
    DocumentLibraryColumn,
    DocumentLibraryGraphClient,
    DocumentLibraryItemRow,
    DocumentLibraryUploadColumn,
    UploadFailure,
} from "./types";
import VersionHistoryDialog from "./VersionHistoryDialog";
import UploadDialog from "./UploadDialog";

type Props = {
    client: DocumentLibraryGraphClient;
    parentDriveItemId: string; /**
   * Used to find the client-app URL in the item fields.
   */
    documentClientUrlFieldKey: string;
    columns: DocumentLibraryColumn[];
    uploadColumns: DocumentLibraryUploadColumn[];
    uploadPrefillProperties?: Record<string, unknown>;
    titleColumnKey?: string;
};

function formatDate(value: unknown) {
    if (!value) return "";
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
}

function getCellValue(
    row: DocumentLibraryItemRow | undefined,
    columnKey: string,
) {
    if (!row) return "";
    const key = columnKey.toLowerCase();
    if (key === "itemid" || key === "item id") return row.itemId ?? "";
    if (key === "title") {
        return row.fields?.[columnKey] ?? row.name ?? "";
    }
    if (key === "createdby" || key === "created by")
        return row.createdByDisplayName ?? "";
    if (key === "modifiedby" || key === "modified by" || key === "last modified")
        return row.modifiedByDisplayName ?? "";

    return row.fields?.[columnKey] ?? "";
}

export default function DocumentLibraryGrid(props: Props) {
    const {
        client,
        parentDriveItemId,
        documentClientUrlFieldKey,
        columns,
        uploadColumns,
        uploadPrefillProperties,
    } = props;

    const gridRef = useRef<AgGridReact<DocumentLibraryItemRow>>(null);
    const [rows, setRows] = useState<DocumentLibraryItemRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] =
        useState<DocumentLibraryItemRow | null>(null);

    const [versionsOpen, setVersionsOpen] = useState(false);
    const [versionsTarget, setVersionsTarget] =
        useState<DocumentLibraryItemRow | null>(null);

    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);

    const [isDragging, setIsDragging] = useState(false);

    const [toast, setToast] = useState<{
        kind: "success" | "error";
        message: string;
    } | null>(null);

    const documentUrlFromRow = useCallback(
        (row: DocumentLibraryItemRow) => {
            const fromField = row.fields?.[documentClientUrlFieldKey];
            if (typeof fromField === "string" && fromField.trim().length > 0)
                return fromField;
            return typeof row.webUrl === "string" ? row.webUrl : undefined;
        },
        [documentClientUrlFieldKey],
    );

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const next = await client.listChildren({ parentDriveItemId });
            setRows(next);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load documents");
        } finally {
            setLoading(false);
        }
    }, [client, parentDriveItemId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const columnDefs: ColDef<DocumentLibraryItemRow>[] = useMemo(() => {
        const defs: ColDef<DocumentLibraryItemRow>[] = columns.map((c) => ({
            headerName: c.headerName,
            flex: 1,
            resizable: true,
            sortable: true,
            minWidth: 140,
            valueGetter: (params: ValueGetterParams<DocumentLibraryItemRow>) =>
                getCellValue(params.data, c.key),
            cellRenderer: c.useDocumentClientUrl
                ? (params: ICellRendererParams<DocumentLibraryItemRow>) => {
                    const row = params.data;
                    if (!row) return undefined;
                    const url = documentUrlFromRow(row);
                    if (!url) return undefined;
                    return (
                        <a href={url} target="_blank" rel="noreferrer">
                            {String(params.value ?? "")}
                        </a>
                    );
                }
                : undefined,
            valueFormatter: (params) => {
                const kind = c.kind ?? "text";
                if (kind === "date") return formatDate(params.value);
                if (kind === "number")
                    return params.value === "" ||
                        params.value === null ||
                        params.value === undefined
                        ? ""
                        : String(params.value);
                if (kind === "user") return params.value ? String(params.value) : "";
                return params.value ? String(params.value) : "";
            },
        }));

        defs.push({
            headerName: "Actions",
            flex: 0.9,
            minWidth: 210,
            sortable: false,
            resizable: false,
            cellRenderer: (params: ICellRendererParams<DocumentLibraryItemRow>) => {
                const row = params.data;
                if (!row) return undefined;
                return (
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center", flexWrap: "wrap" }}
                    >
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                                setVersionsTarget(row);
                                setVersionsOpen(true);
                            }}
                        >
                            Versions
                        </Button>

                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                setDeleteTarget(row);
                                setDeleteOpen(true);
                            }}
                        >
                            Delete
                        </Button>
                    </Stack>
                );
            },
        });

        return defs;
    }, [columns, documentUrlFromRow]);

    const onDropFiles = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;
        const arr = Array.from(files).filter((f) => f.size >= 0);
        setUploadFiles(arr);
        setUploadOpen(true);
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            onDropFiles(e.dataTransfer.files);
        },
        [onDropFiles],
    );

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
    }, []);

    const toastFromFailures = useCallback((failures: UploadFailure[]) => {
        if (failures.length === 0) return "";
        return failures.map((f) => `${f.fileName}: ${f.message}`).join("\n");
    }, []);

    return (
        <Box>
            <Box
                sx={{
                    border: isDragging ? "2px dashed" : "1px solid",
                    borderColor: isDragging ? "primary.main" : "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        p: 2,
                        alignItems: "center",
                    }}
                >
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Documents
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Drag & drop files to upload.
                        </Typography>
                    </Box>

                    <Button variant="outlined" onClick={refresh} disabled={loading}>
                        Refresh
                    </Button>
                </Box>

                {error ? (
                    <Box sx={{ p: 2 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                ) : null}

                {loading ? (
                    <Box
                        sx={{
                            height: 260,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : null}

                <Box className="ag-theme-alpine" sx={{ width: "100%", height: 520 }}>
                    <AgGridReact<DocumentLibraryItemRow>
                        ref={gridRef}
                        rowData={rows}
                        columnDefs={columnDefs}
                        defaultColDef={{
                            tooltipValueGetter: (p) => (p.value ? String(p.value) : ""),
                        }}
                        suppressRowClickSelection
                        domLayout="autoHeight"
                    />
                </Box>
            </Box>

            <VersionHistoryDialog
                open={versionsOpen}
                itemId={versionsTarget?.itemId ?? null}
                itemName={versionsTarget?.name}
                client={client}
                onClose={() => setVersionsOpen(false)}
                onRestored={refresh}
            />

            <UploadDialog
                open={uploadOpen}
                files={uploadFiles}
                uploadColumns={uploadColumns}
                initialProperties={uploadPrefillProperties}
                onClose={() => setUploadOpen(false)}
                onUpload={async ({ files, contentType, properties }) => {
                    const result = await client.uploadFiles({
                        parentDriveItemId,
                        files,
                        contentType,
                        properties,
                    });

                    if (result.failures.length > 0) {
                        setToast({
                            kind: "error",
                            message: `Upload failed for:\n${toastFromFailures(result.failures)}`,
                        });
                    } else {
                        setToast({
                            kind: "success",
                            message: `Uploaded ${files.length} file(s).`,
                        });
                    } // If some files failed, still refresh so successful uploads show up.

                    await refresh();
                    return result;
                }}
            />

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Delete document?</DialogTitle>
                <DialogContent>
                    <Typography>
                        {deleteTarget
                            ? `Are you sure you want to delete "${deleteTarget.name}"?`
                            : "Are you sure?"}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)} variant="outlined">
                        Cancel
                    </Button>

                    <Button
                        onClick={async () => {
                            if (!deleteTarget) return;
                            try {
                                await client.deleteItem({ itemId: deleteTarget.itemId });
                                setToast({ kind: "success", message: "Deleted." });
                                setDeleteOpen(false);
                                setDeleteTarget(null);
                                await refresh();
                            } catch (e) {
                                setToast({
                                    kind: "error",
                                    message: e instanceof Error ? e.message : "Delete failed",
                                });
                            }
                        }}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!toast}
                autoHideDuration={8000}
                onClose={() => setToast(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                {toast ? (
                    <Alert
                        severity={toast.kind}
                        variant="filled"
                        sx={{ width: "100%", whiteSpace: "pre-wrap" }}
                    >
                        {toast.message}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </Box>
    );
}
