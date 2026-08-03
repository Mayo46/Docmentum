import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
    DocumentLibraryGraphClient,
    DocumentLibraryPropertiesEditTarget,
    DocumentLibraryToast,
} from "../../types";
import { toastFromFieldUpdateFailures } from "../../common/helpers";
import { isPerItemUniqueField } from "../../utils/fieldDefinitions";

type Params = {
    client: DocumentLibraryGraphClient;
    propertiesTarget: DocumentLibraryPropertiesEditTarget | null;
    bulkPropertiesItemIds: string[];
    targetItemIds: string[];
    safeStepIndex: number;
    isLastStep: boolean;
    stepTotal: number;
    refresh: () => Promise<void>;
    onToast: (toast: DocumentLibraryToast) => void;
    clearSelection?: () => void;
    setPropertiesSubmitting: Dispatch<SetStateAction<boolean>>;
    setPropertiesTarget: Dispatch<
        SetStateAction<DocumentLibraryPropertiesEditTarget | null>
    >;
    setBulkActionLocked: Dispatch<SetStateAction<boolean>>;
    setStepIndex: Dispatch<SetStateAction<number>>;
};

/** Save handlers for edit mode: bulk "Save Multiple" and step-by-step "Save & Next". */
export function useEditSubmitHandlers({
    client,
    propertiesTarget,
    bulkPropertiesItemIds,
    targetItemIds,
    safeStepIndex,
    isLastStep,
    stepTotal,
    refresh,
    onToast,
    clearSelection,
    setPropertiesSubmitting,
    setPropertiesTarget,
    setBulkActionLocked,
    setStepIndex,
}: Params) {
    const handleSaveProperties = useCallback(
        async (properties: Record<string, unknown>) => {
            if (!propertiesTarget) return;
            setPropertiesSubmitting(true);
            try {
                const itemIds =
                    propertiesTarget.kind === "item"
                        ? [propertiesTarget.itemId]
                        : bulkPropertiesItemIds;
                if (itemIds.length === 0) {
                    onToast({
                        kind: "error",
                        message: "No items selected to update.",
                    });
                    return;
                }
                // Never bulk-apply the file-name field: it must stay unique per item, otherwise
                // SharePoint rejects the request with `nameAlreadyExists`.
                const payload =
                    itemIds.length > 1
                        ? Object.fromEntries(
                              Object.entries(properties).filter(
                                  ([key]) => !isPerItemUniqueField(key),
                              ),
                          )
                        : properties;
                const result = await client.updateListItemFields({
                    itemIds,
                    properties: payload,
                });
                if (result.failures.length > 0) {
                    onToast({
                        kind: "error",
                        message: `Failed to update some items:\n${toastFromFieldUpdateFailures(result.failures)}`,
                    });
                } else {
                    onToast({
                        kind: "success",
                        message:
                            itemIds.length === 1
                                ? "Properties updated."
                                : `Updated properties on ${itemIds.length} items.`,
                    });
                    setPropertiesTarget(null);
                    // Reset grid selection after a multi-file edit sourced from the grid.
                    if (propertiesTarget.kind !== "item") clearSelection?.();
                    await refresh();
                }
            } finally {
                setPropertiesSubmitting(false);
            }
        },
        [
            client,
            propertiesTarget,
            bulkPropertiesItemIds,
            refresh,
            onToast,
            clearSelection,
            setPropertiesSubmitting,
            setPropertiesTarget,
        ],
    );

    // Saves only the document currently shown, then advances to the next selected
    // document (or closes + refreshes once the last one is saved).
    const handleSaveAndNext = useCallback(
        async (properties: Record<string, unknown>) => {
            if (!propertiesTarget) return;
            const itemId = targetItemIds[safeStepIndex];
            if (!itemId) return;
            // Once per-file stepping starts, block the bulk "Save Multiple Docs" action.
            setBulkActionLocked(true);
            setPropertiesSubmitting(true);
            try {
                const result = await client.updateListItemFields({
                    itemIds: [itemId],
                    properties,
                });
                if (result.failures.length > 0) {
                    onToast({
                        kind: "error",
                        message: `Failed to update document:\n${toastFromFieldUpdateFailures(result.failures)}`,
                    });
                    return;
                }
                if (isLastStep) {
                    onToast({
                        kind: "success",
                        message: `Updated all ${stepTotal} documents.`,
                    });
                    setPropertiesTarget(null);
                    clearSelection?.();
                    await refresh();
                } else {
                    onToast({
                        kind: "success",
                        message: `Saved document ${safeStepIndex + 1} of ${stepTotal}.`,
                    });
                    setStepIndex(safeStepIndex + 1);
                }
            } finally {
                setPropertiesSubmitting(false);
            }
        },
        [
            client,
            propertiesTarget,
            targetItemIds,
            safeStepIndex,
            isLastStep,
            stepTotal,
            refresh,
            onToast,
            clearSelection,
            setBulkActionLocked,
            setPropertiesSubmitting,
            setPropertiesTarget,
            setStepIndex,
        ],
    );

    return { handleSaveProperties, handleSaveAndNext };
}
