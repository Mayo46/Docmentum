import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Alert, Box, Snackbar } from "@mui/material";
import type {
    DocumentLibraryColumn,
    DocumentLibraryGraphClient,
    DocumentLibraryGridRow,
    DocumentLibraryItemRow,
    DocumentLibraryUploadColumn,
} from "../types";
import DeleteDialog from "./DeleteDialog";
import DocumentsTable from "./DocumentsTable";
import {
    buildInitialSegments,
    toastFromFailures,
    type BreadcrumbSegment,
} from "../common/helpers";
import UploadPannel from "./UploadPannel";
import UploadDialog from "./UploadDialog";
import VersionHistoryDialog from "./VersionHistoryDialog";
import {
    buildGroupTree,
    collectAllGroupIds,
    columnHeaderMap,
    flattenGroupTree,
    resolveGroupByKeys,
} from "../utils/groupTree";
import type { DocumentLibraryGridAgContext } from "../common/GroupRowRenderer";
import { useDocumentLibraryColumnDefs } from "../hooks/useDocumentLibraryColumnDefs";

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

    const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());
    const [userGroupByKey, setUserGroupByKey] = useState<string | null>("ContentType");

    useEffect(() => {
        setSegments(buildInitialSegments(libraryRootLabel, parentDriveItemId, initialSegmentName));
    }, [libraryRootLabel, parentDriveItemId, initialSegmentName]);

    const currentParentDriveItemId = segments[segments.length - 1]?.id ?? undefined;
    const uploadsEnabled = !!currentParentDriveItemId;

    const resolvedGroupBy = useMemo(
        () => (userGroupByKey ? resolveGroupByKeys([userGroupByKey], columns) : []),
        [userGroupByKey, columns],
    );

    useEffect(() => {
        if (!userGroupByKey) return;
        const stillValid = resolveGroupByKeys([userGroupByKey], columns);
        if (stillValid.length === 0) setUserGroupByKey(null);
    }, [columns, userGroupByKey]);
    const groupingEnabled = resolvedGroupBy.length > 0;
    const columnHeaderByKey = useMemo(() => columnHeaderMap(columns), [columns]);

    const groupTree = useMemo(
        () => buildGroupTree(rows, resolvedGroupBy, columnHeaderByKey, "root"),
        [rows, resolvedGroupBy, columnHeaderByKey],
    );

    const allGroupIds = useMemo(() => collectAllGroupIds(groupTree), [groupTree]);

    useLayoutEffect(() => {
        if (!groupingEnabled) {
            setExpandedGroupIds(new Set());
            return;
        }
        setExpandedGroupIds(new Set(allGroupIds));
    }, [groupingEnabled, allGroupIds]);

    const toggleGroupId = useCallback((id: string) => {
        setExpandedGroupIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const gridContext: DocumentLibraryGridAgContext = useMemo(
        () => ({ toggleGroupId }),
        [toggleGroupId],
    );

    const gridRows: DocumentLibraryGridRow[] = useMemo(() => {
        if (!groupingEnabled) {
            return rows.map((r) => ({
                rowType: "data" as const,
                treeLevel: 0,
                ...r,
            }));
        }
        const out: DocumentLibraryGridRow[] = [];
        flattenGroupTree(groupTree, expandedGroupIds, 0, out);
        return out;
    }, [rows, groupingEnabled, groupTree, expandedGroupIds]);

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

    const onDeleteRow = useCallback((row: DocumentLibraryItemRow) => {
        setDeleteTarget(row);
        setDeleteOpen(true);
    }, []);

    const columnDefs = useDocumentLibraryColumnDefs({
        columns,
        groupingEnabled,
        showActions,
        navigateInto,
        documentUrlFromRow,
        openVersionHistory,
        onDeleteRow,
    });

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
                groupByMenu={{
                    columns: columns.map((c) => ({ key: c.key, headerName: c.headerName })),
                    selectedKey: userGroupByKey,
                    onChange: setUserGroupByKey,
                }}
            >
                <DocumentsTable
                    rows={gridRows}
                    columnDefs={columnDefs}
                    loading={loading}
                    error={error}
                    groupingEnabled={groupingEnabled}
                    gridContext={gridContext}
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
