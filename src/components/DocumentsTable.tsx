import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { Alert, Box, CircularProgress } from "@mui/material";
import type { DocumentLibraryItemRow } from "./../types";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);

type DocumentsTableProps = {
    rows: DocumentLibraryItemRow[];
    columnDefs: ColDef<DocumentLibraryItemRow>[];
    loading: boolean;
    error: string | null;
};

export default function DocumentsTable({
    rows,
    columnDefs,
    loading,
    error,
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

            <Box className="ag-theme-alpine" sx={{ width: "100%", height: 520 }}>
                <AgGridReact<DocumentLibraryItemRow>
                    rowData={rows}
                    columnDefs={columnDefs}
                    defaultColDef={{
                        tooltipValueGetter: (p) => (p.value ? String(p.value) : ""),
                    }}
                    suppressRowClickSelection
                    domLayout="autoHeight"
                />
            </Box>
        </>
    );
}
