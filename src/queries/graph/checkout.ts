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

// function hasCheckoutUser(fields: Record<string, unknown> | undefined): boolean {
//   if (!fields) return false;

//   const lookupId = fields.CheckoutUserLookupId ?? fields.CheckedOutByLookupId;
//   if (lookupId !== null && lookupId !== undefined && lookupId !== "") {
//     return true;
//   }

//   const user = fields.CheckoutUser ?? fields.CheckedOutBy ?? fields.CheckedOutTo;
//   if (user === null || user === undefined || user === "") return false;
//   if (typeof user === "object") return Object.keys(user as object).length > 0;
//   return true;
// }

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

// async function fetchListItemPages(params: {
//   startUrl: string;
//   accessToken: string;
//   preferFilterHeader?: boolean;
// }): Promise<Array<Record<string, any>>> {
//   const items: Array<Record<string, any>> = [];
//   let nextUrl: string | undefined = params.startUrl;

//   while (nextUrl) {
//     const res = await axios.get(nextUrl, {
//       headers: {
//         Authorization: `Bearer ${params.accessToken}`,
//         ...(params.preferFilterHeader
//           ? { Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly" }
//           : {}),
//       },
//     });
//     const json = res.data as {
//       value?: Array<Record<string, any>>;
//       ["@odata.nextLink"]?: string;
//     };
//     items.push(...(json.value ?? []));
//     nextUrl = json["@odata.nextLink"];
//   }

//   return items;
// }

/**
 * Lists documents currently checked out in this library.
 * Uses list items where CheckoutUserLookupId is set.
 */
export function createCheckoutApi(deps: GraphClientDeps) {
  const {
    graphBaseUrl,
    opts,
    getContext,
    getCheckoutUserId,
  } = deps;

  const listCheckoutDocumentsPage = async ({
    nextLink,
  }: {
    nextLink?: string;
  } = {}): Promise<{
    rows: DocumentLibraryItemRow[];
    nextLink?: string;
  }> => {
      const { accessToken, siteId, listId } = await getContext();

      if (!siteId || !listId) {
        throw new Error(
          "Site and list context are required to load checkout documents.",
        );
      }

      let checkoutUrl = nextLink;

      /*
       * Only build the initial checkout query when we're loading
       * the first page. Subsequent requests use Graph's nextLink
       * exactly as returned.
       */
      if (!checkoutUrl) {
        const checkoutUserId = await getCheckoutUserId();

        if (checkoutUserId === null) {
          throw new Error(
            "Unable to resolve the current SharePoint user for checkout documents.",
          );
        }

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

        checkoutUrl =
          `${baseUrl}?$expand=${expand}` +
          `&$filter=${encodeURIComponent(
            `fields/CheckoutUserLookupId eq ${checkoutUserId}`,
          )}` +
          `&$top=200`;
      }

      try {
        const res = await axios.get(checkoutUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const json = res.data as {
          value?: Array<Record<string, any>>;
          ["@odata.nextLink"]?: string;
        };

        const rows: DocumentLibraryItemRow[] = [];
        const seen = new Set<string>();

        for (const listItem of json.value ?? []) {
          const row = mapCheckedOutListItem(listItem);

          if (!row || seen.has(row.itemId)) {
            continue;
          }

          seen.add(row.itemId);
          rows.push(row);
        }

        return {
          rows,
          nextLink: json["@odata.nextLink"],
        };
      } catch (error) {
        throw new Error(getAxiosErrorMessage(error));
      }
    };

  const listCheckoutDocuments = async (): Promise<DocumentLibraryItemRow[]> => {
    const allRows: DocumentLibraryItemRow[] = [];
    let nextLink: string | undefined;

    do {
      const page = await listCheckoutDocumentsPage({ nextLink });
      allRows.push(...page.rows);
      nextLink = page.nextLink;
    } while (nextLink);

    return allRows;
  };

  return {
    listCheckoutDocuments,
    listCheckoutDocumentsPage,
  };
}
