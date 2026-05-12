import { AgGridReact } from "ag-grid-react";
import type { ColDef, GetRowIdParams, IsFullWidthRowParams, RowHeightParams } from "ag-grid-community";
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
};

export default function DocumentsTable({
    rows,
    columnDefs,
    loading,
    error,
    groupingEnabled = false,
    gridContext,
}: DocumentsTableProps) {
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
                }}
            >
                <AgGridReact<DocumentLibraryGridRow>
                    rowData={rows}
                    columnDefs={columnDefs}
                    context={gridContext}
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
                    fullWidthCellRenderer={groupingEnabled ? GroupRowRenderer : undefined}
                    getRowHeight={(p: RowHeightParams<DocumentLibraryGridRow>) => {
                        if (p.data?.rowType === "group") return 44;
                        return undefined;
                    }}
                    suppressRowClickSelection
                    // autoHeight ignores fixed row heights for full-width rows → clipped group headers.
                    domLayout={groupingEnabled ? "normal" : "autoHeight"}
                />
            </Box>
        </>
    );
}
