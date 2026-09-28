import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
    DocumentLibraryGraphClient,
    DocumentLibraryToast,
} from "../../types";
import { toastFromFailures } from "../../common/helpers";
import { normalizeLookupKey } from "../../utils/columns";
import { isPerItemUniqueField } from "../../utils/fieldDefinitions";

type Params = {
    client: DocumentLibraryGraphClient;
    uploadSession: File[] | null;
    safeStepIndex: number;
    isLastStep: boolean;
    stepTotal: number;
    parentDriveItemId?: string;
    refresh: () => Promise<void>;
    onToast: (toast: DocumentLibraryToast) => void;
    setPropertiesSubmitting: Dispatch<SetStateAction<boolean>>;
    setUploadSession: Dispatch<SetStateAction<File[] | null>>;
    setBulkActionLocked: Dispatch<SetStateAction<boolean>>;
    setStepIndex: Dispatch<SetStateAction<number>>;
};

/** Upload handlers: bulk "Upload All Files" and step-by-step "Upload & Next". */
export function useUploadSubmitHandlers({
    client,
    uploadSession,
    safeStepIndex,
    isLastStep,
    stepTotal,
    parentDriveItemId,
    refresh,
    onToast,
    setPropertiesSubmitting,
    setUploadSession,
    setBulkActionLocked,
    setStepIndex,
}: Params) {
    // Uploads all selected files at once with the shared metadata form values, then
    // closes. Mirrors "Save Multiple Docs" in edit mode.
    const handleUpload = useCallback(
        async (properties: Record<string, unknown>) => {
            if (!uploadSession || uploadSession.length === 0) return;
            setPropertiesSubmitting(true);
            try {
                // For multiple files, don't clone one file's Title onto all of them — drop it
                // so each file falls back to its own name. Other shared metadata still applies.
                const payload =
                    uploadSession.length > 1
                        ? Object.fromEntries(
                              Object.entries(properties).filter(
                                  ([key]) =>
                                      !isPerItemUniqueField(key) &&
                                      normalizeLookupKey(key) !== "title",
                              ),
                          )
                        : properties;
                const result = await client.uploadFiles({
                    parentDriveItemId,
                    files: uploadSession,
                    contentType: "document",
                    properties: payload,
                });
                if (result.failures.length > 0) {
                    onToast({
                        kind: "error",
                        message: `Upload failed for:\n${toastFromFailures(result.failures)}`,
                    });
                } else {
                    onToast({
                        kind: "success",
                        message: `Uploaded ${uploadSession.length} file(s).`,
                    });
                    setUploadSession(null);
                    await refresh();
                }
            } finally {
                setPropertiesSubmitting(false);
            }
        },
        [
            client,
            uploadSession,
            parentDriveItemId,
            refresh,
            onToast,
            setPropertiesSubmitting,
            setUploadSession,
        ],
    );

    // Uploads only the file currently shown, then advances to the next one (or closes
    // + refreshes after the last). Mirrors "Save and Move to Next Doc" in edit mode.
    const handleUploadAndNext = useCallback(
        async (properties: Record<string, unknown>) => {
            if (!uploadSession) return;
            const file = uploadSession[safeStepIndex];
            if (!file) return;
            // Once per-file stepping starts, block the bulk "Upload All Files" action.
            setBulkActionLocked(true);
            setPropertiesSubmitting(true);
            try {
                const result = await client.uploadFiles({
                    parentDriveItemId,
                    files: [file],
                    contentType: "document",
                    properties,
                });
                if (result.failures.length > 0) {
                    onToast({
                        kind: "error",
                        message: `Upload failed for:\n${toastFromFailures(result.failures)}`,
                    });
                    return;
                }
                if (isLastStep) {
                    onToast({
                        kind: "success",
                        message: `Uploaded all ${stepTotal} files.`,
                    });
                    setUploadSession(null);
                    await refresh();
                } else {
                    onToast({
                        kind: "success",
                        message: `Uploaded file ${safeStepIndex + 1} of ${stepTotal}.`,
                    });
                    setStepIndex(safeStepIndex + 1);
                }
            } finally {
                setPropertiesSubmitting(false);
            }
        },
        [
            client,
            uploadSession,
            safeStepIndex,
            isLastStep,
            stepTotal,
            parentDriveItemId,
            refresh,
            onToast,
            setPropertiesSubmitting,
            setUploadSession,
            setBulkActionLocked,
            setStepIndex,
        ],
    );

    return { handleUpload, handleUploadAndNext };
}
