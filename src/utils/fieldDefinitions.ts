import type { DocumentLibraryFieldDefinition } from "../types";
import { normalizeLookupKey } from "./columns";

/** List fields handled by dedicated upload UI — omit from editable property form on upload. */
const UPLOAD_RESERVED_FIELD_KEYS = new Set(["contenttype"]);

/**
 * Fields that identify a single item (the file name) and therefore cannot be applied
 * across a bulk/multi-selection update — doing so makes SharePoint reject the request
 * with `nameAlreadyExists` since two files can't share a name in the same folder.
 */
const PER_ITEM_UNIQUE_FIELD_KEYS = new Set([
    "name",
    "fileleafref",
    "filename",
    "linkfilename",
    "linkfilenamenomenu",
]);

export function isPerItemUniqueField(key: string): boolean {
    return PER_ITEM_UNIQUE_FIELD_KEYS.has(normalizeLookupKey(key));
}

type GraphListColumn = {
    name?: string;
    displayName?: string;
    columnType?: string;
    readOnly?: boolean;
    hidden?: boolean;
    choice?: {
        choices?: string[];
        allowTextEntry?: boolean;
        displayAs?: string;
    };
    text?: { allowMultipleLines?: boolean };
    number?: unknown;
    dateTime?: unknown;
    boolean?: unknown;
    columnGroup?: string;
};

/** True when a Graph list column should never be surfaced in the properties form. */
export function isHiddenGraphListColumn(col: GraphListColumn): boolean {
    return col.hidden === true;
}

function resolveFieldType(
    columnType: string,
    col: GraphListColumn,
): Pick<DocumentLibraryFieldDefinition, "fieldType" | "choices" | "allowMultipleChoices"> {
    if (columnType === "choice" && col.choice?.choices?.length) {
        return {
            fieldType: "choice",
            choices: [...col.choice.choices],
            allowMultipleChoices: false,
        };
    }

    if (columnType === "number" || columnType === "currency") {
        return { fieldType: "number" };
    }

    if (columnType === "datetime" || columnType === "date") {
        return { fieldType: "date" };
    }

    if (columnType === "boolean") {
        return { fieldType: "boolean" };
    }

    if (columnType === "text" || columnType === "note" || columnType === "") {
        const multiline =
            columnType === "note" || col.text?.allowMultipleLines === true;
        return { fieldType: multiline ? "multiline" : "text" };
    }

    return { fieldType: "text" };
}

export function parseGraphListColumn(col: GraphListColumn): DocumentLibraryFieldDefinition | null {
    const key = col.name?.trim();
    if (!key) return null;

    const displayName = col.displayName?.trim() || key;
    const columnType = (col.columnType ?? "").toLowerCase();

    return {
        key,
        displayName,
        readOnly: col.readOnly === true,
        columnGroup: col.columnGroup,
        ...resolveFieldType(columnType, col),
    };
}

/** Fallback when Graph column metadata is unavailable (e.g. custom field). */
export function fallbackFieldDefinition(key: string, label?: string): DocumentLibraryFieldDefinition {
    return {
        key,
        displayName: label?.trim() || key,
        fieldType: "text",
    };
}

export function formatFieldValueForInput(
    def: DocumentLibraryFieldDefinition,
    raw: unknown,
): string | boolean | string[] {
    if (raw === null || raw === undefined) {
        return def.fieldType === "boolean" ? false : def.allowMultipleChoices ? [] : "";
    }

    if (def.fieldType === "boolean") {
        return raw === true || raw === "true" || raw === 1 || raw === "1";
    }

    if (def.allowMultipleChoices) {
        if (Array.isArray(raw)) return raw.map(String);
        if (typeof raw === "string") {
            return raw
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter(Boolean);
        }
        return [];
    }

    if (def.fieldType === "date" && typeof raw === "string") {
        const d = raw.includes("T") ? raw.split("T")[0] : raw;
        return d;
    }

    return String(raw);
}

export function formatFieldValueForPatch(
    def: DocumentLibraryFieldDefinition,
    value: string | boolean | string[],
): unknown {
    if (def.fieldType === "boolean") return !!value;

    if (def.allowMultipleChoices && Array.isArray(value)) {
        return value.length > 0 ? value : [];
    }

    if (def.fieldType === "number") {
        const n = typeof value === "string" ? Number(value) : Number(value);
        return Number.isFinite(n) ? n : value;
    }

    if (typeof value === "string") return value;
    return value;
}

export function filterFieldDefinitionsForUpload(
    definitions: DocumentLibraryFieldDefinition[],
): DocumentLibraryFieldDefinition[] {
    return definitions.filter(
        (d) =>
            !d.readOnly &&
            !UPLOAD_RESERVED_FIELD_KEYS.has(normalizeLookupKey(d.key)),
    );
}
