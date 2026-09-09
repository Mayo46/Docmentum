import type {
  DocumentLibraryEditableProperty,
  DocumentLibraryFieldType,
} from "../types";
import {
  normalizeColumnsInput,
  normalizeLookupKey,
  toCanonicalKey,
} from "./columns";

export type EditablePropertyConfig = {
  displayName?: string;
  readOnly?: boolean;
  required?: boolean;
  fieldType?: DocumentLibraryFieldType;
  columnGroup?: string;
};

export type NormalizedEditableProperties = {
  keys: string[];
  labelOverrides: Map<string, string>;
  configs: Map<string, EditablePropertyConfig>;
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

function setConfig(
  configs: Map<string, EditablePropertyConfig>,
  key: string,
  config: EditablePropertyConfig,
) {
  configs.set(key, config);
  configs.set(normalizeLookupKey(key), config);
}

function configFromEntry(
  entry: DocumentLibraryEditableProperty,
): EditablePropertyConfig {
  const displayName =
    entry.displayName?.trim() || entry.label?.trim() || undefined;
  return {
    displayName,
    readOnly: entry.readOnly,
    required: entry.required,
    fieldType: entry.columnType,
    columnGroup: entry.group,
  };
}

function isPropertyEntry(
  value: unknown,
): value is DocumentLibraryEditableProperty {
  return Boolean(value && typeof value === "object" && "key" in value);
}

/**
 * Accepts:
 * - `{ key, displayName, readOnly, required, columnType, group }[]` (rich array)
 * - string[]
 * - `{ DocumentType: "" }` / `{ DocumentType: "Document Type" }`
 * - `{ DocumentType: { displayName, readOnly, required, columnType } }`
 */
export function normalizeEditablePropertiesInput(
  input?: unknown,
): NormalizedEditableProperties {
  const labelOverrides = new Map<string, string>();
  const configs = new Map<string, EditablePropertyConfig>();

  if (input == null) {
    return { keys: [], labelOverrides, configs };
  }

  if (Array.isArray(input)) {
    const keys: string[] = [];
    for (const entry of input) {
      if (typeof entry === "string") {
        const k = entry.trim();
        if (k) keys.push(k);
        continue;
      }
      if (!isPropertyEntry(entry)) continue;
      const k = entry.key?.trim();
      if (!k) continue;
      keys.push(k);
      const config = configFromEntry(entry);
      setConfig(configs, k, config);
      if (config.displayName) labelOverrides.set(k, config.displayName);
    }
    return { keys: uniqueKeys(keys), labelOverrides, configs };
  }

  if (typeof input === "object") {
    const keys: string[] = [];
    for (const [rawKey, value] of Object.entries(
      input as Record<string, unknown>,
    )) {
      const fieldKey = toCanonicalKey(rawKey) || rawKey.trim();
      if (!fieldKey) continue;
      keys.push(fieldKey);

      if (typeof value === "string") {
        const label = value.trim();
        if (
          label &&
          normalizeLookupKey(toCanonicalKey(label) || label) !==
            normalizeLookupKey(fieldKey)
        ) {
          labelOverrides.set(fieldKey, label);
          setConfig(configs, fieldKey, { displayName: label });
        }
        continue;
      }

      if (value && typeof value === "object") {
        const entry = value as Partial<DocumentLibraryEditableProperty>;
        const config = configFromEntry({ key: fieldKey, ...entry });
        setConfig(configs, fieldKey, config);
        if (config.displayName)
          labelOverrides.set(fieldKey, config.displayName);
      }
    }
    return { keys: uniqueKeys(keys), labelOverrides, configs };
  }

  if (typeof input === "string") {
    const keys = uniqueKeys(normalizeColumnsInput(input));
    return { keys, labelOverrides, configs };
  }

  return { keys: [], labelOverrides, configs };
}

export function getEditablePropertyConfig(
  configs: Map<string, EditablePropertyConfig>,
  key: string,
): EditablePropertyConfig | undefined {
  return configs.get(key) ?? configs.get(normalizeLookupKey(key));
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
