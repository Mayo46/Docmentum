import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DocumentLibraryItemRow } from "../types";
import type { DocumentLibraryGridAgContext } from "../common/GroupRowRenderer";
import {
    collectItemIdsInGroup,
    type GroupTreeNode,
} from "../utils/groupTree";

type UseDocumentLibrarySelectionParams = {
    rows: DocumentLibraryItemRow[];
    groupingEnabled: boolean;
    showRowCheckbox: boolean;
    groupTree: GroupTreeNode[];
    toggleGroupId: (id: string) => void;
    hasEditableProperties: boolean;
};

export function useDocumentLibrarySelection({
    rows,
    groupingEnabled,
    showRowCheckbox,
    groupTree,
    toggleGroupId,
    hasEditableProperties,
}: UseDocumentLibrarySelectionParams) {
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => new Set());
    const [selectionRevision, setSelectionRevision] = useState(0);
    const prevGroupingEnabledRef = useRef(true);

    const rowSelectionEnabled = groupingEnabled || showRowCheckbox;

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
            const allSelected =
                rows.length > 0 && rows.every((r) => prev.has(r.itemId));
            if (allSelected) return new Set();
            return new Set(rows.map((r) => r.itemId));
        });
        bumpSelectionRevision();
    }, [rows, bumpSelectionRevision]);

    const gridContext: DocumentLibraryGridAgContext = useMemo(
        () => ({
            toggleGroupId,
            canEditProperties: hasEditableProperties,
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
            rowSelectionEnabled,
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

    return {
        selectedItemIds,
        gridContext,
    };
}
