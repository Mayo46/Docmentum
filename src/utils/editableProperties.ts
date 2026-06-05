import type { DocumentLibraryEditableProperty } from "../types";
import { normalizeColumnsInput, normalizeLookupKey, toCanonicalKey } from "./columns";

export type NormalizedEditableProperties = {
    keys: string[];
    labelOverrides: Map<string, string>;
};

function uniqueKeys(keys: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const key of keys) {
        const trimmed = key.trim();
        if (!trimmed || seen.has(trimmed)) continue;
        seen.add(trimmed);
        out.push(trimmed);
    }
    return out;
}

/**
 * Accepts the same shapes as grid `columns`: string[], object map, JSON string, or
 * `{ key, label }[]` for editable field configuration.
 */
export function normalizeEditablePropertiesInput(input?: unknown): NormalizedEditableProperties {
    const labelOverrides = new Map<string, string>();

    if (input == null) {
        return { keys: [], labelOverrides };
    }

    if (Array.isArray(input)) {
        const keys: string[] = [];
        for (const entry of input) {
            if (typeof entry === "string") {
                const k = entry.trim();
                if (k) keys.push(k);
                continue;
            }
            if (entry && typeof entry === "object" && "key" in entry) {
                const prop = entry as DocumentLibraryEditableProperty;
                const k = prop.key?.trim();
                if (!k) continue;
                keys.push(k);
                if (prop.label?.trim()) {
                    labelOverrides.set(k, prop.label.trim());
                }
            }
        }
        return { keys: uniqueKeys(keys), labelOverrides };
    }

    const keys = uniqueKeys(normalizeColumnsInput(input));

    if (typeof input === "object") {
        for (const [rawKey, value] of Object.entries(input as Record<string, unknown>)) {
            const fieldKey =
                keys.find((k) => normalizeLookupKey(k) === normalizeLookupKey(rawKey)) ??
                toCanonicalKey(rawKey);
            if (!fieldKey) continue;

            if (typeof value === "string") {
                const label = value.trim();
                if (!label) continue;
                const valueAsField = toCanonicalKey(label);
                if (normalizeLookupKey(valueAsField) !== normalizeLookupKey(fieldKey)) {
                    labelOverrides.set(fieldKey, label);
                }
            }
        }
    }

    return { keys, labelOverrides };
}

/** @deprecated Use normalizeEditablePropertiesInput — kept for call sites that only need keys. */
export function normalizeEditablePropertyKeys(input?: unknown): string[] {
    return normalizeEditablePropertiesInput(input).keys;
}

export function editablePropertyLabel(
    key: string,
    definitions: Map<string, { displayName: string }>,
    overrides?: Map<string, string>,
): string {
    return overrides?.get(key) ?? definitions.get(key)?.displayName ?? key;
}
