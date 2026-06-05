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
    gridContext?: DocumentLibraryGridAgContext;
    onRowContextMenu?: (event: CellContextMenuEvent<DocumentLibraryGridRow>) => void;
};

export default function DocumentsTable({
    rows,
    columnDefs,
    loading,
    error,
    groupingEnabled = false,
    gridContext,
    onRowContextMenu,
}: DocumentsTableProps) {
    const gridApiRef = useRef<GridApi<DocumentLibraryGridRow> | null>(null);
    const selectionRevision = gridContext?.selectionRevision;

    useEffect(() => {
        if (selectionRevision === undefined) return;
        const api = gridApiRef.current;
        if (!api) return;
        // Full-width group rows do not update from refreshCells alone.
        api.refreshCells({ force: true });
        api.redrawRows();
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
                        height: 260,
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
                    height: 520,
                    overflow: "auto",
                    // Full-width group rows: remove default cell padding and clipping (fixes top-cut text).
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
                    // Selection column: same padding and centering in header and body cells.
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
                    // autoHeight ignores fixed row heights for full-width rows → clipped group headers.
                    domLayout={groupingEnabled ? "normal" : "autoHeight"}
                />
            </Box>
        </>
    );
}
