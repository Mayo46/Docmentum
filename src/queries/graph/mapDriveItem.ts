import type { DocumentLibraryItemRow } from "../../types";
import { getFieldDisplayName } from "./helpers";

/** Maps a Graph driveItem (+ optional listItem.fields) to a grid row. */
export function mapDriveItemToRow(item: Record<string, any>): DocumentLibraryItemRow {
  const fields: Record<string, unknown> =
    (item?.listItem?.fields as Record<string, unknown>) ?? {};

  const ctRaw = fields.ContentType;
  let contentTypeName: string | undefined;
  if (typeof ctRaw === "string" && ctRaw.trim()) {
    const s = ctRaw.trim();
    contentTypeName =
      /^0x[0-9A-F]+$/i.test(s) && s.length > 8 ? undefined : s;
  } else if (ctRaw && typeof ctRaw === "object") {
    const o = ctRaw as Record<string, unknown>;
    const n = o.name ?? o.label ?? o.displayName;
    if (typeof n === "string") contentTypeName = n;
  }

  let isContainer = !!(item.folder || item.package);
  if (contentTypeName && /document\s*set/i.test(contentTypeName)) {
    isContainer = true;
  }

  return {
    itemId: item.id,
    name: item.name,
    webUrl: item.webUrl,
    fields,
    contentTypeName,
    isContainer,
    createdByDisplayName: getFieldDisplayName(item.createdBy),
    modifiedByDisplayName: getFieldDisplayName(item.lastModifiedBy),
  };
}

export type FollowedItemRef = {
  driveId?: string;
  itemId: string;
  listId?: string;
  /** Best payload to map if hydration fails (remoteItem or the followed item itself). */
  payload: Record<string, any>;
};

/**
 * Followed SharePoint files often appear under `/me/drive/following` as remote items.
 * Prefer remoteItem ids/drive over the local shortcut id.
 */
export function resolveFollowedItemRef(
  item: Record<string, any>,
): FollowedItemRef | null {
  const remote = item?.remoteItem;
  const hasRemote = remote && typeof remote === "object";

  const itemId =
    (hasRemote && typeof remote.id === "string" && remote.id.trim()) ||
    (typeof item?.id === "string" && item.id.trim()) ||
    "";
  if (!itemId) return null;

  const driveId =
    (hasRemote &&
      typeof remote.parentReference?.driveId === "string" &&
      remote.parentReference.driveId) ||
    (typeof item?.parentReference?.driveId === "string" &&
      item.parentReference.driveId) ||
    undefined;

  const listId =
    (hasRemote &&
      typeof remote.sharepointIds?.listId === "string" &&
      remote.sharepointIds.listId) ||
    (typeof item?.sharepointIds?.listId === "string" &&
      item.sharepointIds.listId) ||
    undefined;

  return {
    driveId,
    itemId,
    listId,
    payload: hasRemote ? { ...remote, id: remote.id ?? itemId } : item,
  };
}

function normalizeId(value: string) {
  return value.trim().toLowerCase().replace(/[{}]/g, "");
}

/** True when a followed item belongs to the current library drive/list. */
export function isFollowedItemInLibrary(
  ref: FollowedItemRef,
  library: { driveId: string; listId?: string },
): boolean {
  if (ref.driveId && normalizeId(ref.driveId) === normalizeId(library.driveId)) {
    return true;
  }
  if (
    ref.listId &&
    library.listId &&
    normalizeId(ref.listId) === normalizeId(library.listId)
  ) {
    return true;
  }
  // No location metadata — still attempt hydrate against this library drive.
  return !ref.driveId && !ref.listId;
}
