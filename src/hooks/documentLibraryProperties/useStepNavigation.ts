import { useMemo } from "react";
import type {
    DocumentLibraryItemRow,
    DocumentLibraryPropertiesEditTarget,
} from "../../types";
import {
    resolveBulkSelectedItemIds,
    type GroupTreeNode,
} from "../../utils/groupTree";
import { stripFileExtension } from "../../utils/files";

type Params = {
    propertiesTarget: DocumentLibraryPropertiesEditTarget | null;
    uploadSession: File[] | null;
    groupTree: GroupTreeNode[];
    selectedItemIds: Set<string>;
    stepIndex: number;
    rows: DocumentLibraryItemRow[];
};

/**
 * Unifies step state across edit and upload modes: edit steps through the selected
 * items, upload steps through the selected files, so drawer navigation behaves
 * identically for both.
 */
export function useStepNavigation({
    propertiesTarget,
    uploadSession,
    groupTree,
    selectedItemIds,
    stepIndex,
    rows,
}: Params) {
    const bulkPropertiesItemIds = useMemo(() => {
        if (!propertiesTarget) return [];
        if (propertiesTarget.kind === "selection") return propertiesTarget.itemIds;
        if (propertiesTarget.kind === "bulk") {
            return resolveBulkSelectedItemIds(
                groupTree,
                propertiesTarget.groupId,
                selectedItemIds,
            );
        }
        return [];
    }, [propertiesTarget, groupTree, selectedItemIds]);

    // Ordered list of every item the current target will update.
    const targetItemIds = useMemo(() => {
        if (!propertiesTarget) return [];
        if (propertiesTarget.kind === "item") return [propertiesTarget.itemId];
        return bulkPropertiesItemIds;
    }, [propertiesTarget, bulkPropertiesItemIds]);

    const isUploadMode = !!uploadSession;
    const stepCount = isUploadMode
        ? (uploadSession?.length ?? 0)
        : targetItemIds.length;
    const isMultiItemTarget = stepCount > 1;
    const stepTotal = stepCount;
    const safeStepIndex = Math.min(stepIndex, Math.max(stepCount - 1, 0));
    const isLastStep = safeStepIndex >= stepCount - 1;

    // The item whose current values seed the drawer (edit mode only). For multi-item
    // targets this is the document currently being stepped through.
    const primaryItemId = isUploadMode
        ? null
        : (targetItemIds[safeStepIndex] ?? null);

    // The file currently shown when stepping through an upload.
    const currentUploadFile = isUploadMode
        ? (uploadSession?.[safeStepIndex] ?? null)
        : null;

    // Step-header name: the row name (edit) or full file name (upload).
    const primaryItemName = useMemo(() => {
        if (isUploadMode) return currentUploadFile?.name;
        return primaryItemId
            ? rows.find((r) => r.itemId === primaryItemId)?.name
            : undefined;
    }, [isUploadMode, currentUploadFile, primaryItemId, rows]);

    // Drawer title for upload mode: current file name without its extension.
    const uploadTitle = currentUploadFile
        ? stripFileExtension(currentUploadFile.name)
        : undefined;

    return {
        bulkPropertiesItemIds,
        targetItemIds,
        isUploadMode,
        isMultiItemTarget,
        stepTotal,
        safeStepIndex,
        isLastStep,
        primaryItemId,
        currentUploadFile,
        primaryItemName,
        uploadTitle,
    };
}
