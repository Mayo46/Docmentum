import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Snackbar } from "@mui/material";
import type {
  DocumentLibraryItemRow,
  DocumentLibraryProps,
  DocumentLibraryToast,
} from "../types";
import { toastFromFailures } from "../common/helpers";
import DeleteDialog from "./DeleteDialog";
import DocumentLibraryContextMenu from "./DocumentLibraryContextMenu";
import DocumentsTable from "./DocumentsTable";
import PropertiesDrawer from "./PropertiesDrawer";
import UploadDialog from "./UploadDialog";
import UploadPannel from "./UploadPannel";
import VersionHistoryDialog from "./VersionHistoryDialog";
import { useDocumentLibraryColumnDefs } from "../hooks/useDocumentLibraryColumnDefs";
import { useDocumentLibraryGrouping } from "../hooks/useDocumentLibraryGrouping";
import { useDocumentLibraryNavigation } from "../hooks/useDocumentLibraryNavigation";
import { useDocumentLibraryProperties } from "../hooks/useDocumentLibraryProperties";
import { useDocumentLibraryRows } from "../hooks/useDocumentLibraryRows";
import { useDocumentLibrarySelection } from "../hooks/useDocumentLibrarySelection";
import type { DocumentLibraryGridAgContext } from "../common/GroupRowRenderer";
import DocumentLibraryToolbar from "./DocumentLibraryToolbar";

