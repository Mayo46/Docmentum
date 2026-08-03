import { useMemo, useState } from "react";
import type {
  DocumentLibraryPropertiesEditTarget,
} from "../types";
import { useEditableFieldDefinitions } from "./useEditableFieldDefinitions";
import { normalizeEditablePropertiesInput } from "../utils/editableProperties";
import { filterFieldDefinitionsForUpload } from "../utils/fieldDefinitions";
import type { UseDocumentLibraryPropertiesParams } from "../types/documentLibraryProperties";
import { useContextMenu } from "./documentLibraryProperties/useContextMenu";
import { useDrawerControls } from "./documentLibraryProperties/useDrawerControls";
import { useStepNavigation } from "./documentLibraryProperties/useStepNavigation";
import { useDrawerValueSeeding } from "./documentLibraryProperties/useDrawerValueSeeding";
import { useEditSubmitHandlers } from "./documentLibraryProperties/useEditSubmitHandlers";
import { useUploadSubmitHandlers } from "./documentLibraryProperties/useUploadSubmitHandlers";

export type { UseDocumentLibraryPropertiesParams } from "../types/documentLibraryProperties";

export function useDocumentLibraryProperties({
  client,
  editableProperties,
  uploadPrefillProperties,
  parentDriveItemId,
  rows,
  groupTree,
  selectedItemIds,
  groupingEnabled,
  refresh,
  onToast,
  clearSelection,
}: UseDocumentLibraryPropertiesParams) {
  const editableKeys = useMemo(
    () => normalizeEditablePropertiesInput(editableProperties).keys,
    [JSON.stringify(editableProperties ?? null)],
  );
  const editableKeysSignature = editableKeys.join("|");
  // Property editing is always available; when no explicit keys are configured the
  // form falls back to showing all available columns (read-only ones stay disabled).
  const hasEditableProperties = true;
  const uploadPrefillSignature = useMemo(
    () => JSON.stringify(uploadPrefillProperties ?? {}),
    [uploadPrefillProperties],
  );

  const { definitions: fieldDefinitions, loading: fieldDefinitionsLoading } =
    useEditableFieldDefinitions({ client, editableProperties });

  // Upload reuses the same form but drops read-only / content-type-only columns.
  const uploadFieldDefinitions = useMemo(
    () => filterFieldDefinitionsForUpload(fieldDefinitions),
    [fieldDefinitions],
  );

  const [propertiesTarget, setPropertiesTarget] =
    useState<DocumentLibraryPropertiesEditTarget | null>(null);
  // Non-null while the drawer is open in upload mode for the given files.
  const [uploadSession, setUploadSession] = useState<File[] | null>(null);
  const [propertiesInitialValues, setPropertiesInitialValues] = useState<
    Record<string, unknown> | undefined
  >();
  const [propertiesValuesLoading, setPropertiesValuesLoading] = useState(false);
  const [propertiesSubmitting, setPropertiesSubmitting] = useState(false);
  // Index of the document currently shown when stepping through a multi-selection
  // via "Save and Move to Next Doc".
  const [stepIndex, setStepIndex] = useState(0);
  // True once per-file step processing ("Save/Upload & Next") has begun, so the
  // bulk "Save/Upload Multiple" action is disabled to prevent duplicate submissions.
  const [bulkActionLocked, setBulkActionLocked] = useState(false);

  const {
    contextMenu,
    setContextMenu,
    handleGroupContextMenu,
    onRowContextMenu,
    contextMenuBulkSelectedCount,
  } = useContextMenu({
    enabled: hasEditableProperties,
    groupingEnabled,
    groupTree,
    selectedItemIds,
  });

  const {
    openPropertiesEditor,
    openUploadEditor,
    closeDrawer,
    openPropertiesEditorForSelection,
  } = useDrawerControls({
    enabled: hasEditableProperties,
    rows,
    setPropertiesTarget,
    setUploadSession,
    setPropertiesInitialValues,
    setStepIndex,
    setBulkActionLocked,
    setContextMenu,
  });

  const {
    bulkPropertiesItemIds,
    targetItemIds,
    isMultiItemTarget,
    stepTotal,
    safeStepIndex,
    isLastStep,
    primaryItemId,
    primaryItemName,
    uploadTitle,
  } = useStepNavigation({
    propertiesTarget,
    uploadSession,
    groupTree,
    selectedItemIds,
    stepIndex,
    rows,
  });

  useDrawerValueSeeding({
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
  });

  const { handleSaveProperties, handleSaveAndNext } = useEditSubmitHandlers({
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
  });

  const { handleUpload, handleUploadAndNext } = useUploadSubmitHandlers({
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
  });

  const drawerMode: "edit" | "upload" = uploadSession ? "upload" : "edit";
  const drawerOpen = !!propertiesTarget || !!uploadSession;

  return {
    hasEditableProperties,
    fieldDefinitions,
    uploadFieldDefinitions,
    fieldDefinitionsLoading,
    contextMenu,
    setContextMenu,
    contextMenuBulkSelectedCount,
    bulkPropertiesItemIds,
    propertiesTarget,
    setPropertiesTarget,
    propertiesInitialValues,
    propertiesValuesLoading,
    propertiesSubmitting,
    isMultiItemTarget,
    stepCurrent: safeStepIndex + 1,
    stepTotal,
    isLastStep,
    bulkActionLocked,
    primaryItemName,
    drawerMode,
    drawerOpen,
    uploadFiles: uploadSession ?? [],
    uploadTitle,
    openPropertiesEditor,
    openPropertiesEditorForSelection,
    openUploadEditor,
    closeDrawer,
    handleGroupContextMenu,
    onRowContextMenu,
    handleSaveProperties,
    handleSaveAndNext,
    handleUpload,
    handleUploadAndNext,
  };
}
