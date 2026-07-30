import axios from "axios";
import type {
  DocumentLibraryItemRow,
  DocumentLibraryItemsPage,
} from "../../types";
import { buildDriveItemSelect, buildFieldSelect } from "../../utils/columns";
import { getAxiosErrorMessage, graphRequestNoJson } from "./graphRequest";
import { mapDriveItemToRow } from "./mapDriveItem";
import type { GraphClientDeps } from "./types";

export function createDriveItemsApi(deps: GraphClientDeps) {
  const { graphBaseUrl, opts, getContext } = deps;

  return {
    async getDriveItemIdByName({ name }: { name: string }) {
      const { accessToken, driveId } = await getContext();
      try {
        const res = await axios.get(
          `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}/root:/${encodeURIComponent(name)}?$select=id`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        return res.data.id as string;
      } catch (error) {
        throw new Error(
          `Failed to find Document Set '${name}': ${getAxiosErrorMessage(error)}`,
        );
      }
    },

    async listChildren({ parentDriveItemId }: { parentDriveItemId?: string }) {
      const { accessToken, driveId } = await getContext();

      const selectClause = buildDriveItemSelect(opts.columns);
      const fieldSelectClause = buildFieldSelect(opts.columns);

      let nextUrl =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `${parentDriveItemId ? `/items/${encodeURIComponent(parentDriveItemId)}` : "/root"}/children` +
        `?$select=${encodeURIComponent(selectClause)}` +
        `&$expand=listItem($expand=fields($select=${encodeURIComponent(fieldSelectClause)}))`;

      const rows: DocumentLibraryItemRow[] = [];

      while (nextUrl) {
        let json: {
          value?: unknown[];
          ["@odata.nextLink"]?: string;
        };

        try {
          const res = await axios.get(nextUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          json = res.data;
        } catch (error) {
          throw new Error(getAxiosErrorMessage(error));
        }

        const items = (json?.value ?? []) as Array<Record<string, any>>;

        for (const item of items) {
          rows.push(mapDriveItemToRow(item));
        }

        nextUrl = json?.["@odata.nextLink"] ?? "";
      }

      return rows;
    },

    async getChildrenCount({
      parentDriveItemId,
    }: {
      parentDriveItemId?: string;
    }): Promise<number> {
      const { accessToken, driveId } = await getContext();

      const url = parentDriveItemId
        ? `${graphBaseUrl}/drives/${encodeURIComponent(
            driveId,
          )}/items/${encodeURIComponent(parentDriveItemId)}?$select=id,folder`
        : `${graphBaseUrl}/drives/${encodeURIComponent(
            driveId,
          )}/root?$select=id,folder`;

      try {
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return res.data?.folder?.childCount ?? 0;
      } catch (error) {
        throw new Error(getAxiosErrorMessage(error));
      }
    },

    async listChildrenPage({
      parentDriveItemId,
      nextLink,
    }: {
      parentDriveItemId?: string;
      nextLink?: string;
    }): Promise<DocumentLibraryItemsPage> {
      const { accessToken, driveId } = await getContext();

      const selectClause = buildDriveItemSelect(opts.columns);
      const fieldSelectClause = buildFieldSelect(opts.columns);

      /*
       * If nextLink is provided, Graph has already built the URL
       * for the next page, so use it directly.
       *
       * Otherwise, build the initial children request.
       */
      const url =
        nextLink ??
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
          `${
            parentDriveItemId
              ? `/items/${encodeURIComponent(parentDriveItemId)}`
              : "/root"
          }/children` +
          `?$select=${encodeURIComponent(selectClause)}` +
          `&$expand=listItem($expand=fields($select=${encodeURIComponent(
            fieldSelectClause,
          )}))`;

      try {
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const json = res.data as {
          value?: Array<Record<string, any>>;
          ["@odata.nextLink"]?: string;
        };

        const rows = (json.value ?? []).map((item) => mapDriveItemToRow(item));

        return {
          rows,
          nextLink: json["@odata.nextLink"],
        };
      } catch (error) {
        throw new Error(getAxiosErrorMessage(error));
      }
    },

    async deleteItem({ itemId }: { itemId: string }) {
      const { accessToken, driveId } = await getContext();
      const url = `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}`;
      await graphRequestNoJson({ url, method: "DELETE", accessToken });
    },

    async checkoutItem({ itemId }: { itemId: string }) {
      const { accessToken, driveId } = await getContext();
      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/checkout`;
      await graphRequestNoJson({ url, method: "POST", accessToken });
    },

    async checkinItem({ itemId }: { itemId: string }) {
      const { accessToken, driveId } = await getContext();
      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/checkin`;
      await graphRequestNoJson({ url, method: "POST", accessToken });
    },

    async cancelCheckoutItem({ itemId }: { itemId: string }) {
      const { accessToken, driveId } = await getContext();
      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/discardCheckout`;
      await graphRequestNoJson({ url, method: "POST", accessToken });
    },

    async favoriteItem({ itemId }: { itemId: string }) {
      const { accessToken, driveId } = await getContext();
      const url = `${graphBaseUrl}/drives/${encodeURIComponent(
        driveId,
      )}/items/${encodeURIComponent(itemId)}/follow`;
      await graphRequestNoJson({ url, method: "POST", accessToken });
    },

    async unfavoriteItem({ itemId }: { itemId: string }) {
      const { accessToken, driveId } = await getContext();
      const url = `${graphBaseUrl}/drives/${encodeURIComponent(
        driveId,
      )}/items/${encodeURIComponent(itemId)}/unfollow`;
      await graphRequestNoJson({ url, method: "POST", accessToken });
    },

    async downloadItem({ itemId }: { itemId: string }) {
      const { accessToken, driveId } = await getContext();

      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/content`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "blob",
      });

      return response.data;
    },
  };
}
