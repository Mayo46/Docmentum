import { useMemo } from "react";
import type { ColDef, ICellRendererParams, ValueGetterParams } from "ag-grid-community";
import { Button, Stack, Typography } from "@mui/material";
import type { DocumentLibraryColumn, DocumentLibraryGridRow, DocumentLibraryItemRow } from "../types";
import { formatDate } from "../common/helpers";
import { getCellValue } from "../utils/columns";

type UseDocumentLibraryColumnDefsParams = {
    columns: DocumentLibraryColumn[];
    groupingEnabled: boolean;
    showActions: boolean;
    navigateInto: (row: DocumentLibraryItemRow) => void;
    documentUrlFromRow: (row: DocumentLibraryItemRow) => string | undefined;
    openVersionHistory: (row: DocumentLibraryItemRow) => void;
    onDeleteRow: (row: DocumentLibraryItemRow) => void;
};

export function useDocumentLibraryColumnDefs({
    columns,
    groupingEnabled,
    showActions,
    navigateInto,
    documentUrlFromRow,
    openVersionHistory,
    onDeleteRow,
}: UseDocumentLibraryColumnDefsParams): ColDef<DocumentLibraryGridRow>[] {
    return useMemo(() => {
        const defs: ColDef<DocumentLibraryGridRow>[] = columns.map((c, colIndex) => ({
            headerName: c.headerName,
            flex: 1,
            resizable: true,
            sortable: !groupingEnabled,
            minWidth: 140,
            cellStyle: (params) => {
                const d = params.data;
                if (groupingEnabled && d?.rowType === "data" && colIndex === 0) {
                    return { paddingLeft: `${12 + d.treeLevel * 20}px` };
                }
                return undefined;
            },
            valueGetter: (params: ValueGetterParams<DocumentLibraryGridRow>) => {
                const data = params.data;
                if (!data || data.rowType === "group") return "";
                return getCellValue(data, c.key);
            },
            cellRenderer: c.useDocumentClientUrl
                ? (params: ICellRendererParams<DocumentLibraryGridRow>) => {
                      const row = params.data;
                      if (!row || row.rowType === "group") return undefined;
                      const label = String(params.value ?? "");
                      if (row.isContainer) {
                          return (
                              <Button
                                  type="button"
                                  variant="text"
                                  size="small"
                                  onClick={() => navigateInto(row)}
                                  sx={{
                                      textTransform: "none",
                                      fontWeight: 600,
                                      p: 0,
                                      minWidth: 0,
                                      justifyContent: "flex-start",
                                  }}
                              >
                                  {label}
                              </Button>
                          );
                      }
                      const url = documentUrlFromRow(row);
                      return (
                          <Stack
                              direction="row"
                              spacing={0.75}
                              useFlexGap
                              flexWrap="wrap"
                              alignItems="center"
                              sx={{ minWidth: 0 }}
                          >
                              {url ? (
                                  <a href={url} target="_blank" rel="noreferrer">
                                      {label}
                                  </a>
                              ) : (
                                  <Typography component="span" variant="body2">
                                      {label}
                                  </Typography>
                              )}
                          </Stack>
                      );
                  }
                : undefined,
            valueFormatter: (params) => {
                const kind = c.kind ?? "text";
                if (kind === "date") return formatDate(params.value);
                if (kind === "number") {
                    return params.value === "" || params.value === null || params.value === undefined
                        ? ""
                        : String(params.value);
                }
                if (kind === "user") return params.value ? String(params.value) : "";
                return params.value ? String(params.value) : "";
            },
        }));

        if (showActions) {
            defs.push({
                headerName: "Actions",
                flex: 0.9,
                minWidth: 180,
                sortable: false,
                resizable: false,
                pinned: "left",
                lockPinned: true,
                cellRenderer: (params: ICellRendererParams<DocumentLibraryGridRow>) => {
                    const row = params.data;
                    if (!row || row.rowType === "group") return undefined;
                    return (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                            {!row.isContainer ? (
                                <Button size="small" onClick={() => openVersionHistory(row)}>
                                    Versions
                                </Button>
                            ) : null}
                            <Button size="small" color="error" onClick={() => onDeleteRow(row)}>
                                Delete
                            </Button>
                        </Stack>
                    );
                },
            });
        }

        return defs;
    }, [
        columns,
        groupingEnabled,
        showActions,
        navigateInto,
        documentUrlFromRow,
        openVersionHistory,
        onDeleteRow,
    ]);
}
