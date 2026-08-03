import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellContextMenuEvent } from "ag-grid-community";
import type {
  DocumentLibraryContextMenuState,
  DocumentLibraryGraphClient,
  DocumentLibraryGridRow,
  DocumentLibraryItemRow,
  DocumentLibraryPropertiesEditTarget,
  DocumentLibraryToast,
} from "../types";
import { toastFromFieldUpdateFailures } from "../common/helpers";
import { useEditableFieldDefinitions } from "./useEditableFieldDefinitions";
import { normalizeEditablePropertiesInput } from "../utils/editableProperties";
import { getCellValue } from "../utils/columns";
import { isPerItemUniqueField } from "../utils/fieldDefinitions";
import {
  getGroupLabel,
  resolveBulkSelectedItemIds,
  type GroupTreeNode,
} from "../utils/groupTree";

type UseDocumentLibraryPropertiesParams = {
  client: DocumentLibraryGraphClient;
  editableProperties?: unknown;
  uploadPrefillProperties?: Record<string, unknown>;
  rows: DocumentLibraryItemRow[];
  groupTree: GroupTreeNode[];
  selectedItemIds: Set<string>;
  groupingEnabled: boolean;
  refresh: () => Promise<void>;
  onToast: (toast: DocumentLibraryToast) => void;
};

export function useDocumentLibraryProperties({
  client,
  editableProperties,
  uploadPrefillProperties,
  rows,
  groupTree,
  selectedItemIds,
  groupingEnabled,
  refresh,
  onToast,
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

  const [contextMenu, setContextMenu] =
    useState<DocumentLibraryContextMenuState | null>(null);
  const [propertiesTarget, setPropertiesTarget] =
    useState<DocumentLibraryPropertiesEditTarget | null>(null);
  const [propertiesInitialValues, setPropertiesInitialValues] = useState<
    Record<string, unknown> | undefined
  >();
  const [propertiesValuesLoading, setPropertiesValuesLoading] = useState(false);
  const [propertiesSubmitting, setPropertiesSubmitting] = useState(false);
  // Index of the document currently shown when stepping through a multi-selection
  // via "Save and Move to Next Doc".
  const [stepIndex, setStepIndex] = useState(0);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const fieldDefinitionsRef = useRef(fieldDefinitions);
  fieldDefinitionsRef.current = fieldDefinitions;

  const openPropertiesEditor = useCallback(
    (target: DocumentLibraryPropertiesEditTarget) => {
      setPropertiesTarget(target);
      setPropertiesInitialValues(undefined);
      setStepIndex(0);
      setContextMenu(null);
    },
    [],
  );

  const openPropertiesEditorForSelection = useCallback(
    (itemIds: string[], label?: string) => {
      if (!hasEditableProperties || itemIds.length === 0) return;

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
    [hasEditableProperties, openPropertiesEditor],
  );

  const handleGroupContextMenu = useCallback(
    (event: React.MouseEvent, groupId: string) => {
      if (!hasEditableProperties || !groupingEnabled) return;
      setContextMenu({
        mouseX: event.clientX,
        mouseY: event.clientY,
        target: {
          kind: "bulk",
          groupId,
          label: getGroupLabel(groupTree, groupId),
        },
      });
    },
    [hasEditableProperties, groupingEnabled, groupTree],
  );

  const onRowContextMenu = useCallback(
    (event: CellContextMenuEvent<DocumentLibraryGridRow>) => {
      if (!hasEditableProperties) return;
      const data = event.data;
      if (!data || data.rowType === "group") return;
      event.event?.preventDefault();
      const mouseEvent = event.event as MouseEvent | undefined;
      setContextMenu({
        mouseX: mouseEvent?.clientX ?? 0,
        mouseY: mouseEvent?.clientY ?? 0,
        target: { kind: "item", itemId: data.itemId, name: data.name },
      });
    },
    [hasEditableProperties],
  );

  const contextMenuBulkSelectedCount = useMemo(() => {
    if (contextMenu?.target.kind !== "bulk") return 0;
    return resolveBulkSelectedItemIds(
      groupTree,
      contextMenu.target.groupId,
      selectedItemIds,
    ).length;
  }, [contextMenu, groupTree, selectedItemIds]);

  const bulkPropertiesItemIds = useMemo(() => {
    if (!propertiesTarget) return [];
    if (propertiesTarget?.kind === "selection") return propertiesTarget.itemIds;
    if (propertiesTarget?.kind === "bulk") {
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

  const isMultiItemTarget = targetItemIds.length > 1;
  const stepTotal = targetItemIds.length;
  const safeStepIndex = Math.min(stepIndex, Math.max(targetItemIds.length - 1, 0));
  const isLastStep = safeStepIndex >= targetItemIds.length - 1;

  // The item whose current values seed the drawer. For multi-item targets this is the
  // document currently being stepped through, so users edit against real values.
  const primaryItemId = targetItemIds[safeStepIndex] ?? null;

  const primaryItemName = useMemo(
    () =>
      primaryItemId
        ? rowsRef.current.find((r) => r.itemId === primaryItemId)?.name
        : undefined,
    [primaryItemId],
  );

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
          await refresh();
        }
      } finally {
        setPropertiesSubmitting(false);
      }
    },
    [client, propertiesTarget, bulkPropertiesItemIds, refresh, onToast],
  );

  // Saves only the document currently shown, then advances to the next selected
  // document (or closes + refreshes once the last one is saved).
  const handleSaveAndNext = useCallback(
    async (properties: Record<string, unknown>) => {
      if (!propertiesTarget) return;
      const itemId = targetItemIds[safeStepIndex];
      if (!itemId) return;
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
    ],
  );

  return {
    hasEditableProperties,
    fieldDefinitions,
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
    primaryItemName,
    openPropertiesEditor,
    openPropertiesEditorForSelection,
    handleGroupContextMenu,
    onRowContextMenu,
    handleSaveProperties,
    handleSaveAndNext,
  };
}
