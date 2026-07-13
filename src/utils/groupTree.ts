import type {
    DocumentLibraryColumn,
    DocumentLibraryGridRow,
    DocumentLibraryItemRow,
} from "../types";
import { getCellValue, normalizeLookupKey } from "./columns";

export type GroupTreeNode =
    | {
          kind: "group";
          id: string;
          fieldKey: string;
          fieldHeaderName: string;
          groupValue: string;
          childCount: number;
          children: GroupTreeNode[];
      }
    | { kind: "leaf"; row: DocumentLibraryItemRow };

function formatGroupValue(raw: string): string {
    return raw === "" ? "(Empty)" : raw;
}

function stringifyCellValue(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }
    return String(value);
}

function countLeavesInForest(nodes: GroupTreeNode[]): number {
    let n = 0;
    for (const node of nodes) {
        if (node.kind === "leaf") n += 1;
        else n += countLeavesInForest(node.children);
    }
    return n;
}

export function collectAllGroupIds(nodes: GroupTreeNode[]): string[] {
    const ids: string[] = [];
    function walk(ns: GroupTreeNode[]) {
        for (const node of ns) {
            if (node.kind === "group") {
                ids.push(node.id);
                walk(node.children);
            }
        }
    }
    walk(nodes);
    return ids;
}

export function buildGroupTree(
    leaves: DocumentLibraryItemRow[],
    groupFieldKeys: string[],
    columnHeaderByKey: Map<string, string>,
    parentPath: string,
): GroupTreeNode[] {
    if (groupFieldKeys.length === 0) {
        return leaves.map((row) => ({ kind: "leaf" as const, row }));
    }

    const [firstKey, ...restKeys] = groupFieldKeys;
    const header = columnHeaderByKey.get(firstKey) ?? firstKey;
    const buckets = new Map<string, DocumentLibraryItemRow[]>();

    for (const row of leaves) {
        const cell = stringifyCellValue(getCellValue(row, firstKey));
        const bucketKey = cell === "" ? "\0empty\0" : cell;
        if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
        buckets.get(bucketKey)!.push(row);
    }

    const sortedEntries = Array.from(buckets.entries()).sort(([a], [b]) => {
        if (a === "\0empty\0") return 1;
        if (b === "\0empty\0") return -1;
        return a.localeCompare(b, undefined, { sensitivity: "base" });
    });

    const nodes: GroupTreeNode[] = [];
    let idx = 0;
    for (const [bucketKey, bucketRows] of sortedEntries) {
        const displayValue = bucketKey === "\0empty\0" ? "" : bucketKey;
        const groupValueLabel = formatGroupValue(displayValue);
        const id = `${parentPath}/g${idx++}:${firstKey}:${encodeURIComponent(bucketKey)}`;
        const children: GroupTreeNode[] =
            restKeys.length === 0
                ? bucketRows.map((row) => ({ kind: "leaf" as const, row }))
                : buildGroupTree(bucketRows, restKeys, columnHeaderByKey, id);
        const childCount = countLeavesInForest(children);
        nodes.push({
            kind: "group",
            id,
            fieldKey: firstKey,
            fieldHeaderName: header,
            groupValue: groupValueLabel,
            childCount,
            children,
        });
    }
    return nodes;
}

export function flattenGroupTree(
    nodes: GroupTreeNode[],
    expandedIds: Set<string>,
    level: number,
    out: DocumentLibraryGridRow[],
): void {
    for (const node of nodes) {
        if (node.kind === "group") {
            const isExpanded = expandedIds.has(node.id);
            out.push({
                rowType: "group",
                id: node.id,
                level,
                fieldKey: node.fieldKey,
                fieldHeaderName: node.fieldHeaderName,
                groupValue: node.groupValue,
                childCount: node.childCount,
                expanded: isExpanded,
            });
            if (isExpanded) {
                flattenGroupTree(node.children, expandedIds, level + 1, out);
            }
        } else {
            out.push({
                rowType: "data",
                treeLevel: level,
                ...node.row,
            });
        }
    }
}

export function resolveGroupByKeys(
    groupBy: string[] | undefined,
    columns: DocumentLibraryColumn[],
): string[] {
    if (!groupBy?.length) return [];
    const colByNorm = new Map<string, string>();
    for (const c of columns) {
        colByNorm.set(normalizeLookupKey(c.key), c.key);
    }
    const seen = new Set<string>();
    const resolved: string[] = [];
    for (const g of groupBy) {
        const k = typeof g === "string" ? g.trim() : "";
        if (!k) continue;
        const canon = colByNorm.get(normalizeLookupKey(k));
        if (canon && !seen.has(canon)) {
            seen.add(canon);
            resolved.push(canon);
        }
    }
    return resolved;
}

export function columnHeaderMap(columns: DocumentLibraryColumn[]): Map<string, string> {
    const m = new Map<string, string>();
    for (const c of columns) {
        m.set(c.key, c.headerName);
    }
    return m;
}

function findGroupNode(nodes: GroupTreeNode[], groupId: string): Extract<GroupTreeNode, { kind: "group" }> | null {
    for (const node of nodes) {
        if (node.kind === "group") {
            if (node.id === groupId) return node;
            const nested = findGroupNode(node.children, groupId);
            if (nested) return nested;
        }
    }
    return null;
}

function collectLeafItemIds(nodes: GroupTreeNode[]): string[] {
    const ids: string[] = [];
    for (const node of nodes) {
        if (node.kind === "leaf") ids.push(node.row.itemId);
        else ids.push(...collectLeafItemIds(node.children));
    }
    return ids;
}

/** All drive item ids under a group row (for bulk metadata update). */
export function collectItemIdsInGroup(
    groupTree: GroupTreeNode[],
    groupId: string,
): string[] {
    const group = findGroupNode(groupTree, groupId);
    if (!group) return [];
    return collectLeafItemIds(group.children);
}

export function getGroupLabel(groupTree: GroupTreeNode[], groupId: string): string {
    const group = findGroupNode(groupTree, groupId);
    if (!group) return "Group";
    return `${group.fieldHeaderName}: ${group.groupValue}`;
}

/** Selected item ids that belong to a group row. */
export function resolveBulkSelectedItemIds(
    groupTree: GroupTreeNode[],
    groupId: string,
    selectedItemIds: Set<string>,
): string[] {
    return collectItemIdsInGroup(groupTree, groupId).filter((id) =>
        selectedItemIds.has(id),
    );
}
