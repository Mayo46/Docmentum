import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColDef, ICellRendererParams, ValueGetterParams } from "ag-grid-community";
import { Alert, Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import type {
    DocumentLibraryColumn,
    DocumentLibraryGraphClient,
    DocumentLibraryItemRow,
    DocumentLibraryUploadColumn,
} from "../types";
import DeleteDialog from "./DeleteDialog";
import DocumentsTable from "./DocumentsTable";
import {
    buildInitialSegments,
    formatDate,
    toastFromFailures,
    type BreadcrumbSegment,
} from "../common/helpers";
import UploadPannel from "./UploadPannel";
import UploadDialog from "./UploadDialog";
import VersionHistoryDialog from "./VersionHistoryDialog";
import { getCellValue } from "../utils/columns";

type Props = {
    client: DocumentLibraryGraphClient;
    parentDriveItemId: string;
    libraryRootLabel?: string;
    initialSegmentName?: string;
    showActions?: boolean;
    showBreadcrumb?: boolean;
    showUploadControls?: boolean;
    documentClientUrlFieldKey: string;
    columns: DocumentLibraryColumn[];
    uploadColumns: DocumentLibraryUploadColumn[];
    uploadPrefillProperties?: Record<string, unknown>;
    titleColumnKey?: string;
};

export default function DocumentLibrary(props: Props) {
    const {
        client,
        parentDriveItemId,
        libraryRootLabel = "Library",
        initialSegmentName,
        showActions = true,
        showBreadcrumb = true,
        showUploadControls = true,
        documentClientUrlFieldKey,
        columns,
        uploadColumns,
        uploadPrefillProperties,
    } = props;

    const [rows, setRows] = useState<DocumentLibraryItemRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<DocumentLibraryItemRow | null>(null);

    const [versionsOpen, setVersionsOpen] = useState(false);
    const [versionsTarget, setVersionsTarget] = useState<DocumentLibraryItemRow | null>(null);

    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);

    const [toast, setToast] = useState<{
        kind: "success" | "error";
        message: string;
    } | null>(null);

    const [segments, setSegments] = useState<BreadcrumbSegment[]>(() =>
        buildInitialSegments(libraryRootLabel, parentDriveItemId, initialSegmentName),
    );

    useEffect(() => {
        setSegments(buildInitialSegments(libraryRootLabel, parentDriveItemId, initialSegmentName));
    }, [libraryRootLabel, parentDriveItemId, initialSegmentName]);

    const currentParentDriveItemId = segments[segments.length - 1]?.id ?? undefined;
    const uploadsEnabled = !!currentParentDriveItemId;

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
    }, []);

    const documentUrlFromRow = useCallback(
        (row: DocumentLibraryItemRow) => {
            const fromField = row.fields?.[documentClientUrlFieldKey];
            if (typeof fromField === "string" && fromField.trim().length > 0) return fromField;
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

    const onSelectFiles = useCallback(
        (files: FileList | null) => {
            if (!uploadsEnabled) return;
            if (!files || files.length === 0) return;
            const arr = Array.from(files).filter((f) => f.size >= 0);
            setUploadFiles(arr);
            setUploadOpen(true);
        },
        [uploadsEnabled],
    );

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
                if (kind === "number") {
                    return params.value === "" || params.value === null || params.value === undefined
                        ? ""
                        : String(params.value);
                }
                if (kind === "user") return params.value ? String(params.value) : "";
                return params.value ? String(params.value) : "";
            },
        }));

        if (showActions) {
            defs.push({
                headerName: "Actions",
                flex: 0.9,
                minWidth: 180,
                sortable: false,
                resizable: false,
                pinned: "left",
                lockPinned: true,
                cellRenderer: (params: ICellRendererParams<DocumentLibraryItemRow>) => {
                    const row = params.data;
                    if (!row) return undefined;
                    return (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                            {!row.isContainer ? (
                                <Button size="small" onClick={() => openVersionHistory(row)}>
                                    Versions
                                </Button>
                            ) : null}

                            <Button
                                size="small"
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
        }

        return defs;
    }, [columns, documentUrlFromRow, navigateInto, openVersionHistory, showActions]);

    const handleDeleteConfirm = useCallback(async () => {
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
    }, [client, deleteTarget, refresh]);

    return (
        <Box>
            <UploadPannel
                uploadsEnabled={uploadsEnabled}
                showBreadcrumb={showBreadcrumb}
                showUploadControls={showUploadControls}
                loading={loading}
                segments={segments}
                onBreadcrumbClick={onBreadcrumbClick}
                onSelectFiles={onSelectFiles}
                onRefresh={refresh}
            >
                <DocumentsTable
                    rows={rows}
                    columnDefs={columnDefs}
                    loading={loading}
                    error={error}
                />
            </UploadPannel>

            <VersionHistoryDialog
                open={versionsOpen}
                itemId={versionsTarget?.itemId ?? null}
                itemName={versionsTarget?.name}
                client={client}
                onClose={() => setVersionsOpen(false)}
                onRestored={refresh}
            />

            <UploadDialog
                open={uploadOpen && uploadsEnabled && showUploadControls}
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
                            message: `Uploaded ${files.length} file(s).`,
                        });
                    }

                    await refresh();
                    return result;
                }}
            />

            <DeleteDialog
                open={deleteOpen}
                deleteTarget={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
            />

            <Snackbar
                open={!!toast}
                autoHideDuration={8000}
                onClose={() => setToast(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                {toast ? (
                    <Alert severity={toast.kind} variant="filled" sx={{ width: "100%", whiteSpace: "pre-wrap" }}>
                        {toast.message}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </Box>
    );
}
