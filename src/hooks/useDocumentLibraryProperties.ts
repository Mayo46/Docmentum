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

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const fieldDefinitionsRef = useRef(fieldDefinitions);
  fieldDefinitionsRef.current = fieldDefinitions;

  const openPropertiesEditor = useCallback(
    (target: DocumentLibraryPropertiesEditTarget) => {
      setPropertiesTarget(target);
      setPropertiesInitialValues(undefined);
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

  // The item whose current values seed the drawer. For bulk/selection targets we
  // prefill from the first selected item so users edit against real values, not blanks.
  const primaryItemId =
    propertiesTarget?.kind === "item"
      ? propertiesTarget.itemId
      : propertiesTarget?.kind === "selection"
        ? propertiesTarget.itemIds[0] ?? null
        : propertiesTarget?.kind === "bulk"
          ? bulkPropertiesItemIds[0] ?? null
          : null;

  const isMultiItemTarget =
    propertiesTarget?.kind === "bulk" || propertiesTarget?.kind === "selection";

  // The file-name field can't be applied to multiple items (it must stay unique per
  // item), so surface it as read-only when editing a bulk/multi selection.
  const propertiesDefinitions = useMemo(() => {
    if (!isMultiItemTarget) return fieldDefinitions;
    return fieldDefinitions.map((def) =>
      isPerItemUniqueField(def.key) ? { ...def, readOnly: true } : def,
    );
  }, [fieldDefinitions, isMultiItemTarget]);

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

  return {
    hasEditableProperties,
    fieldDefinitions,
    propertiesDefinitions,
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
    openPropertiesEditor,
    openPropertiesEditorForSelection,
    handleGroupContextMenu,
    onRowContextMenu,
    handleSaveProperties,
  };
}
