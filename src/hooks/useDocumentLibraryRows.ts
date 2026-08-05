import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DocumentLibraryDocumentType,
  DocumentLibraryGraphClient,
  DocumentLibraryItemRow,
} from "../types";

export type { DocumentLibraryDocumentType };

type UseDocumentLibraryRowsParams = {
  client: DocumentLibraryGraphClient;
  parentDriveItemId: string | undefined;
  documentType?: DocumentLibraryDocumentType;
  externalRows?: DocumentLibraryItemRow[];
};

export function useDocumentLibraryRows({
  client,
  parentDriveItemId,
  documentType = "library",
  externalRows,
}: UseDocumentLibraryRowsParams) {
  const [rows, setRows] = useState<DocumentLibraryItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nextLink, setNextLink] = useState<string | undefined>();

  const [totalCount, setTotalCount] = useState(0);

  /*
   * Prevent multiple scroll events from requesting the
   * same Graph page simultaneously.
   */
  const loadingMoreRef = useRef(false);

  const refresh = useCallback(async () => {
    if (externalRows) {
      setRows(externalRows);
      setTotalCount(externalRows.length);
      setNextLink(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setNextLink(undefined);
    setTotalCount(0);
    try {
      switch (documentType) {
        case "favorites": {
          const next = await client.listFavorites();
          setRows(next);
          break;
        }

        case "checkout": {
          const page = await client.listCheckoutDocumentsPage();

          setRows(page.rows);
          setNextLink(page.nextLink);

          break;
        }

        case "library":
        default: {
          const [page, count] = await Promise.all([
            client.listChildrenPage({
              parentDriveItemId,
            }),
            client.getChildrenCount({
              parentDriveItemId,
            }),
          ]);

          setRows(page.rows);
          setNextLink(page.nextLink);
          setTotalCount(count);

          break;
        }
      }
    } catch (e) {
      const fallback =
        documentType === "favorites"
          ? "Failed to load favorites"
          : documentType === "checkout"
            ? "Failed to load checkout documents"
            : "Failed to load documents";

      setRows([]);
      setError(e instanceof Error ? e.message : fallback);
    } finally {
      setLoading(false);
    }
  }, [client, parentDriveItemId, documentType]);

  const loadMore = useCallback(async () => {
    if (documentType !== "library" && documentType !== "checkout") {
      return;
    }

    if (!nextLink) return;
    if (loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const page =
        documentType === "checkout"
          ? await client.listCheckoutDocumentsPage({
              nextLink,
            })
          : await client.listChildrenPage({
              parentDriveItemId,
              nextLink,
            });

      /*
       * Protect against duplicate rows if Graph returns
       * overlapping results between pages.
       */
      setRows((current) => {
        const existingIds = new Set(current.map((row) => row.itemId));

        const additionalRows = page.rows.filter(
          (row) => !existingIds.has(row.itemId),
        );

        return [...current, ...additionalRows];
      });

      setNextLink(page.nextLink);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : documentType === "checkout"
            ? "Failed to load more checkout documents"
            : "Failed to load more documents",
      );
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [client, documentType, nextLink, parentDriveItemId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    rows,
    totalCount,
    loading,
    loadingMore,
    error,
    refresh,
    loadMore,

    hasMore:
      (documentType === "library" || documentType === "checkout") &&
      Boolean(nextLink),

    documentType,
  };
}
