import { useCallback, useMemo, useState } from "react";
import type { CellContextMenuEvent } from "ag-grid-community";
import type {
    DocumentLibraryContextMenuState,
    DocumentLibraryGridRow,
} from "../../types";
import {
    getGroupLabel,
    resolveBulkSelectedItemIds,
    type GroupTreeNode,
} from "../../utils/groupTree";

type Params = {
    /** Whether property editing (and therefore the context menu) is available. */
    enabled: boolean;
    groupingEnabled: boolean;
    groupTree: GroupTreeNode[];
    selectedItemIds: Set<string>;
};

/** Owns the right-click context menu state for row and group "Edit properties" entries. */
export function useContextMenu({
    enabled,
    groupingEnabled,
    groupTree,
    selectedItemIds,
}: Params) {
    const [contextMenu, setContextMenu] =
        useState<DocumentLibraryContextMenuState | null>(null);

    const handleGroupContextMenu = useCallback(
        (event: React.MouseEvent, groupId: string) => {
            if (!enabled || !groupingEnabled) return;
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
        [enabled, groupingEnabled, groupTree],
    );

    const onRowContextMenu = useCallback(
        (event: CellContextMenuEvent<DocumentLibraryGridRow>) => {
            if (!enabled) return;
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
        [enabled],
    );

    const contextMenuBulkSelectedCount = useMemo(() => {
        if (contextMenu?.target.kind !== "bulk") return 0;
        return resolveBulkSelectedItemIds(
            groupTree,
            contextMenu.target.groupId,
            selectedItemIds,
        ).length;
    }, [contextMenu, groupTree, selectedItemIds]);

    return {
        contextMenu,
        setContextMenu,
        handleGroupContextMenu,
        onRowContextMenu,
        contextMenuBulkSelectedCount,
    };
}
