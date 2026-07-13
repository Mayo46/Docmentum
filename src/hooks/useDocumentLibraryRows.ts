import { useCallback, useEffect, useState } from "react";
import type { DocumentLibraryGraphClient, DocumentLibraryItemRow } from "../types";

type UseDocumentLibraryRowsParams = {
    client: DocumentLibraryGraphClient;
    parentDriveItemId: string | undefined;
};

export function useDocumentLibraryRows({
    client,
    parentDriveItemId,
}: UseDocumentLibraryRowsParams) {
    const [rows, setRows] = useState<DocumentLibraryItemRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const next = await client.listChildren({
                parentDriveItemId,
            });
            setRows(next);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load documents");
        } finally {
            setLoading(false);
        }
    }, [client, parentDriveItemId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        rows,
        loading,
        error,
        refresh,
    };
}
