import { formatContentTypeValue } from "../common/helpers";
import type { DocumentLibraryItemRow } from "../types";
import { DEFAULT_DRIVE_SELECT_COLUMNS, DEFAULT_FIELD_SELECT_COLUMNS } from "./constants";

export function normalizeLookupKey(value: string) {
    return value.toLowerCase().replace(/[\s_-]+/g, "");
}

function canonicalColumnKey(column: string) {
    const normalized = normalizeLookupKey(column);
    if (normalized === "contenttype") return "ContentType";
    if (normalized === "createdby") return "Author";
    if (normalized === "modifiedby") return "Editor";
    if (normalized === "checkedoutto") return "CheckoutUser";
    if (normalized === "checkincomment") return "_CheckinComment";
    if (normalized === "title") return "Title";
    if (normalized === "name") return "name";
    if (normalized === "created") return "Created";
    if (normalized === "modified") return "Modified";
    return column;
}

export function toCanonicalKey(value: unknown): string {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    return canonicalColumnKey(trimmed);
}

function uniqueNonEmpty(values: string[]) {
    return Array.from(new Set(values.filter((v) => v.length > 0)));
}

function parseBracketList(raw: string): string[] {
    const inner = raw.slice(1, -1).trim();
    if (!inner) return [];
    return inner
        .split(",")
        .map((c) =>
            c
                .trim()
                .replace(/^['"]|['"]$/g, "")
                .replace(/:.+$/, "")
                .trim(),
        )
        .map((c) => toCanonicalKey(c))
        .filter((c) => c.length > 0);
}

function parseColumnsObject(obj: Record<string, unknown>): string[] {
    const entries = Object.entries(obj);
    if (entries.length === 0) return [];

    const allNumericKeys = entries.every(([key]) => /^\d+$/.test(key));
    if (allNumericKeys) {
        return entries
            .map(([, value]) => toCanonicalKey(value))
            .filter((c) => c.length > 0);
    }

    return entries
        .flatMap(([key, value]) => {
            const normalizedKey = toCanonicalKey(key);
            if (typeof value === "boolean") return value ? [normalizedKey] : [];
            if (typeof value === "string") {
                const normalizedValue = toCanonicalKey(value);
                return [normalizedValue || normalizedKey];
            }
            return normalizedKey ? [normalizedKey] : [];
        })
        .filter((c) => c.length > 0);
}

function getFieldValueCaseInsensitive(
    fields: Record<string, unknown> | undefined,
    targetKey: string,
) {
    if (!fields) return undefined;
    const canonicalTarget = normalizeLookupKey(targetKey);
    for (const [key, value] of Object.entries(fields)) {
        if (normalizeLookupKey(key) === canonicalTarget) return value;
    }
    return undefined;
}


export function getCellValue(
    row: DocumentLibraryItemRow | undefined,
    columnKey: string,
) {
    if (!row) return "";
    const key = normalizeLookupKey(columnKey);
    if (key === "name") return row.name ?? "";
    if (key === "title") {
        return (
            getFieldValueCaseInsensitive(row.fields, "Title") ??
            row.fields?.[columnKey] ??
            row.name ??
            ""
        );
    }
    if (key === "contenttype") {
        if (row.contentTypeName) return row.contentTypeName;
        const fromFields =
            formatContentTypeValue(
                getFieldValueCaseInsensitive(row.fields, "ContentType"),
            ) || formatContentTypeValue(row.fields?.[columnKey]);
        if (fromFields) return fromFields;
        return "";
    }
    if (key === "checkoutuser") {
        return getFieldValueCaseInsensitive(row.fields, "CheckoutUser") ?? "";
      }
    if (key === "modified")
        return (
            getFieldValueCaseInsensitive(row.fields, "Modified") ?? ""
        );
    if (key === "created")
        return (
            getFieldValueCaseInsensitive(row.fields, "Created") ?? ""
        );
    if (key === "createdby")
        return row.createdByDisplayName ?? "";
    if (key === "modifiedby")
        return row.modifiedByDisplayName ?? "";
    return (
        row.fields?.[columnKey] ??
        getFieldValueCaseInsensitive(row.fields, columnKey) ??
        ""
    );
}

export function normalizeColumnsInput(columns?: unknown): string[] {
    if (!columns) return [];

    if (Array.isArray(columns)) {
        return uniqueNonEmpty(columns.map((c) => toCanonicalKey(c)));
    }

    if (typeof columns === "string") {
        const raw = columns.trim();
        if (!raw) return [];

        // Support Storybook/free-text entries like "{name}" or "[name,Title]".
        if (
            (raw.startsWith("{") && raw.endsWith("}")) ||
            (raw.startsWith("[") && raw.endsWith("]"))
        ) {
            return uniqueNonEmpty(parseBracketList(raw));
        }

        // Support JSON strings, e.g. '["name"]' or '{"name":true}'
        try {
            const parsed = JSON.parse(raw);
            return normalizeColumnsInput(parsed);
        } catch {
            // Non-JSON string path below
        }

        return uniqueNonEmpty(
            raw.split(",").map((c) => toCanonicalKey(c)),
        );
    }

    if (typeof columns === "object") {
        return uniqueNonEmpty(parseColumnsObject(columns as Record<string, unknown>));
    }

    return [];
}

export function buildDriveItemSelect(columns?: unknown) {
    const normalizedColumns = normalizeColumnsInput(columns);
    if (normalizedColumns.length === 0) {
        return DEFAULT_DRIVE_SELECT_COLUMNS.join(",");
    }

    return uniqueNonEmpty([
        ...DEFAULT_DRIVE_SELECT_COLUMNS,
        ...normalizedColumns,
    ]).join(",");
}

export function buildFieldSelect(columns?: unknown) {
    const normalizedColumns = normalizeColumnsInput(columns);
    const selected =
        normalizedColumns.length > 0
            ? normalizedColumns
            : DEFAULT_FIELD_SELECT_COLUMNS;
    return uniqueNonEmpty(selected).join(",");
}
