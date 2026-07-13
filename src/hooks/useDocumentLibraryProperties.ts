import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellContextMenuEvent } from "ag-grid-community";
import type {
    DocumentLibraryContextMenuState,
    DocumentLibraryGraphClient,
    DocumentLibraryGridRow,
    DocumentLibraryItemRow,
    DocumentLibraryPropertiesEditTarget,
    DocumentLibraryToast,
} from "../types";
import { toastFromFieldUpdateFailures } from "../common/helpers";
import { useEditableFieldDefinitions } from "./useEditableFieldDefinitions";
import { normalizeEditablePropertiesInput } from "../utils/editableProperties";
import { getCellValue } from "../utils/columns";
import {
    getGroupLabel,
    resolveBulkSelectedItemIds,
    type GroupTreeNode,
} from "../utils/groupTree";

type UseDocumentLibraryPropertiesParams = {
    client: DocumentLibraryGraphClient;
    editableProperties?: unknown;
    uploadPrefillProperties?: Record<string, unknown>;
    rows: DocumentLibraryItemRow[];
    groupTree: GroupTreeNode[];
    selectedItemIds: Set<string>;
    groupingEnabled: boolean;
    refresh: () => Promise<void>;
    onToast: (toast: DocumentLibraryToast) => void;
};

export function useDocumentLibraryProperties({
    client,
    editableProperties,
    uploadPrefillProperties,
    rows,
    groupTree,
    selectedItemIds,
    groupingEnabled,
    refresh,
    onToast,
}: UseDocumentLibraryPropertiesParams) {
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

    const [contextMenu, setContextMenu] = useState<DocumentLibraryContextMenuState | null>(
        null,
    );
    const [propertiesTarget, setPropertiesTarget] =
        useState<DocumentLibraryPropertiesEditTarget | null>(null);
    const [propertiesInitialValues, setPropertiesInitialValues] = useState<
        Record<string, unknown> | undefined
    >();
    const [propertiesValuesLoading, setPropertiesValuesLoading] = useState(false);
    const [propertiesSubmitting, setPropertiesSubmitting] = useState(false);

    const rowsRef = useRef(rows);
    rowsRef.current = rows;

    const openPropertiesEditor = useCallback((target: DocumentLibraryPropertiesEditTarget) => {
        setPropertiesTarget(target);
        setPropertiesInitialValues(undefined);
        setContextMenu(null);
    }, []);

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

    const propertiesItemId =
        propertiesTarget?.kind === "item" ? propertiesTarget.itemId : null;
    const propertiesBulkKey =
        propertiesTarget?.kind === "bulk"
            ? `${propertiesTarget.groupId}:${bulkPropertiesItemIds.join(",")}`
            : null;

    useEffect(() => {
        if (!propertiesTarget) return;

        if (propertiesTarget.kind === "bulk") {
            setPropertiesInitialValues(uploadPrefillProperties ?? {});
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
                    const row = rowsRef.current.find(
                        (r) => r.itemId === propertiesItemId,
                    );
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
        propertiesTarget,
        editableKeys.length,
    ]);

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
                    onToast({
                        kind: "error",
                        message: "No items selected to update.",
                    });
                    return;
                }
                const result = await client.updateListItemFields({
                    itemIds,
                    properties,
                });
                if (result.failures.length > 0) {
                    onToast({
                        kind: "error",
                        message: `Failed to update some items:\n${toastFromFieldUpdateFailures(result.failures)}`,
                    });
                } else {
                    onToast({
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
        [client, propertiesTarget, bulkPropertiesItemIds, refresh, onToast],
    );

    return {
        hasEditableProperties,
        fieldDefinitions,
        fieldDefinitionsLoading,
        contextMenu,
        setContextMenu,
        contextMenuBulkSelectedCount,
        bulkPropertiesItemIds,
        propertiesTarget,
        setPropertiesTarget,
        propertiesInitialValues,
        propertiesValuesLoading,
        propertiesSubmitting,
        openPropertiesEditor,
        handleGroupContextMenu,
        onRowContextMenu,
        handleSaveProperties,
    };
}
