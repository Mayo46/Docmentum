import type {
  DocumentLibraryGraphClient,
  DocumentLibraryItemRow,
} from "../types";

/**
 * All selected files share one document set, so resolve that ID once.
 * Prefers IDs already in memory; Graph is only queried if those are missing.
 */
export async function resolveDocSetId(params: {
  rows: DocumentLibraryItemRow[];
  fallbackDocSetId?: string;
  client: DocumentLibraryGraphClient;
}): Promise<string> {
  const fallback = params.fallbackDocSetId?.trim();
  if (fallback) return fallback;

  const fromRow = params.rows
    .find((row) => row.parentReference?.itemId?.trim())
    ?.parentReference?.itemId?.trim();
  if (fromRow) return fromRow;

  const first = params.rows[0];
  if (!first) {
    throw new Error("Unable to resolve document set.");
  }

  const parentId = await params.client.getParentDriveItemId({
    itemId: first.itemId,
  });
  if (parentId?.trim()) return parentId.trim();

  const parentName = first.parentReference?.name?.trim();
  if (parentName) {
    return params.client.getDriveItemIdByName({ name: parentName });
  }

  throw new Error(`Unable to resolve document set for "${first.name}".`);
}

export async function deleteDocumentsByDocSet(params: {
  rows: DocumentLibraryItemRow[];
  fallbackDocSetId?: string;
  client: DocumentLibraryGraphClient;
  onDeleteDocuments: (itemIds: string[], docSetId: string) => Promise<void>;
}): Promise<void> {
  const docSetId = await resolveDocSetId({
    rows: params.rows,
    fallbackDocSetId: params.fallbackDocSetId,
    client: params.client,
  });

  await params.onDeleteDocuments(
    params.rows.map((row) => row.itemId),
    docSetId,
  );
}
