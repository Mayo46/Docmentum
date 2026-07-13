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
import { Alert, Box, CircularProgress } from "@mui/material";
import type { DocumentLibraryGridRow } from "./../types";
import type { DocumentLibraryGridAgContext } from "../common/GroupRowRenderer";
import GroupRowRenderer from "../common/GroupRowRenderer";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);

type DocumentsTableProps = {
    rows: DocumentLibraryGridRow[];
    columnDefs: ColDef<DocumentLibraryGridRow>[];
    loading: boolean;
    error: string | null;
    groupingEnabled?: boolean;
    gridHeight?: number | string;
    gridContext?: DocumentLibraryGridAgContext;
    onRowContextMenu?: (event: CellContextMenuEvent<DocumentLibraryGridRow>) => void;
};

function toCssHeight(value: number | string) {
    return typeof value === "number" ? `${value}px` : value;
}

export default function DocumentsTable({
    rows,
    columnDefs,
    loading,
    error,
    groupingEnabled = false,
    gridHeight,
    gridContext,
    onRowContextMenu,
}: DocumentsTableProps) {
    const gridApiRef = useRef<GridApi<DocumentLibraryGridRow> | null>(null);
    const selectionRevision = gridContext?.selectionRevision;
    const useAutoHeight = gridHeight === undefined;
    const resolvedHeight = gridHeight === undefined ? undefined : toCssHeight(gridHeight);

    useEffect(() => {
        if (selectionRevision === undefined) return;
        const api = gridApiRef.current;
        if (!api) return;
        api.refreshCells({ force: true });
        api.redrawRows();
        api.refreshHeader();
    }, [selectionRevision]);

    return (
        <>
            {error ? (
                <Box sx={{ p: 2 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            ) : null}

            {loading ? (
                <Box
                    sx={{
                        minHeight: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : null}

            <Box
                className="ag-theme-alpine doc-library-ag-grid"
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    ...(useAutoHeight
                        ? { minHeight: rows.length === 0 ? 160 : undefined }
                        : {
                              height: resolvedHeight,
                              minHeight: 280,
                              overflow: "hidden",
                          }),
                    "& .ag-root-wrapper": { width: "100%" },
                    "& .ag-root-wrapper-body": { width: "100%" },
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
                    pagination
                    paginationPageSize={20}
                    paginationPageSizeSelector={false}
                    domLayout={useAutoHeight ? "autoHeight" : "normal"}
                />
            </Box>
        </>
    );
}
