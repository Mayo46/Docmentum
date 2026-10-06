import moment from "moment";
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

export function isReceivedDateField(key: string): boolean {
  const normalized = normalizeLookupKey(key);
  return normalized === "ReceivedDate" || normalized === "receiveddate";
}

export function todayDisplayDate() {
  return moment().format("MM/DD/YYYY");
}

/** Base field definition from a host key before dropdown/choice enrichment. */
export function fallbackFieldDefinition(
  key: string,
  label?: string,
): DocumentLibraryFieldDefinition {
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
    return def.fieldType === "boolean"
      ? false
      : def.allowMultipleChoices
        ? []
        : "";
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

  if (def.fieldType === "dateTime" && typeof raw === "string") {
    // const d = raw.includes("T") ? raw.split("T")[0] : raw;
    return moment(raw).format("MM/DD/YYYY");
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

  if (def.fieldType === "dateTime" && typeof value === "string") {
    const parsed = moment(value, ["MM/DD/YYYY", moment.ISO_8601], true);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : value;
  }

  if (typeof value === "string") return value;

  return value;
}

export function filterFieldDefinitionsForUpload(
  definitions: DocumentLibraryFieldDefinition[],
): DocumentLibraryFieldDefinition[] {
  return definitions.filter(
    (d) =>
      !d.readOnly && !UPLOAD_RESERVED_FIELD_KEYS.has(normalizeLookupKey(d.key)),
  );
}
