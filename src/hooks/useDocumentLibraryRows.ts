import { useCallback, useEffect, useState } from "react";
import type {
    DocumentLibraryDocumentType,
    DocumentLibraryGraphClient,
    DocumentLibraryItemRow,
} from "../types";

export type { DocumentLibraryDocumentType };

type UseDocumentLibraryRowsParams = {
    client: DocumentLibraryGraphClient;
    parentDriveItemId: string | undefined;
    /** Which document set to load. Default: library. */
    documentType?: DocumentLibraryDocumentType;
};

export function useDocumentLibraryRows({
    client,
    parentDriveItemId,
    documentType = "library",
}: UseDocumentLibraryRowsParams) {
    const [rows, setRows] = useState<DocumentLibraryItemRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let next: DocumentLibraryItemRow[];
            switch (documentType) {
                case "favorites":
                    next = await client.listFavorites();
                    break;
                case "checkout":
                    next = await client.listCheckoutDocuments();
                    break;
                case "library":
                default:
                    next = await client.listChildren({ parentDriveItemId });
                    break;
            }
            setRows(next);
        } catch (e) {
            const fallback =
                documentType === "favorites"
                    ? "Failed to load favorites"
                    : documentType === "checkout"
                      ? "Failed to load checkout documents"
                      : "Failed to load documents";
            setError(e instanceof Error ? e.message : fallback);
        } finally {
            setLoading(false);
        }
    }, [client, parentDriveItemId, documentType]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        rows,
        loading,
        error,
        refresh,
        documentType,
    };
}
