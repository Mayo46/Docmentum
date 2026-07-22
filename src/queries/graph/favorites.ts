import axios from "axios";
import type { DocumentLibraryItemRow } from "../../types";
import { buildFieldSelect } from "../../utils/columns";
import {
  DEFAULT_DRIVE_SELECT_COLUMNS,
  DEFAULT_FIELD_SELECT_COLUMNS,
} from "../../utils/constants";
import { getAxiosErrorMessage, graphRequest } from "./graphRequest";
import {
  isFollowedItemInLibrary,
  mapDriveItemToRow,
  resolveFollowedItemRef,
} from "./mapDriveItem";
import type { GraphClientDeps } from "./types";

const FOLLOWING_SELECT = [
  "id",
  "name",
  "webUrl",
  "folder",
  "file",
  "package",
  "createdBy",
  "lastModifiedBy",
  "parentReference",
  "remoteItem",
  "sharepointIds",
].join(",");

function webUrlBelongsToSite(
  webUrl: string | undefined,
  siteUrl: string | undefined,
): boolean {
  if (!webUrl || !siteUrl) return false;
  try {
    const itemUrl = new URL(webUrl);
    const site = new URL(siteUrl);
    if (itemUrl.hostname.toLowerCase() !== site.hostname.toLowerCase()) {
      return false;
    }
    const itemPath = itemUrl.pathname.toLowerCase();
    const sitePath = site.pathname.toLowerCase().replace(/\/$/, "");
    return sitePath.length === 0 || itemPath.startsWith(sitePath);
  } catch {
    return false;
  }
}

/**
 * Lists items the signed-in user has favorited (followed), scoped to this library.
 * Source: GET /me/drive/following (SharePoint follows usually appear as remoteItem).
 */
export function createFavoritesApi(deps: GraphClientDeps) {
  const { graphBaseUrl, opts, getContext } = deps;

  return {
    async listFavorites(): Promise<DocumentLibraryItemRow[]> {
      const { accessToken, driveId, listId } = await getContext();
      const library = { driveId, listId };

      const followed: Array<Record<string, any>> = [];
      let nextUrl: string | undefined =
        `${graphBaseUrl}/me/drive/following` +
        `?$select=${encodeURIComponent(FOLLOWING_SELECT)}`;

      while (nextUrl) {
        let json: { value?: unknown[]; ["@odata.nextLink"]?: string };
        try {
          const res = await axios.get(nextUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          json = res.data;
        } catch (error) {
          throw new Error(getAxiosErrorMessage(error));
        }

        for (const raw of json?.value ?? []) {
          if (raw && typeof raw === "object") {
            followed.push(raw as Record<string, any>);
          }
        }
        nextUrl = json?.["@odata.nextLink"];
      }

      const selectClause = DEFAULT_DRIVE_SELECT_COLUMNS.join(",");
      // Use host columns when provided; otherwise default metadata fields.
      const configured = buildFieldSelect(opts.columns);
      const fieldSelectClause =
        configured && configured.length > 0
          ? configured
          : DEFAULT_FIELD_SELECT_COLUMNS.join(",");
      const rows: DocumentLibraryItemRow[] = [];
      const seen = new Set<string>();

      for (const item of followed) {
        const ref = resolveFollowedItemRef(item);
        if (!ref) continue;

        const payloadWebUrl =
          (typeof ref.payload?.webUrl === "string" && ref.payload.webUrl) ||
          (typeof item.webUrl === "string" && item.webUrl) ||
          undefined;

        const hasLocation = !!(ref.driveId || ref.listId);
        const inLibraryById = hasLocation && isFollowedItemInLibrary(ref, library);
        const inLibraryByUrl = webUrlBelongsToSite(payloadWebUrl, opts.siteUrl);

        if (hasLocation && !inLibraryById && !inLibraryByUrl) continue;
        if (!hasLocation && !inLibraryByUrl && payloadWebUrl) continue;

        if (seen.has(ref.itemId)) continue;
        seen.add(ref.itemId);

        const hydrateDriveId = ref.driveId ?? driveId;

        try {
          const url =
            `${graphBaseUrl}/drives/${encodeURIComponent(hydrateDriveId)}` +
            `/items/${encodeURIComponent(ref.itemId)}` +
            `?$select=${encodeURIComponent(selectClause)}` +
            `&$expand=listItem($expand=fields($select=${encodeURIComponent(fieldSelectClause)}))`;

          const hydrated = await graphRequest<Record<string, any>>({
            url,
            method: "GET",
            accessToken,
          });
          rows.push(mapDriveItemToRow(hydrated));
        } catch {
          if (!inLibraryById && !inLibraryByUrl) continue;
          if (ref.payload?.name || ref.payload?.id) {
            rows.push(
              mapDriveItemToRow({
                ...ref.payload,
                id: ref.itemId,
              }),
            );
          }
        }
      }

      return rows;
    },
  };
}
