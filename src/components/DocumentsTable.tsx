import { useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  CellContextMenuEvent,
  ColDef,
  GetRowIdParams,
  GridApi,
  IsFullWidthRowParams,
  RowHeightParams,
} from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { Alert, Box } from "@mui/material";
import type { DocumentLibraryDocumentType, DocumentLibraryGridRow } from "./../types";
import type { DocumentLibraryGridAgContext } from "../common/GroupRowRenderer";
import GroupRowRenderer from "../common/GroupRowRenderer";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);

type DocumentsTableProps = {
  rows: DocumentLibraryGridRow[];
  columnDefs: ColDef<DocumentLibraryGridRow>[];
  loading: boolean;

  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;

  error: string | null;
  groupingEnabled?: boolean;
  gridHeight?: number | string;
  gridContext?: DocumentLibraryGridAgContext;
  onRowContextMenu?: (
    event: CellContextMenuEvent<DocumentLibraryGridRow>,
  ) => void;
  documentType?: DocumentLibraryDocumentType;
};

function toCssHeight(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

export default function DocumentsTable({
  rows,
  columnDefs,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  error,
  groupingEnabled = false,
  gridHeight,
  gridContext,
  onRowContextMenu,
  totalCount,
  loading,
  documentType
}: DocumentsTableProps) {
  const gridApiRef = useRef<GridApi<DocumentLibraryGridRow> | null>(null);
  const selectionRevision = gridContext?.selectionRevision;
  const resolvedHeight =
    gridHeight === undefined
      ? "calc(100vh - 230px)"
      : toCssHeight(gridHeight);

  useEffect(() => {
    if (selectionRevision === undefined) return;
    const api = gridApiRef.current;
    if (!api) return;
    api.refreshCells({ force: true });
    api.redrawRows();
    api.refreshHeader();
  }, [selectionRevision]);

  const handleViewportChanged = () => {
    const api = gridApiRef.current;

    if (!api) return;
    if (!hasMore) return;
    if (loadingMore) return;
    if (!onLoadMore) return;

    const lastVisibleRow = api.getLastDisplayedRowIndex();
    const totalRows = api.getDisplayedRowCount();

    /*
     * Start loading before the user reaches the absolute
     * last row so scrolling feels continuous.
     */
    const threshold = 10;

    if (lastVisibleRow >= totalRows - threshold) {
      onLoadMore();
    }
  };

  return (
    <>
      {error ? (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : null}

      <Box
        className="ag-theme-alpine doc-library-ag-grid"
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,

          height: resolvedHeight,
          minHeight: 280,
          overflow: "hidden",

          "& .ag-root-wrapper": {
            width: "100%",
            height: "100%",
          },

          "& .ag-root-wrapper-body": {
            width: "100%",
            height: "100%",
          },
          "& .ag-full-width-row": { overflow: "visible" },
          "& .ag-full-width-row .ag-cell": {
            overflow: "visible",
            display: "flex",
            alignItems: "stretch",
          },
          "& .ag-full-width-row .ag-cell-wrapper": {
            padding: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "stretch",
          },
          "& .ag-full-width-row .ag-cell-value, & .ag-full-width-row .ag-group-cell-renderer-container":
          {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          },
          "& .doc-library-selection-cell": {
            overflow: "visible",
            paddingLeft: "4px",
            paddingRight: "4px",
          },
          "& .doc-library-selection-cell .ag-cell-wrapper": {
            overflow: "visible",
          },
          "& .doc-library-selection-cell .ag-cell-value": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            overflow: "visible",
          },
          "& .doc-library-selection-cell.ag-header-cell": {
            "& .ag-header-cell-comp-wrapper": {
              overflow: "visible",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            "& .ag-header-cell-label": {
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "visible",
              padding: 0,
              margin: 0,
            },
          },
        }}
      >
        <AgGridReact<DocumentLibraryGridRow>
          theme="legacy"
          rowData={rows}
          columnDefs={columnDefs}
          context={gridContext}
          onGridReady={(e) => {
            gridApiRef.current = e.api;
          }}
          onViewportChanged={handleViewportChanged}
          defaultColDef={{
            tooltipValueGetter: (p) => (p.value ? String(p.value) : ""),
          }}
          getRowId={(p: GetRowIdParams<DocumentLibraryGridRow>) => {
            const d = p.data;
            if (!d) return "";
            return d.rowType === "group" ? d.id : d.itemId;
          }}
          isFullWidthRow={(p: IsFullWidthRowParams<DocumentLibraryGridRow>) =>
            groupingEnabled && p.rowNode.data?.rowType === "group"
          }
          embedFullWidthRows={false}
          fullWidthCellRenderer={groupingEnabled ? GroupRowRenderer : undefined}
          getRowHeight={(p: RowHeightParams<DocumentLibraryGridRow>) => {
            if (p.data?.rowType === "group") return 48;
            return undefined;
          }}
          suppressRowClickSelection
          preventDefaultOnContextMenu={!!onRowContextMenu}
          onCellContextMenu={onRowContextMenu}
          domLayout={"normal"}
          loading={loading}
        />
      </Box>
      {
        documentType === "library" ?
          <Box
            sx={{
              px: 2,
              py: 1,
              flexShrink: 0,
              fontSize: "0.875rem",
            }}
          >
            Count <b>{totalCount}</b>
          </Box>
          : null
      }
    </>
  );
}