export default function DocumentLibrary(props: DocumentLibraryProps) {
  const {
    client,
    parentDriveItemId,
    libraryRootLabel = "Library",
    initialSegmentName,
    showActions = true,
    showBreadcrumb = true,
    showUploadControls = true,
    showRowCheckbox = false,
    gridHeight,
    documentClientUrlFieldKey,
    columns,
    uploadColumns = [],
    editableProperties,
    uploadPrefillProperties,
    onSelectionChange,
    actions,
    showToolbar,
    dashboardName,
    onActionLoadingChange,
    documentType = "library",
  } = props;

  const [toast, setToast] = useState<DocumentLibraryToast | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<DocumentLibraryItemRow | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionsTarget, setVersionsTarget] =
    useState<DocumentLibraryItemRow | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const onToast = useCallback(
    (next: DocumentLibraryToast) => setToast(next),
    [],
  );

  const navigation = useDocumentLibraryNavigation({
    libraryRootLabel,
    parentDriveItemId,
    initialSegmentName,
  });

  const {
    rows,
    totalCount,
    loading,
    loadingMore,
    error,
    refresh,
    loadMore,
    hasMore,
  } = useDocumentLibraryRows({
    client,
    parentDriveItemId: navigation.currentParentDriveItemId,
    documentType,
  });

  const isFlatDashboardView =
    documentType === "favorites" || documentType === "checkout";
  const activeColumns = columns;

  const grouping = useDocumentLibraryGrouping({ rows, columns: activeColumns });

  // Property editing is always available; the drawer shows all columns by default
  // (or the configured `editableProperties` subset), respecting per-field read-only.
  const hasEditableProperties = true;

  const selection = useDocumentLibrarySelection({
    rows,
    groupingEnabled: grouping.groupingEnabled,
    showRowCheckbox,
    groupTree: grouping.groupTree,
    toggleGroupId: grouping.toggleGroupId,
    hasEditableProperties,
  });

  const properties = useDocumentLibraryProperties({
    client,
    editableProperties,
    uploadPrefillProperties,
    rows,
    groupTree: grouping.groupTree,
    selectedItemIds: selection.selectedItemIds,
    groupingEnabled: grouping.groupingEnabled,
    refresh,
    onToast,
  });

  const gridContext: DocumentLibraryGridAgContext = useMemo(
    () => ({
      ...selection.gridContext,
      onGroupContextMenu: grouping.groupingEnabled
        ? properties.handleGroupContextMenu
        : undefined,
    }),
    [
      selection.gridContext,
      grouping.groupingEnabled,
      properties.handleGroupContextMenu,
    ],
  );

  const documentUrlFromRow = useCallback(
    (row: DocumentLibraryItemRow) => {
      const fromField = row.fields?.[documentClientUrlFieldKey];
      if (typeof fromField === "string" && fromField.trim().length > 0) {
        return fromField;
      }
      return typeof row.webUrl === "string" ? row.webUrl : undefined;
    },
    [documentClientUrlFieldKey],
  );

  const openVersionHistory = useCallback((row: DocumentLibraryItemRow) => {
    setVersionsTarget(row);
    setVersionsOpen(true);
  }, []);

  const onDeleteRow = useCallback((row: DocumentLibraryItemRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  }, []);

  const columnDefs = useDocumentLibraryColumnDefs({
    columns: activeColumns,
    groupingEnabled: grouping.groupingEnabled,
    showRowCheckbox,
    showActions: showActions && !isFlatDashboardView,
    navigateInto: isFlatDashboardView
      ? () => undefined
      : navigation.navigateInto,
    documentUrlFromRow,
    openVersionHistory,
    onDeleteRow,
  });

  const onSelectFiles = useCallback(
    (files: FileList | null) => {
      if (!navigation.uploadsEnabled) return;
      if (!files || files.length === 0) return;
      const arr = Array.from(files).filter((f) => f.size >= 0);
      setUploadFiles(arr);
      setUploadOpen(true);
    },
    [navigation.uploadsEnabled],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await client.deleteItem({ itemId: deleteTarget.itemId });
      onToast({ kind: "success", message: "Deleted." });
      setDeleteOpen(false);
      setDeleteTarget(null);
      await refresh();
    } catch (e) {
      onToast({
        kind: "error",
        message: e instanceof Error ? e.message : "Delete failed",
      });
    }
  }, [client, deleteTarget, refresh, onToast]);

  const selectedRows = useMemo(
    () =>
      grouping.gridRows.filter(
        (row) =>
          row.rowType === "data" && selection.selectedItemIds.has(row.itemId),
      ),
    [grouping.gridRows, selection.selectedItemIds],
  );

  useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedRows, onSelectionChange]);

  const {
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
    onRowContextMenu,
    handleSaveProperties,
  } = properties;

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <DocumentLibraryToolbar
        title={dashboardName}
        showToolbar={showToolbar}
        actions={actions}
        selectedRows={selectedRows}
        client={client}
        onToast={onToast}
        onRefresh={refresh}
        onEditProperties={openPropertiesEditorForSelection}
        onActionLoadingChange={onActionLoadingChange}
      />
      <UploadPannel
        uploadsEnabled={navigation.uploadsEnabled && !isFlatDashboardView}
        showBreadcrumb={showBreadcrumb && !isFlatDashboardView}
        showUploadControls={showUploadControls && !isFlatDashboardView}
        loading={loading}
        segments={navigation.segments}
        onBreadcrumbClick={navigation.onBreadcrumbClick}
        onSelectFiles={onSelectFiles}
        onRefresh={refresh}
        groupByMenu={{
          columns: activeColumns.map((c) => ({
            key: c.key,
            headerName: c.headerName,
          })),
          selectedKey: grouping.userGroupByKey,
          onChange: grouping.setUserGroupByKey,
        }}
      >
        <DocumentsTable
          rows={grouping.gridRows}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          totalCount={totalCount}
          hasMore={hasMore}
          columnDefs={columnDefs}
          loading={loading}
          error={error}
          groupingEnabled={grouping.groupingEnabled}
          gridHeight={gridHeight}
          gridContext={gridContext}
          onRowContextMenu={
            hasEditableProperties ? onRowContextMenu : undefined
          }
          documentType={documentType}
        />
      </UploadPannel>

      <VersionHistoryDialog
        open={versionsOpen}
        itemId={versionsTarget?.itemId ?? null}
        itemName={versionsTarget?.name}
        client={client}
        onClose={() => setVersionsOpen(false)}
        onRestored={refresh}
      />

      <UploadDialog
        open={uploadOpen && navigation.uploadsEnabled && showUploadControls}
        files={uploadFiles}
        uploadColumns={hasEditableProperties ? [] : uploadColumns}
        fieldDefinitions={hasEditableProperties ? fieldDefinitions : []}
        definitionsLoading={hasEditableProperties && fieldDefinitionsLoading}
        initialProperties={uploadPrefillProperties}
        onClose={() => setUploadOpen(false)}
        onUpload={async ({ files, contentType, properties: uploadProps }) => {
          const result = await client.uploadFiles({
            parentDriveItemId: navigation.currentParentDriveItemId,
            files,
            contentType,
            properties: uploadProps,
          });

          if (result.failures.length > 0) {
            onToast({
              kind: "error",
              message: `Upload failed for:\n${toastFromFailures(result.failures)}`,
            });
          } else {
            onToast({
              kind: "success",
              message: `Uploaded ${files.length} file(s).`,
            });
          }

          await refresh();
          return result;
        }}
      />

      <DeleteDialog
        open={deleteOpen}
        deleteTarget={deleteTarget}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <DocumentLibraryContextMenu
        contextMenu={contextMenu}
        bulkSelectedCount={contextMenuBulkSelectedCount}
        onClose={() => setContextMenu(null)}
        onEditProperties={openPropertiesEditor}
      />

      <PropertiesDrawer
        open={!!propertiesTarget}
        title={
          propertiesTarget?.kind === "bulk"
            ? "Edit All properties (group)"
            : propertiesTarget?.kind === "selection"
              ? "Edit properties (selected)"
              : "Edit properties"
        }
        subtitle={
          propertiesTarget?.kind === "bulk"
            ? `${propertiesTarget.label} — ${bulkPropertiesItemIds.length} item(s)`
            : propertiesTarget?.kind === "item"
              ? propertiesTarget.name
              : undefined
        }
        submitDisabled={
          (propertiesTarget?.kind === "bulk" ||
            propertiesTarget?.kind === "selection") &&
          bulkPropertiesItemIds.length === 0
        }
        definitions={propertiesDefinitions}
        definitionsLoading={fieldDefinitionsLoading}
        initialValues={propertiesInitialValues}
        valuesLoading={propertiesValuesLoading}
        submitting={propertiesSubmitting}
        onClose={() => setPropertiesTarget(null)}
        onSubmit={handleSaveProperties}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={8000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert
            severity={toast.kind}
            variant="filled"
            sx={{ width: "100%", whiteSpace: "pre-wrap" }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
