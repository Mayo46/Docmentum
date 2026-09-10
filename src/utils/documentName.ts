import type { DocumentLibraryGraphClient, DocumentLibraryItemRow } from "../types";
import { getCellValue, normalizeLookupKey } from "./columns";

export const DOCUMENT_NAME_FIELD_KEY = "DocumentName";
export const DUPLICATE_DOCUMENT_NAME_MESSAGE =
  "Document name cannot be the same.";

export function isDocumentNameField(key: string): boolean {
  return normalizeLookupKey(key) === "documentname";
}

export function documentNameFieldKey(
  definitions: Array<{ key: string }>,
): string | undefined {
  return definitions.find((d) => isDocumentNameField(d.key))?.key;
}

export function getEnteredDocumentName(
  properties: Record<string, unknown>,
): string | undefined {
  for (const [key, value] of Object.entries(properties)) {
    if (!isDocumentNameField(key)) continue;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function siblingDocumentName(row: DocumentLibraryItemRow): string {
  return String(getCellValue(row, DOCUMENT_NAME_FIELD_KEY) ?? "").trim();
}

export function isSameDocumentName(left: string, right: string): boolean {
  return left.localeCompare(right, undefined, { sensitivity: "accent" }) === 0;
}

export type DuplicateDocumentNameResult = "unique" | "duplicate" | "unavailable";

/**
 * Returns whether `enteredName` is already used by a sibling in the same Doc Set.
 * API failures return `"unavailable"` so callers do not treat them as duplicates.
 */
export async function checkDuplicateDocumentName(params: {
  client: DocumentLibraryGraphClient;
  currentItemId: string;
  enteredName: string;
  originalName?: string;
}): Promise<DuplicateDocumentNameResult> {
  const enteredName = params.enteredName.trim();
  if (!enteredName || !params.currentItemId) return "unique";
  if (
    params.originalName != null &&
    isSameDocumentName(enteredName, params.originalName.trim())
  ) {
    return "unique";
  }

  try {
    const parentId = await params.client.getParentDriveItemId({
      itemId: params.currentItemId,
    });
    if (!parentId) return "unique";

    const siblings = await params.client.listChildren({
      parentDriveItemId: parentId,
      fieldKeys: [DOCUMENT_NAME_FIELD_KEY],
    });

    const isDuplicate = siblings.some(
      (document) =>
        document.itemId !== params.currentItemId &&
        !document.isContainer &&
        isSameDocumentName(siblingDocumentName(document), enteredName),
    );
    return isDuplicate ? "duplicate" : "unique";
  } catch {
    return "unavailable";
  }
}
