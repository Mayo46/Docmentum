import type { DocumentLibraryItemRow } from "../../types";
import { buildFieldSelect } from "../../utils/columns";
import {
  DEFAULT_DRIVE_SELECT_COLUMNS,
  DEFAULT_FIELD_SELECT_COLUMNS,
} from "../../utils/constants";
import { graphRequest } from "./graphRequest";
import { mapDriveItemToRow } from "./mapDriveItem";
import type { GraphClientDeps } from "./types";

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

export async function getFavoritesFilesByIds(
  deps: GraphClientDeps,
): Promise<DocumentLibraryItemRow[]> {
  const { graphBaseUrl, opts, getContext, favoriteItemIDs } = deps;
  const { accessToken, driveId } = await getContext();

  const selectClause = DEFAULT_DRIVE_SELECT_COLUMNS.join(",");
  const configured = buildFieldSelect(opts.columns);
  const fieldSelectClause =
    configured && configured.length > 0
      ? configured
      : DEFAULT_FIELD_SELECT_COLUMNS.join(",");

  console.log("fav api : ", favoriteItemIDs);
  const batches = chunk(favoriteItemIDs!, 20);
  const rows: DocumentLibraryItemRow[] = [];

  for (const batch of batches) {
    const batchRequest = {
      requests: batch.map((itemId, index) => ({
        id: index.toString(),
        method: "GET",
        url:
          `/drives/${driveId}/items/${itemId}` +
          `?$select=${encodeURIComponent(selectClause)}` +
          `&$expand=listItem($expand=fields($select=${encodeURIComponent(fieldSelectClause)}))`,
      })),
    };

    const response = await graphRequest<{
      responses: { id: string; status: number; body: Record<string, any> }[];
    }>({
      url: `${graphBaseUrl}/$batch`,
      method: "POST",
      accessToken,
      body: batchRequest,
    });

    // $batch doesn't guarantee response order, so sort by the numeric id
    // we assigned above (matches batch's index order) before mapping.
    const ordered = [...response.responses].sort(
      (a, b) => Number(a.id) - Number(b.id),
    );

    for (const r of ordered) {
      if (r.status >= 200 && r.status < 300 && r.body) {
        rows.push(mapDriveItemToRow(r.body));
      }
    }
  }
  console.log(" rows : ", rows);
  return rows;
}
