import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CellContextMenuEvent } from "ag-grid-community";
import { Alert, Box, ListItemText, Menu, MenuItem, Snackbar } from "@mui/material";
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
    toastFromFieldUpdateFailures,
    type BreadcrumbSegment,
} from "../common/helpers";
import UploadPannel from "./UploadPannel";
import UploadDialog from "./UploadDialog";
import VersionHistoryDialog from "./VersionHistoryDialog";
import PropertiesDrawer from "./PropertiesDrawer";
import {
    buildGroupTree,
    collectAllGroupIds,
    collectItemIdsInGroup,
    getGroupLabel,
    columnHeaderMap,
    flattenGroupTree,
    resolveGroupByKeys,
} from "../utils/groupTree";
import type { DocumentLibraryGridAgContext } from "../common/GroupRowRenderer";
import { useDocumentLibraryColumnDefs } from "../hooks/useDocumentLibraryColumnDefs";
import { useEditableFieldDefinitions } from "../hooks/useEditableFieldDefinitions";
import { normalizeEditablePropertiesInput } from "../utils/editableProperties";
import { getCellValue } from "../utils/columns";

type Props = {
    client: DocumentLibraryGraphClient;
    parentDriveItemId: string;
    libraryRootLabel?: string;
    initialSegmentName?: string;
    showActions?: boolean;
    showBreadcrumb?: boolean;
    showUploadControls?: boolean;
    /** When grouping is off, show a per-row selection checkbox column. Default false. */
    showRowCheckbox?: boolean;
    documentClientUrlFieldKey: string;
    columns: DocumentLibraryColumn[];
    uploadColumns?: DocumentLibraryUploadColumn[];
    /** SharePoint columns editable on upload and via right-click (same shapes as `columns`). */
    editableProperties?: unknown;
    uploadPrefillProperties?: Record<string, unknown>;
    titleColumnKey?: string;
};

type PropertiesEditTarget =
    | { kind: "item"; itemId: string; name: string }
    | { kind: "bulk"; groupId: string; label: string };

function resolveBulkSelectedItemIds(
    groupTree: ReturnType<typeof buildGroupTree>,
    groupId: string,
    selectedItemIds: Set<string>,
): string[] {
    return collectItemIdsInGroup(groupTree, groupId).filter((id) => selectedItemIds.has(id));
}

