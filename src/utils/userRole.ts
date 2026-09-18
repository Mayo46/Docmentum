import type { DocumentLibraryUserRole } from "../types/documentLibrary";

export type { DocumentLibraryUserRole };

function normalizeUserRole(role?: string): DocumentLibraryUserRole | undefined {
  const normalized = role?.trim().toLowerCase();
  if (normalized === "admin" || normalized === "importer" || normalized === "viewer") {
    return normalized;
  }
  return undefined;
}

/** Viewers can read/view only. Admin and Importer can import documents. */
export function canImportDocuments(role?: string): boolean {
  return normalizeUserRole(role) !== "viewer";
}

/** Viewers can open version history but cannot restore. */
export function canRestoreVersions(role?: string): boolean {
  return normalizeUserRole(role) !== "viewer";
}
