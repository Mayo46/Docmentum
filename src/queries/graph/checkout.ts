import axios from "axios";
import type { DocumentLibraryItemRow } from "../../types";
import { buildFieldSelect } from "../../utils/columns";
import {
  DEFAULT_DRIVE_SELECT_COLUMNS,
  DEFAULT_FIELD_SELECT_COLUMNS,
} from "../../utils/constants";
import { getAxiosErrorMessage } from "./graphRequest";
import { mapDriveItemToRow } from "./mapDriveItem";
import type { GraphClientDeps } from "./types";

const DRIVE_ITEM_SELECT = DEFAULT_DRIVE_SELECT_COLUMNS.join(",");

function hasCheckoutUser(fields: Record<string, unknown> | undefined): boolean {
  if (!fields) return false;

  const lookupId = fields.CheckoutUserLookupId ?? fields.CheckedOutByLookupId;
  if (lookupId !== null && lookupId !== undefined && lookupId !== "") {
    return true;
  }

  const user = fields.CheckoutUser ?? fields.CheckedOutBy ?? fields.CheckedOutTo;
  if (user === null || user === undefined || user === "") return false;
  if (typeof user === "object") return Object.keys(user as object).length > 0;
  return true;
}

function matchesCheckoutUserFilter(
  fields: Record<string, unknown> | undefined,
  spUserId: number | undefined,
): boolean {
  if (!fields) return false;

  if (spUserId !== undefined) {
    const lookupId = fields.CheckoutUserLookupId ?? fields.CheckedOutByLookupId;
    return String(lookupId) === String(spUserId);
  }

  return hasCheckoutUser(fields);
}

function buildCheckoutFilter(spUserId: number | undefined): string {
  if (spUserId !== undefined) {
    return `fields/CheckoutUserLookupId eq ${spUserId}`;
  }
  return "fields/CheckoutUserLookupId ne null";
}

function mapCheckedOutListItem(
  listItem: Record<string, any>,
): DocumentLibraryItemRow | null {
  const driveItem = listItem.driveItem;
  if (!driveItem?.id) return null;

  return mapDriveItemToRow({
    ...driveItem,
    listItem: { fields: listItem.fields ?? {} },
  });
}

async function fetchListItemPages(params: {
  startUrl: string;
  accessToken: string;
  preferFilterHeader?: boolean;
}): Promise<Array<Record<string, any>>> {
  const items: Array<Record<string, any>> = [];
  let nextUrl: string | undefined = params.startUrl;

  while (nextUrl) {
    const res = await axios.get(nextUrl, {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        ...(params.preferFilterHeader
          ? { Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly" }
          : {}),
      },
    });
    const json = res.data as {
      value?: Array<Record<string, any>>;
      ["@odata.nextLink"]?: string;
    };
    items.push(...(json.value ?? []));
    nextUrl = json["@odata.nextLink"];
  }

  return items;
}

/**
 * Lists documents currently checked out in this library.
 * When `opts.spUserId` is set, only items checked out by that user are returned.
 */
export function createCheckoutApi(deps: GraphClientDeps) {
  const { graphBaseUrl, opts, getContext } = deps;

  return {
    async listCheckoutDocuments(): Promise<DocumentLibraryItemRow[]> {
      const { accessToken, siteId, listId } = await getContext();
      if (!siteId || !listId) {
        throw new Error(
          "Site and list context are required to load checkout documents.",
        );
      }

      const spUserId = opts.spUserId;
      const configuredFields = buildFieldSelect(opts.columns)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const fieldSelect = Array.from(
        new Set([
          ...configuredFields,
          ...DEFAULT_FIELD_SELECT_COLUMNS,
          "CheckoutUser",
          "CheckoutUserLookupId",
          "CheckedOutDate",
          "CheckedOut",
          "CheckedOutBy",
        ]),
      ).join(",");
      const expand =
        `fields($select=${encodeURIComponent(fieldSelect)})` +
        `,driveItem($select=${encodeURIComponent(DRIVE_ITEM_SELECT)})`;

      const baseUrl =
        `${graphBaseUrl}/sites/${encodeURIComponent(siteId)}` +
        `/lists/${encodeURIComponent(listId)}/items`;

      const checkoutFilter = buildCheckoutFilter(spUserId);
      const filteredUrl =
        `${baseUrl}?$expand=${expand}` +
        `&$filter=${encodeURIComponent(checkoutFilter)}` +
        `&$top=200`;

      let listItems: Array<Record<string, any>>;
      try {
        listItems = await fetchListItemPages({
          startUrl: filteredUrl,
          accessToken,
          preferFilterHeader: true,
        });
      } catch {
        // Some libraries reject lookup filters — scan and filter client-side.
        try {
          listItems = (
            await fetchListItemPages({
              startUrl: `${baseUrl}?$expand=${expand}&$top=200`,
              accessToken,
            })
          ).filter((item) =>
            matchesCheckoutUserFilter(item.fields, spUserId),
          );
        } catch (error) {
          throw new Error(getAxiosErrorMessage(error));
        }
      }

      const rows: DocumentLibraryItemRow[] = [];
      const seen = new Set<string>();
      for (const listItem of listItems) {
        const row = mapCheckedOutListItem(listItem);
        if (!row || seen.has(row.itemId)) continue;
        seen.add(row.itemId);
        rows.push(row);
      }
      return rows;
    },
  };
}
