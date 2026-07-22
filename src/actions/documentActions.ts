import type {
    DocumentLibraryDataGridRow,
    DocumentLibraryGraphClient,
    DocumentLibraryGridRow,
    onRefresh,
} from "../types";
import type { OnToast } from "../types/documentLibrary";

export function toastFromError(error: unknown) {
    return error instanceof Error
        ? error.message
        : "An unexpected error occurred.";
}

export const handleCheckout = async (
    selectedRows: DocumentLibraryGridRow[],
    graphClient: DocumentLibraryGraphClient,
    onToast: OnToast,
    onRefresh: onRefresh,
) => {
    try {
        const rows = selectedRows.filter(
            (row): row is DocumentLibraryDataGridRow => row.rowType === "data",
        );

        await Promise.all(
            rows.map((row) =>
                graphClient.checkoutItem({
                    itemId: row.itemId,
                }),
            ),
        );

        onToast({
            kind: "success",
            message: `${rows.length} document${rows.length === 1 ? "" : "s"} checked out successfully.`,
        });
        onRefresh();
    } catch (error) {
        console.error("Failed to checkout selected documents.", error);
        onToast({
            kind: "error",
            message: toastFromError(error),
        });
    }
};

export const handleCheckin = async (
    selectedRows: DocumentLibraryGridRow[],
    graphClient: DocumentLibraryGraphClient,
    onToast: OnToast,
    onRefresh: onRefresh,
) => {
    try {
        const rows = selectedRows.filter(
            (row): row is DocumentLibraryDataGridRow => row.rowType === "data",
        );

        await Promise.all(
            rows.map((row) =>
                graphClient.checkinItem({
                    itemId: row.itemId,
                }),
            ),
        );

        onToast({
            kind: "success",
            message: `${rows.length} document${rows.length === 1 ? "" : "s"} checked in successfully.`,
        });

        onRefresh();
    } catch (error) {
        console.error("Failed to check in selected documents.", error);

        onToast({
            kind: "error",
            message: toastFromError(error),
        });
    }
};

export const handleCancelCheckout = async (
    selectedRows: DocumentLibraryGridRow[],
    graphClient: DocumentLibraryGraphClient,
    onToast: OnToast,
    onRefresh: onRefresh,
) => {
    try {
        const rows = selectedRows.filter(
            (row): row is DocumentLibraryDataGridRow => row.rowType === "data",
        );

        await Promise.all(
            rows.map((row) =>
                graphClient.cancelCheckoutItem({
                    itemId: row.itemId,
                }),
            ),
        );

        onToast({
            kind: "success",
            message: `${rows.length} document${rows.length === 1 ? "" : "s"} checkout cancelled successfully.`,
        });
        onRefresh();
    } catch (error) {
        console.error("Failed to cancel checkout for selected documents.", error);

        onToast({
            kind: "error",
            message: toastFromError(error),
        });
    }
};

export const handleDelete = async (
    selectedRows: DocumentLibraryGridRow[],
    graphClient: DocumentLibraryGraphClient,
    onToast: OnToast,
    onRefresh: onRefresh,
) => {
    try {
        const rows = selectedRows.filter(
            (row): row is DocumentLibraryDataGridRow => row.rowType === "data",
        );
        await Promise.all(
            rows.map((row) =>
                graphClient.deleteItem({
                    itemId: row.itemId,
                }),
            ),
        );
        onToast({
            kind: "success",
            message: `${rows.length} document${rows.length === 1 ? "" : "s"} deleted successfully.`,
        });
        onRefresh();
    } catch (error) {
        console.error("Failed to delete selected documents.", error);
        onToast({
            kind: "error",
            message: toastFromError(error),
        });
    }
};

export const handleFavorite = async (
    selectedRows: DocumentLibraryGridRow[],
    graphClient: DocumentLibraryGraphClient,
    onToast: OnToast,
    onRefresh: onRefresh,
) => {
    try {
        const rows = selectedRows.filter(
            (row): row is DocumentLibraryDataGridRow => row.rowType === "data",
        );

        await Promise.all(
            rows.map((row) =>
                graphClient.favoriteItem({
                    itemId: row.itemId,
                }),
            ),
        );

        onToast({
            kind: "success",
            message: `${rows.length} document${rows.length === 1 ? "" : "s"} added to favorites.`,
        });

        onRefresh();
    } catch (error) {
        console.error("Failed to add selected documents to favorites.", error);

        onToast({
            kind: "error",
            message: toastFromError(error),
        });
    }
};

export const handleUnfavorite = async (
    selectedRows: DocumentLibraryGridRow[],
    graphClient: DocumentLibraryGraphClient,
    onToast: OnToast,
    onRefresh: onRefresh,
) => {
    try {
        const rows = selectedRows.filter(
            (row): row is DocumentLibraryDataGridRow => row.rowType === "data",
        );

        await Promise.all(
            rows.map((row) =>
                graphClient.unfavoriteItem({
                    itemId: row.itemId,
                }),
            ),
        );

        onToast({
            kind: "success",
            message: `${rows.length} document${rows.length === 1 ? "" : "s"} removed from favorites.`,
        });

        onRefresh();
    } catch (error) {
        console.error("Failed to remove selected documents from favorites.", error);

        onToast({
            kind: "error",
            message: toastFromError(error),
        });
    }
};

export const handleExport = async (
    selectedRows: DocumentLibraryGridRow[],
    graphClient: DocumentLibraryGraphClient,
    onToast: OnToast,
) => {
    try {
        const rows = selectedRows.filter(
            (row): row is DocumentLibraryDataGridRow => row.rowType === "data",
        );

        await Promise.all(
            rows.map(async (row) => {
                const blob = await graphClient.downloadItem({
                    itemId: row.itemId,
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = url;
                link.download = row.name;

                document.body.appendChild(link);
                link.click();
                link.remove();

                URL.revokeObjectURL(url);
            }),
        );

        onToast({
            kind: "success",
            message: `${rows.length} document${rows.length === 1 ? "" : "s"} exported successfully.`,
        });
    } catch (error) {
        console.error("Failed to export selected documents.", error);

        onToast({
            kind: "error",
            message: toastFromError(error),
        });
    }
};

export const handleCopyUrl = async (
    selectedRows: DocumentLibraryGridRow[],
    onToast: OnToast,
) => {
    try {
        const rows = selectedRows.filter(
            (row): row is DocumentLibraryDataGridRow =>
                row.rowType === "data" && !!row.webUrl,
        );

        if (rows.length === 0) {
            throw new Error("No document URLs available to copy.");
        }

        const urls = rows
            .map((row) => row.webUrl)
            .filter(Boolean)
            .join("\n");

        await navigator.clipboard.writeText(urls);

        onToast({
            kind: "success",
            message: `${rows.length} document URL${rows.length === 1 ? "" : "s"} copied successfully.`,
        });
    } catch (error) {
        console.error("Failed to copy document URLs.", error);

        onToast({
            kind: "error",
            message: toastFromError(error),
        });
    }
};