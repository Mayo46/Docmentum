import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { DocumentLibraryColumn, DocumentLibraryGridRow, DocumentLibraryItemRow } from "../types";
import {
    buildGroupTree,
    collectAllGroupIds,
    columnHeaderMap,
    flattenGroupTree,
    resolveGroupByKeys,
} from "../utils/groupTree";

type UseDocumentLibraryGroupingParams = {
    rows: DocumentLibraryItemRow[];
    columns: DocumentLibraryColumn[];
};

export function useDocumentLibraryGrouping({
    rows,
    columns,
}: UseDocumentLibraryGroupingParams) {
    const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());
    const [userGroupByKey, setUserGroupByKey] = useState<string | null>("ContentType");

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

    return {
        userGroupByKey,
        setUserGroupByKey,
        groupingEnabled,
        groupTree,
        gridRows,
        toggleGroupId,
    };
}
