import { useCallback, useEffect, useRef, useState } from "react";

import type {
  DocumentLibraryDocumentType,
  DocumentLibraryGraphClient,
  DocumentLibraryItemRow,
} from "../types";

type UseDocumentLibraryRowsParams = {
  client: DocumentLibraryGraphClient;
  parentDriveItemId?: string;
  documentType?: DocumentLibraryDocumentType;
  externalRows?: DocumentLibraryItemRow[];
  useExternalRows?: boolean;

  /**
   * Optional total count for externally managed rows.
   * Existing consumers can omit this safely.
   */
  externalTotalCount?: number;

  /**
   * Indicates whether more externally managed rows are available.
   * Existing consumers can omit this safely.
   */
  externalHasMore?: boolean;

  /**
   * Callback used to load the next page for externally managed rows.
   * Existing consumers can omit this safely.
   */
  onLoadMoreExternal?: () => Promise<void>;
};

export function useDocumentLibraryRows({
  client,
  parentDriveItemId,
  documentType = "library",
  externalRows,
  useExternalRows = Boolean(externalRows),

  externalTotalCount,
  externalHasMore = false,
  onLoadMoreExternal,
}: UseDocumentLibraryRowsParams) {
  const [rows, setRows] = useState<DocumentLibraryItemRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextLink, setNextLink] = useState<string | undefined>();

  const loadingMoreRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNextLink(undefined);

    try {
      /*
       * External rows are managed by the consumer.
       *
       * Existing behavior is preserved when no external pagination
       * props are supplied.
       */
      if (useExternalRows && externalRows) {
        setRows(externalRows);

        setTotalCount(
          typeof externalTotalCount === "number"
            ? externalTotalCount
            : externalRows.length,
        );

        return;
      }

      switch (documentType) {
        case "favorites": {
          const next = await client.listFavorites();

          setRows(next);
          setTotalCount(next.length);

          break;
        }

        case "checkout": {
          const page = await client.listCheckoutDocumentsPage();

          setRows(page.rows);
          setNextLink(page.nextLink);
          setTotalCount(page.rows.length);

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
      setTotalCount(0);
      setError(e instanceof Error ? e.message : fallback);
    } finally {
      setLoading(false);
    }
  }, [
    client,
    parentDriveItemId,
    documentType,
    externalRows,
    useExternalRows,
    externalTotalCount,
  ]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) {
      return;
    }

    /*
     * NEW:
     * Support paginated external rows.
     *
     * If no callback or hasMore flag is supplied, this simply preserves
     * the old behavior and does nothing for external rows.
     */
    if (useExternalRows) {
      if (!externalHasMore || !onLoadMoreExternal) {
        return;
      }

      loadingMoreRef.current = true;
      setLoadingMore(true);
      setError(null);

      try {
        await onLoadMoreExternal();
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Failed to load more external documents",
        );
      } finally {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }

      return;
    }

    /*
     * Existing package behavior below.
     */
    if (documentType !== "library" && documentType !== "checkout") {
      return;
    }

    if (!nextLink) {
      return;
    }

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
  }, [
    useExternalRows,
    externalHasMore,
    onLoadMoreExternal,
    documentType,
    nextLink,
    client,
    parentDriveItemId,
  ]);

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

    /*
     * NEW:
     * External consumers can opt into infinite scrolling.
     * Existing consumers remain unchanged.
     */
    hasMore: useExternalRows
      ? Boolean(externalHasMore && onLoadMoreExternal)
      : (documentType === "library" || documentType === "checkout") &&
        Boolean(nextLink),

    documentType,
  };
}
