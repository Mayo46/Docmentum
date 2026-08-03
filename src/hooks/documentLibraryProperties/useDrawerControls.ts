import { useCallback, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
    DocumentLibraryContextMenuState,
    DocumentLibraryItemRow,
    DocumentLibraryPropertiesEditTarget,
} from "../../types";

type Params = {
    enabled: boolean;
    rows: DocumentLibraryItemRow[];
    setPropertiesTarget: Dispatch<
        SetStateAction<DocumentLibraryPropertiesEditTarget | null>
    >;
    setUploadSession: Dispatch<SetStateAction<File[] | null>>;
    setPropertiesInitialValues: Dispatch<
        SetStateAction<Record<string, unknown> | undefined>
    >;
    setStepIndex: Dispatch<SetStateAction<number>>;
    setBulkActionLocked: Dispatch<SetStateAction<boolean>>;
    setContextMenu: Dispatch<SetStateAction<DocumentLibraryContextMenuState | null>>;
};

/** Open/close controls for the shared drawer in both edit and upload modes. */
export function useDrawerControls({
    enabled,
    rows,
    setPropertiesTarget,
    setUploadSession,
    setPropertiesInitialValues,
    setStepIndex,
    setBulkActionLocked,
    setContextMenu,
}: Params) {
    const rowsRef = useRef(rows);
    rowsRef.current = rows;

    const openPropertiesEditor = useCallback(
        (target: DocumentLibraryPropertiesEditTarget) => {
            setUploadSession(null);
            setPropertiesTarget(target);
            setPropertiesInitialValues(undefined);
            setStepIndex(0);
            setBulkActionLocked(false);
            setContextMenu(null);
        },
        [
            setUploadSession,
            setPropertiesTarget,
            setPropertiesInitialValues,
            setStepIndex,
            setBulkActionLocked,
            setContextMenu,
        ],
    );

    // Opens the shared drawer in upload mode. Per-step Title seeding is handled by the
    // seeding effect so navigating between files reseeds the form the same way editing does.
    const openUploadEditor = useCallback(
        (files: File[]) => {
            if (files.length === 0) return;
            setPropertiesTarget(null);
            setStepIndex(0);
            setBulkActionLocked(false);
            setContextMenu(null);
            setPropertiesInitialValues(undefined);
            setUploadSession(files);
        },
        [
            setPropertiesTarget,
            setStepIndex,
            setBulkActionLocked,
            setContextMenu,
            setPropertiesInitialValues,
            setUploadSession,
        ],
    );

    const closeDrawer = useCallback(() => {
        setPropertiesTarget(null);
        setUploadSession(null);
        setBulkActionLocked(false);
    }, [setPropertiesTarget, setUploadSession, setBulkActionLocked]);

    const openPropertiesEditorForSelection = useCallback(
        (itemIds: string[], label?: string) => {
            if (!enabled || itemIds.length === 0) return;

            if (itemIds.length === 1) {
                const itemId = itemIds[0]!;
                const row = rowsRef.current.find((r) => r.itemId === itemId);
                openPropertiesEditor({
                    kind: "item",
                    itemId,
                    name: row?.name ?? itemId,
                });
                return;
            }

            openPropertiesEditor({
                kind: "selection",
                itemIds,
                label: label ?? `${itemIds.length} selected`,
            });
        },
        [enabled, openPropertiesEditor],
    );

    return {
        openPropertiesEditor,
        openUploadEditor,
        closeDrawer,
        openPropertiesEditorForSelection,
    };
}
