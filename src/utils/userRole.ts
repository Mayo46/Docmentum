import type { DocumentLibraryUserRole } from "../types/documentLibrary";
import type { DocumentLibraryItemRow } from "../types";

export type { DocumentLibraryUserRole };

export function normalizeUserRole(
  role?: string,
): DocumentLibraryUserRole | undefined {
  const normalized = role?.trim().toLowerCase();
  if (
    normalized === "admin" ||
    normalized === "importer" ||
    normalized === "viewer"
  ) {
    return normalized;
  }
  return undefined;
}

export function isImporterRole(role?: string): boolean {
  return normalizeUserRole(role) === "importer";
}

/** Viewers can read/view only. Admin and Importer can import documents. */
export function canImportDocuments(role?: string): boolean {
  return normalizeUserRole(role) !== "viewer";
}

/** Viewers can open version history but cannot restore. */
export function canRestoreVersions(role?: string): boolean {
  return normalizeUserRole(role) !== "viewer";
}

/** Viewers cannot delete. Admin and Importer can see the Delete action. */
export function canDeleteDocuments(role?: string): boolean {
  const normalizedRole = normalizeUserRole(role);
  return normalizedRole === "admin" || normalizedRole === "importer";
}

/**
 * Per-document delete permission.
 * Admin: any document. Importer: only when emails match. Viewer/unknown: never.
 */
export function canDeleteDocument(
  role?: string,
  userEmail?: string,
  createdByEmail?: string,
  checkoutUserId?: number,
): boolean {
  // A checked-out document cannot be deleted by anyone.
  if (checkoutUserId != null) {
    return false;
  }
  const normalizedRole = normalizeUserRole(role);

  if (normalizedRole === "admin") {
    return true;
  }

  if (normalizedRole !== "importer") {
    return false;
  }

  if (!userEmail || !createdByEmail) {
    return false;
  }

  return userEmail.trim().toLowerCase() === createdByEmail.trim().toLowerCase();
}

export function splitRowsByDeletePermission(
  rows: DocumentLibraryItemRow[],
  role?: string,
  userEmail?: string,
): {
  owned: DocumentLibraryItemRow[];
  skipped: DocumentLibraryItemRow[];
} {
  const owned: DocumentLibraryItemRow[] = [];
  const skipped: DocumentLibraryItemRow[] = [];

  for (const row of rows) {
    if (
      canDeleteDocument(role, userEmail, row.createdByEmail, row.checkoutUserId)
    ) {
      owned.push(row);
    } else {
      skipped.push(row);
    }
  }

  return { owned, skipped };
}