export default function DocumentLibrary(props: Props) {
    const {
        client,
        parentDriveItemId,
        libraryRootLabel = "Library",
        initialSegmentName,
        showActions = true,
        showBreadcrumb = true,
        showUploadControls = true,
        showRowCheckbox = false,
        documentClientUrlFieldKey,
        columns,
        uploadColumns = [],
        editableProperties,
        uploadPrefillProperties,
    } = props;

    const editableKeys = useMemo(
        () => normalizeEditablePropertiesInput(editableProperties).keys,
        [JSON.stringify(editableProperties ?? null)],
    );
    const editableKeysSignature = editableKeys.join("|");
    const hasEditableProperties = editableKeys.length > 0;
    const uploadPrefillSignature = useMemo(
        () => JSON.stringify(uploadPrefillProperties ?? {}),
        [uploadPrefillProperties],
    );
    const { definitions: fieldDefinitions, loading: fieldDefinitionsLoading } =
        useEditableFieldDefinitions({ client, editableProperties });

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

    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        target: PropertiesEditTarget;
    } | null>(null);

    const [propertiesTarget, setPropertiesTarget] = useState<PropertiesEditTarget | null>(null);
    const [propertiesInitialValues, setPropertiesInitialValues] = useState<
        Record<string, unknown> | undefined
    >();
    const [propertiesValuesLoading, setPropertiesValuesLoading] = useState(false);
    const [propertiesSubmitting, setPropertiesSubmitting] = useState(false);

    const [segments, setSegments] = useState<BreadcrumbSegment[]>(() =>
        buildInitialSegments(libraryRootLabel, parentDriveItemId, initialSegmentName),
    );

    const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());
    const [userGroupByKey, setUserGroupByKey] = useState<string | null>("ContentType");
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => new Set());
    const [selectionRevision, setSelectionRevision] = useState(0);
    const prevGroupingEnabledRef = useRef(true);

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
    const rowSelectionEnabled = groupingEnabled || showRowCheckbox;
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

    useEffect(() => {
        const wasGrouped = prevGroupingEnabledRef.current;
        prevGroupingEnabledRef.current = groupingEnabled;

        if (groupingEnabled) {
            setSelectedItemIds(new Set(rows.map((r) => r.itemId)));
            if (!wasGrouped) setSelectionRevision((n) => n + 1);
            return;
        }

        if (wasGrouped || !showRowCheckbox) {
            setSelectedItemIds(new Set());
            if (wasGrouped) setSelectionRevision((n) => n + 1);
            return;
        }

        const validIds = new Set(rows.map((r) => r.itemId));
        let selectionPruned = false;
        setSelectedItemIds((prev) => {
            const next = new Set<string>();
            for (const id of prev) {
                if (validIds.has(id)) next.add(id);
            }
            selectionPruned = next.size !== prev.size;
            return next;
        });
        if (selectionPruned) setSelectionRevision((n) => n + 1);
    }, [groupingEnabled, showRowCheckbox, rows]);

    const toggleGroupId = useCallback((id: string) => {
        setExpandedGroupIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const openPropertiesEditor = useCallback((target: PropertiesEditTarget) => {
        setPropertiesTarget(target);
        setPropertiesInitialValues(undefined);
        setContextMenu(null);
    }, []);

    const bumpSelectionRevision = useCallback(() => {
        setSelectionRevision((n) => n + 1);
    }, []);

    const isItemSelected = useCallback(
        (itemId: string) => selectedItemIds.has(itemId),
        [selectedItemIds],
    );

    const toggleItemSelection = useCallback(
        (itemId: string) => {
            setSelectedItemIds((prev) => {
                const next = new Set(prev);
                if (next.has(itemId)) next.delete(itemId);
                else next.add(itemId);
                return next;
            });
            bumpSelectionRevision();
        },
        [bumpSelectionRevision],
    );

    const getGroupItemIds = useCallback(
        (groupId: string) => collectItemIdsInGroup(groupTree, groupId),
        [groupTree],
    );

    const isGroupFullySelected = useCallback(
        (groupId: string) => {
            const ids = getGroupItemIds(groupId);
            return ids.length > 0 && ids.every((id) => selectedItemIds.has(id));
        },
        [getGroupItemIds, selectedItemIds],
    );

    const isGroupPartiallySelected = useCallback(
        (groupId: string) => {
            const ids = getGroupItemIds(groupId);
            const selectedCount = ids.filter((id) => selectedItemIds.has(id)).length;
            return selectedCount > 0 && selectedCount < ids.length;
        },
        [getGroupItemIds, selectedItemIds],
    );

    const toggleGroupSelection = useCallback(
        (groupId: string) => {
            const ids = getGroupItemIds(groupId);
            setSelectedItemIds((prev) => {
                const next = new Set(prev);
                const allSelected = ids.length > 0 && ids.every((id) => next.has(id));
                for (const id of ids) {
                    if (allSelected) next.delete(id);
                    else next.add(id);
                }
                return next;
            });
            bumpSelectionRevision();
        },
        [getGroupItemIds, bumpSelectionRevision],
    );

    const areAllItemsSelected = useCallback(() => {
        if (rows.length === 0) return false;
        return rows.every((r) => selectedItemIds.has(r.itemId));
    }, [rows, selectedItemIds]);

    const areSomeItemsSelected = useCallback(() => {
        return rows.some((r) => selectedItemIds.has(r.itemId));
    }, [rows, selectedItemIds]);

    const toggleSelectAllItems = useCallback(() => {
        setSelectedItemIds((prev) => {
            const allSelected = rows.length > 0 && rows.every((r) => prev.has(r.itemId));
            if (allSelected) return new Set();
            return new Set(rows.map((r) => r.itemId));
        });
        bumpSelectionRevision();
    }, [rows, bumpSelectionRevision]);

    const handleGroupContextMenu = useCallback(
        (event: React.MouseEvent, groupId: string) => {
            if (!hasEditableProperties || !groupingEnabled) return;
            setContextMenu({
                mouseX: event.clientX,
                mouseY: event.clientY,
                target: {
                    kind: "bulk",
                    groupId,
                    label: getGroupLabel(groupTree, groupId),
                },
            });
        },
        [hasEditableProperties, groupingEnabled, groupTree],
    );

    const contextMenuBulkSelectedCount = useMemo(() => {
        if (contextMenu?.target.kind !== "bulk") return 0;
        return resolveBulkSelectedItemIds(
            groupTree,
            contextMenu.target.groupId,
            selectedItemIds,
        ).length;
    }, [contextMenu, groupTree, selectedItemIds]);

    const bulkPropertiesItemIds = useMemo(() => {
        if (propertiesTarget?.kind !== "bulk") return [];
        return resolveBulkSelectedItemIds(
            groupTree,
            propertiesTarget.groupId,
            selectedItemIds,
        );
    }, [propertiesTarget, groupTree, selectedItemIds]);

    const gridContext: DocumentLibraryGridAgContext = useMemo(
        () => ({
            toggleGroupId,
            canEditProperties: hasEditableProperties,
            onGroupContextMenu: groupingEnabled ? handleGroupContextMenu : undefined,
            selectionEnabled: rowSelectionEnabled,
            isItemSelected,
            toggleItemSelection,
            isGroupFullySelected,
            isGroupPartiallySelected,
            toggleGroupSelection,
            areAllItemsSelected,
            areSomeItemsSelected,
            toggleSelectAllItems,
            selectionRevision,
            groupActionsColumnWidth: 0,
        }),
        [
            toggleGroupId,
            hasEditableProperties,
            groupingEnabled,
            rowSelectionEnabled,
            showActions,
            handleGroupContextMenu,
            isItemSelected,
            toggleItemSelection,
            isGroupFullySelected,
            isGroupPartiallySelected,
            toggleGroupSelection,
            areAllItemsSelected,
            areSomeItemsSelected,
            toggleSelectAllItems,
            selectionRevision,
        ],
    );

    const rowsRef = useRef(rows);
    rowsRef.current = rows;

    const propertiesItemId =
        propertiesTarget?.kind === "item" ? propertiesTarget.itemId : null;
    const propertiesBulkKey =
        propertiesTarget?.kind === "bulk"
            ? `${propertiesTarget.groupId}:${bulkPropertiesItemIds.join(",")}`
            : null;

    useEffect(() => {
        if (!propertiesTarget) return;

        if (propertiesTarget.kind === "bulk") {
            setPropertiesInitialValues(
                uploadPrefillProperties ?? {},
            );
            return;
        }

        if (!propertiesItemId || editableKeys.length === 0) return;

        let cancelled = false;
        setPropertiesValuesLoading(true);
        client
            .getListItemFieldValues({
                itemId: propertiesItemId,
                fieldKeys: editableKeys,
            })
            .then((values) => {
                if (!cancelled) setPropertiesInitialValues(values);
            })
            .catch(() => {
                if (!cancelled) {
                    const row = rowsRef.current.find((r) => r.itemId === propertiesItemId);
                    const fallback: Record<string, unknown> = {};
                    for (const key of editableKeys) {
                        fallback[key] = row ? getCellValue(row, key) : "";
                    }
                    setPropertiesInitialValues(fallback);
                }
            })
            .finally(() => {
                if (!cancelled) setPropertiesValuesLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [
        propertiesItemId,
        propertiesBulkKey,
        editableKeysSignature,
        client,
        uploadPrefillSignature,
    ]);

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

    const onRowContextMenu = useCallback(
        (event: CellContextMenuEvent<DocumentLibraryGridRow>) => {
            if (!hasEditableProperties) return;
            const data = event.data;
            if (!data || data.rowType === "group") return;
            event.event?.preventDefault();
            const mouseEvent = event.event as MouseEvent | undefined;
            setContextMenu({
                mouseX: mouseEvent?.clientX ?? 0,
                mouseY: mouseEvent?.clientY ?? 0,
                target: { kind: "item", itemId: data.itemId, name: data.name },
            });
        },
        [hasEditableProperties],
    );

    const handleSaveProperties = useCallback(
        async (properties: Record<string, unknown>) => {
            if (!propertiesTarget) return;
            setPropertiesSubmitting(true);
            try {
                const itemIds =
                    propertiesTarget.kind === "item"
                        ? [propertiesTarget.itemId]
                        : bulkPropertiesItemIds;
                if (itemIds.length === 0) {
                    setToast({
                        kind: "error",
                        message: "No items selected to update.",
                    });
                    return;
                }
                const result = await client.updateListItemFields({ itemIds, properties });
                if (result.failures.length > 0) {
                    setToast({
                        kind: "error",
                        message: `Failed to update some items:\n${toastFromFieldUpdateFailures(result.failures)}`,
                    });
                } else {
                    setToast({
                        kind: "success",
                        message:
                            itemIds.length === 1
                                ? "Properties updated."
                                : `Updated properties on ${itemIds.length} items.`,
                    });
                    setPropertiesTarget(null);
                    await refresh();
                }
            } finally {
                setPropertiesSubmitting(false);
            }
        },
        [client, propertiesTarget, bulkPropertiesItemIds, refresh],
    );

    const columnDefs = useDocumentLibraryColumnDefs({
        columns,
        groupingEnabled,
        showRowCheckbox,
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
                    onRowContextMenu={hasEditableProperties ? onRowContextMenu : undefined}
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
                uploadColumns={hasEditableProperties ? [] : uploadColumns}
                fieldDefinitions={hasEditableProperties ? fieldDefinitions : []}
                definitionsLoading={hasEditableProperties && fieldDefinitionsLoading}
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

            <Menu
                open={contextMenu !== null}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem
                    disabled={
                        contextMenu?.target.kind === "bulk" &&
                        contextMenuBulkSelectedCount === 0
                    }
                    onClick={() => {
                        if (contextMenu) openPropertiesEditor(contextMenu.target);
                    }}
                >
                    <ListItemText
                        primary={
                            contextMenu?.target.kind === "bulk"
                                ? `Edit properties (${contextMenuBulkSelectedCount} selected)`
                                : "Edit properties"
                        }
                    />
                </MenuItem>
            </Menu>

            <PropertiesDrawer
                open={!!propertiesTarget}
                title={
                    propertiesTarget?.kind === "bulk"
                        ? "Edit properties (group)"
                        : "Edit properties"
                }
                subtitle={
                    propertiesTarget?.kind === "bulk"
                        ? `${propertiesTarget.label} — ${bulkPropertiesItemIds.length} item(s)`
                        : propertiesTarget?.kind === "item"
                            ? propertiesTarget.name
                            : undefined
                }
                submitDisabled={
                    propertiesTarget?.kind === "bulk" &&
                    bulkPropertiesItemIds.length === 0
                }
                definitions={fieldDefinitions}
                definitionsLoading={fieldDefinitionsLoading}
                initialValues={propertiesInitialValues}
                valuesLoading={propertiesValuesLoading}
                submitting={propertiesSubmitting}
                onClose={() => setPropertiesTarget(null)}
                onSubmit={handleSaveProperties}
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
