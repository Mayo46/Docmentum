import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Snackbar } from "@mui/material";
import type {
  DocumentLibraryItemRow,
  DocumentLibraryProps,
  DocumentLibraryToast,
} from "../types";
import DeleteDialog from "./DeleteDialog";
import DocumentLibraryContextMenu from "./DocumentLibraryContextMenu";
import DocumentsTable from "./DocumentsTable";
import FileSelectionDialog from "./FileSelectionDialog";
import PropertiesDrawer from "./PropertiesDrawer";
import UploadPannel from "./UploadPannel";
import VersionHistoryDialog from "./VersionHistoryDialog";
import { useDocumentLibraryColumnDefs } from "../hooks/useDocumentLibraryColumnDefs";
import { useDocumentLibraryGrouping } from "../hooks/useDocumentLibraryGrouping";
import { useDocumentLibraryNavigation } from "../hooks/useDocumentLibraryNavigation";
import { useDocumentLibraryProperties } from "../hooks/useDocumentLibraryProperties";
import { useDocumentLibraryRows } from "../hooks/useDocumentLibraryRows";
import { useDocumentLibrarySelection } from "../hooks/useDocumentLibrarySelection";
import { useUploadDialog } from "../hooks/useUploadDialog";
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
    parentDriveItemId: navigation.currentParentDriveItemId,
    rows,
    groupTree: grouping.groupTree,
    selectedItemIds: selection.selectedItemIds,
    groupingEnabled: grouping.groupingEnabled,
    refresh,
    onToast,
    clearSelection: selection.clearSelection,
  });

  const uploadDialog = useUploadDialog();

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

  // Step 1 entry points: opening the file-selection dialog. Files dropped directly on
  // the panel pre-fill the dialog; the Import button opens it empty for a fresh start.
  const onSelectFiles = useCallback(
    (files: FileList | null) => {
      if (!navigation.uploadsEnabled) return;
      if (!files || files.length === 0) return;
      const arr = Array.from(files).filter((f) => f.size >= 0);
      uploadDialog.openDialog(arr);
    },
    [navigation.uploadsEnabled, uploadDialog.openDialog],
  );

  const onImportClick = useCallback(() => {
    if (!navigation.uploadsEnabled) return;
    uploadDialog.openDialog([]);
  }, [navigation.uploadsEnabled, uploadDialog.openDialog]);

  // Step 1 -> Step 2: hand the selection to the Edit Properties drawer, keeping the
  // pending files so the user can navigate back to this exact selection.
  const handleGoToEditProperties = useCallback(() => {
    if (uploadDialog.files.length === 0) return;
    properties.openUploadEditor(uploadDialog.files);
    uploadDialog.hideDialog();
  }, [uploadDialog.files, uploadDialog.hideDialog, properties.openUploadEditor]);

  // Step 2 -> Step 1: only reachable before any file has been uploaded. Closes the
  // drawer and reopens the dialog with the still-pending selection.
  const handleBackToFileSelection = useCallback(() => {
    properties.closeDrawer();
    uploadDialog.reopenDialog();
  }, [properties.closeDrawer, uploadDialog.reopenDialog]);

  // Cancelling the drawer in upload mode abandons the flow entirely, so clear the
  // pending selection too. If step-by-step upload already committed some files to
  // SharePoint (bulkActionLocked), refresh so the grid reflects those uploads even
  // though the user bailed out before finishing every file.
  const handleUploadDrawerCancel = useCallback(() => {
    const hadPartialUploads = properties.bulkActionLocked;
    properties.closeDrawer();
    uploadDialog.closeDialog();
    if (hadPartialUploads) void refresh();
  }, [
    properties.closeDrawer,
    properties.bulkActionLocked,
    uploadDialog.closeDialog,
    refresh,
  ]);

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
    uploadFieldDefinitions,
    fieldDefinitionsLoading,
    contextMenu,
    setContextMenu,
    contextMenuBulkSelectedCount,
    bulkPropertiesItemIds,
    propertiesTarget,
    propertiesInitialValues,
    propertiesValuesLoading,
    propertiesSubmitting,
    isMultiItemTarget,
    stepCurrent,
    stepTotal,
    isLastStep,
    bulkActionLocked,
    primaryItemName,
    drawerMode,
    drawerOpen,
    uploadFiles,
    uploadTitle,
    openPropertiesEditor,
    openPropertiesEditorForSelection,
    closeDrawer,
    onRowContextMenu,
    handleSaveProperties,
    handleSaveAndNext,
    handleUpload,
    handleUploadAndNext,
  } = properties;

  const isUploadMode = drawerMode === "upload";

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
        onImportClick={onImportClick}
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

      <FileSelectionDialog
        open={uploadDialog.open}
        files={uploadDialog.files}
        onAddFiles={uploadDialog.addFiles}
        onRemoveFile={uploadDialog.removeFileAt}
        onCancel={uploadDialog.closeDialog}
        onContinue={handleGoToEditProperties}
      />

      <VersionHistoryDialog
        open={versionsOpen}
        itemId={versionsTarget?.itemId ?? null}
        itemName={versionsTarget?.name}
        client={client}
        onClose={() => setVersionsOpen(false)}
        onRestored={refresh}
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
        open={drawerOpen}
        mode={drawerMode}
        files={uploadFiles}
        title={
          isUploadMode
            ? (uploadTitle ?? "Upload Documents")
            : propertiesTarget?.kind === "bulk"
              ? "Edit All properties (group)"
              : propertiesTarget?.kind === "selection"
                ? "Edit properties (selected)"
                : "Edit properties"
        }
        subtitle={
          isUploadMode
            ? isMultiItemTarget
              ? undefined
              : uploadFiles[0]?.name
            : propertiesTarget?.kind === "bulk"
              ? `${propertiesTarget.label} — ${bulkPropertiesItemIds.length} item(s)`
              : propertiesTarget?.kind === "item"
                ? propertiesTarget.name
                : undefined
        }
        submitDisabled={
          !isUploadMode &&
          (propertiesTarget?.kind === "bulk" ||
            propertiesTarget?.kind === "selection") &&
          bulkPropertiesItemIds.length === 0
        }
        definitions={isUploadMode ? uploadFieldDefinitions : fieldDefinitions}
        definitionsLoading={fieldDefinitionsLoading}
        initialValues={propertiesInitialValues}
        valuesLoading={isUploadMode ? false : propertiesValuesLoading}
        submitting={propertiesSubmitting}
        multiItem={isMultiItemTarget}
        bulkActionDisabled={bulkActionLocked}
        stepCurrent={stepCurrent}
        stepTotal={stepTotal}
        isLastStep={isLastStep}
        stepItemName={primaryItemName}
        onClose={isUploadMode ? handleUploadDrawerCancel : closeDrawer}
        onSubmit={isUploadMode ? handleUpload : handleSaveProperties}
        onSaveAndNext={isUploadMode ? handleUploadAndNext : handleSaveAndNext}
        onBack={
          isUploadMode && !bulkActionLocked
            ? handleBackToFileSelection
            : undefined
        }
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
