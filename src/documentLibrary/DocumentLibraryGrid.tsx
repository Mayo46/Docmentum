import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
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
    Breadcrumbs,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Link,
    Snackbar,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import type {
    DocumentLibraryColumn,
    DocumentLibraryGraphClient,
    DocumentLibraryItemRow,
    DocumentLibraryUploadColumn,
    UploadFailure,
} from "./types";
import VersionHistoryDialog from "./VersionHistoryDialog";
import UploadDialog from "./UploadDialog";

type BreadcrumbSegment = { name: string; id: string | undefined };

type Props = {
    client: DocumentLibraryGraphClient; /** Drive folder id to open initially (e.g. document set). Empty string = library root. */
    parentDriveItemId: string; /** Label for the drive root crumb (e.g. library name). */
    libraryRootLabel?: string; /** Display name for the initial `parentDriveItemId` segment when it is set. */
    initialSegmentName?: string;
    documentClientUrlFieldKey: string;
    columns: DocumentLibraryColumn[];
    uploadColumns: DocumentLibraryUploadColumn[];
    uploadPrefillProperties?: Record<string, unknown>;
    titleColumnKey?: string;
};

function buildInitialSegments(
    libraryRootLabel: string,
    parentDriveItemId: string,
    initialSegmentName?: string,
): BreadcrumbSegment[] {
    const root: BreadcrumbSegment = { name: libraryRootLabel, id: undefined };
    const trimmed = parentDriveItemId.trim();
    if (!trimmed) return [root];
    return [
        root,
        {
            name: initialSegmentName?.trim() || "Folder",
            id: trimmed,
        },
    ];
}

function formatDate(value: unknown) {
    if (!value) return "";
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
}

/** SharePoint / Graph may return Content Type as string, object, or CT id (0x…). */
function formatContentTypeValue(raw: unknown): string {
    if (raw === null || raw === undefined) return "";
    if (typeof raw === "string") {
        const s = raw.trim();
        if (!s) return ""; // Hex content type id — not a display name; leave empty for graphClient to fill via contentTypeName
        if (/^0x[0-9A-F]+$/i.test(s) && s.length > 8) return "";
        return s;
    }
    if (typeof raw === "object") {
        const o = raw as Record<string, unknown>;
        const name = o.name ?? o.label ?? o.displayName ?? o.Title ?? o.title;
        if (typeof name === "string" && name.trim()) return name.trim();
    }
    return "";
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
    if (key === "contenttype" || key === "content type") {
        if (row.contentTypeName) return row.contentTypeName;
        const fromFields = formatContentTypeValue(row.fields?.ContentType);
        if (fromFields) return fromFields;
        return "";
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
        libraryRootLabel = "Library",
        initialSegmentName,
        documentClientUrlFieldKey,
        columns,
        uploadColumns,
        uploadPrefillProperties,
    } = props;

    const gridRef = useRef<AgGridReact<DocumentLibraryItemRow>>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const [segments, setSegments] = useState<BreadcrumbSegment[]>(() =>
        buildInitialSegments(
            libraryRootLabel,
            parentDriveItemId,
            initialSegmentName,
        ),
    );

    useEffect(() => {
        setSegments(
            buildInitialSegments(
                libraryRootLabel,
                parentDriveItemId,
                initialSegmentName,
            ),
        );
    }, [libraryRootLabel, parentDriveItemId, initialSegmentName]);

    const currentParentDriveItemId =
        segments[segments.length - 1]?.id ?? undefined;

    const navigateInto = useCallback((row: DocumentLibraryItemRow) => {
        if (!row.isContainer) return;
        setSegments((prev) => [...prev, { name: row.name, id: row.itemId }]);
    }, []);

    const onBreadcrumbClick = useCallback((index: number) => {
        setSegments((prev) => prev.slice(0, index + 1));
    }, []);


    const openVersionHistory = useCallback((row: DocumentLibraryItemRow) => {
        setVersionsTarget(row);
        setVersionsOpen(true);
    }, [])
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
            const next = await client.listChildren({
                parentDriveItemId: currentParentDriveItemId,
            });
            setRows(next);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load documents");
        } finally {
            setLoading(false);
        }
    }, [client, currentParentDriveItemId]);

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
                    const label = String(params.value ?? "");
                    if (row.isContainer) {
                        return (
                            <Button
                                type="button"
                                variant="text"
                                size="small"
                                onClick={() => navigateInto(row)}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    p: 0,
                                    minWidth: 0,
                                    justifyContent: "flex-start",
                                }}
                            >
                                {label}
                            </Button>
                        );
                    }
                    const url = documentUrlFromRow(row);
                    return (
                        <Stack
                            direction="row"
                            spacing={0.75}
                            useFlexGap
                            flexWrap="wrap"
                            alignItems="center"
                            sx={{ minWidth: 0 }}
                        >
                            {url ? (
                                <a href={url} target="_blank" rel="noreferrer">
                                    {label}
                                </a>
                            ) : (
                                <Typography component="span" variant="body2">
                                    {label}
                                </Typography>
                            )}
                        </Stack>
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
                        {!row.isContainer ? (
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openVersionHistory(row)}>
                                Versions
                            </Button>
                        ) : null}

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
    }, [columns, documentUrlFromRow, navigateInto, openVersionHistory]);

    const onDropFiles = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;
        const arr = Array.from(files).filter((f) => f.size >= 0);
        setUploadFiles(arr);
        setUploadOpen(true);
    }, []);

    const handleFileInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            onDropFiles(e.target.files);
            e.target.value = "";
        },
        [onDropFiles],
    );

    const handleUploadButtonClick = useCallback(() => {
        fileInputRef.current?.click();
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
                    <Box sx={{ minWidth: 0, flex: 1, pr: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Documents
                        </Typography>

                        <Breadcrumbs sx={{ mt: 0.5, mb: 0.5 }} aria-label="Folder path">
                            {segments.map((seg, index) => {
                                const isLast = index === segments.length - 1;
                                const key = `${seg.id ?? "root"}-${index}`;
                                if (isLast) {
                                    return (
                                        <Typography
                                            key={key}
                                            color="text.primary"
                                            variant="body2"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {seg.name}
                                        </Typography>
                                    );
                                }
                                return (
                                    <Link
                                        key={key}
                                        component="button"
                                        type="button"
                                        variant="body2"
                                        underline="hover"
                                        color="inherit"
                                        onClick={() => onBreadcrumbClick(index)}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        {seg.name}
                                    </Link>
                                );
                            })}
                        </Breadcrumbs>

                        <Typography variant="body2" color="text.secondary">
                            Drag & drop files here, or use the Upload button.
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            style={{ display: "none" }}
                            onChange={handleFileInputChange}
                        />

                        <Tooltip title="Pick files to upload">
                            <Button
                                variant="contained"
                                startIcon={<UploadFileIcon />}
                                onClick={handleUploadButtonClick}
                            >
                                Upload
                            </Button>
                        </Tooltip>

                        <Button variant="outlined" onClick={refresh} disabled={loading}>
                            Refresh
                        </Button>
                    </Stack>
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
                        parentDriveItemId: currentParentDriveItemId,
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
