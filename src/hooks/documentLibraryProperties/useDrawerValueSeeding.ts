import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
    DocumentLibraryFieldDefinition,
    DocumentLibraryGraphClient,
    DocumentLibraryItemRow,
    DocumentLibraryPropertiesEditTarget,
} from "../../types";
import { getCellValue } from "../../utils/columns";
import { stripFileExtension } from "../../utils/files";

type Params = {
    client: DocumentLibraryGraphClient;
    propertiesTarget: DocumentLibraryPropertiesEditTarget | null;
    uploadSession: File[] | null;
    primaryItemId: string | null;
    safeStepIndex: number;
    editableKeys: string[];
    editableKeysSignature: string;
    uploadPrefillProperties?: Record<string, unknown>;
    uploadPrefillSignature: string;
    rows: DocumentLibraryItemRow[];
    fieldDefinitions: DocumentLibraryFieldDefinition[];
    setPropertiesInitialValues: Dispatch<
        SetStateAction<Record<string, unknown> | undefined>
    >;
    setPropertiesValuesLoading: Dispatch<SetStateAction<boolean>>;
};

/** Seeds the drawer's initial form values for the item (edit) or file (upload) in view. */
export function useDrawerValueSeeding({
    client,
    propertiesTarget,
    uploadSession,
    primaryItemId,
    safeStepIndex,
    editableKeys,
    editableKeysSignature,
    uploadPrefillProperties,
    uploadPrefillSignature,
    rows,
    fieldDefinitions,
    setPropertiesInitialValues,
    setPropertiesValuesLoading,
}: Params) {
    const rowsRef = useRef(rows);
    rowsRef.current = rows;

    const fieldDefinitionsRef = useRef(fieldDefinitions);
    fieldDefinitionsRef.current = fieldDefinitions;

    useEffect(() => {
        if (!propertiesTarget) return;

        // No resolvable item (e.g. empty selection) — fall back to any configured prefill.
        if (!primaryItemId) {
            setPropertiesInitialValues(uploadPrefillProperties ?? {});
            return;
        }

        let cancelled = false;
        setPropertiesValuesLoading(true);
        client
            // Empty keys => fetch all field values for the item.
            .getListItemFieldValues({
                itemId: primaryItemId,
                fieldKeys: editableKeys,
            })
            .then((values) => {
                if (!cancelled) setPropertiesInitialValues(values);
            })
            .catch(() => {
                if (!cancelled) {
                    const row = rowsRef.current.find((r) => r.itemId === primaryItemId);
                    const fallbackKeys =
                        editableKeys.length > 0
                            ? editableKeys
                            : fieldDefinitionsRef.current.map((d) => d.key);
                    const fallback: Record<string, unknown> = {};
                    for (const key of fallbackKeys) {
                        fallback[key] = row ? getCellValue(row, key) : "";
                    }
                    setPropertiesInitialValues(fallback);
                }
            })
            .finally(() => {
                if (!cancelled) setPropertiesValuesLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [
        primaryItemId,
        editableKeysSignature,
        client,
        uploadPrefillSignature,
        propertiesTarget,
        editableKeys.length,
    ]);

    // Seeds the form for the file currently shown in upload mode, defaulting Title to
    // that file's name (without extension). Re-runs as the user steps between files.
    useEffect(() => {
        if (!uploadSession) return;
        const file = uploadSession[safeStepIndex];
        const nameSeed = file ? stripFileExtension(file.name) : "";
        setPropertiesInitialValues({
            ...(uploadPrefillProperties ?? {}),
            ...(nameSeed ? { Title: nameSeed } : {}),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadSession, safeStepIndex, uploadPrefillSignature]);
}
