import { useMemo } from "react";

import type {
  CellClassParams,
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
  ValueGetterParams,
} from "ag-grid-community";

import { Button, Stack, Typography } from "@mui/material";

import type {
  DocumentLibraryColumn,
  DocumentLibraryGridRow,
  DocumentLibraryItemRow,
} from "../types";

import GroupSelectionCheckbox from "../common/GroupSelectionCheckbox";
import GroupSelectionHeader from "../common/GroupSelectionHeader";

import {
  GROUP_SELECTION_COL_ID,
  GROUP_SELECTION_COL_WIDTH,
} from "../common/GroupRowRenderer";

import { getCellValue } from "../utils/columns";

import moment from "moment";

import type { ParentReference } from "./useDocumentLibraryNavigation";

const SELECTION_CELL_CLASS = "doc-library-selection-cell";

const CLAIM_ID_KEYS = new Set([
  "claimid",
  "claimidowstext",
]);

type UseDocumentLibraryColumnDefsParams = {
  columns: DocumentLibraryColumn[];
  groupingEnabled: boolean;
  showRowCheckbox: boolean;
  showActions: boolean;
  navigateInto: (row: DocumentLibraryItemRow) => void;
  documentUrlFromRow: (
    row: DocumentLibraryItemRow,
  ) => string | undefined;
  openVersionHistory: (row: DocumentLibraryItemRow) => void;
  onDeleteRow: (row: DocumentLibraryItemRow) => void;
  navigateToParent: (
    parent: ParentReference,
  ) => void | Promise<void>;
};

function isClaimIdColumn(key: string): boolean {
  const normalizedKey = key
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  return CLAIM_ID_KEYS.has(normalizedKey);
}

export function useDocumentLibraryColumnDefs({
  columns,
  groupingEnabled,
  showRowCheckbox,
  showActions,
  navigateInto,
  documentUrlFromRow,
  openVersionHistory,
  onDeleteRow,
  navigateToParent,
}: UseDocumentLibraryColumnDefsParams): ColDef<DocumentLibraryGridRow>[] {
  return useMemo(() => {
    const defs: ColDef<DocumentLibraryGridRow>[] = [];

    const showSelectionColumn =
      groupingEnabled || showRowCheckbox;

    const actionsColDef: ColDef<DocumentLibraryGridRow> = {
      headerName: "Actions",
      flex: 0.9,
      minWidth: 180,
      sortable: false,
      resizable: false,
      pinned: "left",
      lockPinned: true,
      cellStyle: groupingEnabled
        ? {
          paddingLeft: "12px",
          paddingRight: "8px",
        }
        : undefined,
      cellRenderer: (
        params: ICellRendererParams<DocumentLibraryGridRow>,
      ) => {
        const row = params.data;

        if (!row || row.rowType === "group") {
          return undefined;
        }

        return (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {!row.isContainer ? (
              <Button
                size="small"
                onClick={() => openVersionHistory(row)}
              >
                Versions
              </Button>
            ) : null}

            <Button
              size="small"
              color="error"
              onClick={() => onDeleteRow(row)}
            >
              Delete
            </Button>
          </Stack>
        );
      },
    };

    if (showSelectionColumn) {
      defs.push({
        colId: GROUP_SELECTION_COL_ID,
        headerName: "",
        headerComponent: GroupSelectionHeader,
        headerClass: SELECTION_CELL_CLASS,
        cellClass: SELECTION_CELL_CLASS,
        width: GROUP_SELECTION_COL_WIDTH,
        minWidth: GROUP_SELECTION_COL_WIDTH,
        maxWidth: GROUP_SELECTION_COL_WIDTH,
        flex: 0,
        resizable: false,
        sortable: false,
        pinned: "left",
        lockPinned: true,
        suppressMovable: true,
        suppressHeaderMenuButton: true,
        suppressHeaderFilterButton: true,
        cellRenderer: GroupSelectionCheckbox,
      });

      if (showActions) {
        defs.push(actionsColDef);
      }
    }

    const treeIndentColIndex = 0;

    defs.push(
      ...columns.map((c, colIndex) => ({
        headerName: c.headerName,
        flex: 1,
        resizable: true,
        sortable: !groupingEnabled,
        minWidth: 140,

        cellStyle: (
          params: CellClassParams<DocumentLibraryGridRow>,
        ) => {
          const row = params.data;

          if (
            groupingEnabled &&
            row?.rowType === "data" &&
            colIndex === treeIndentColIndex
          ) {
            return {
              paddingLeft: `${12 + row.treeLevel * 20}px`,
            };
          }

          return undefined;
        },

        valueGetter: (
          params: ValueGetterParams<DocumentLibraryGridRow>,
        ) => {
          const data = params.data;

          if (!data || data.rowType === "group") {
            return "";
          }

          return getCellValue(data, c.key);
        },

        cellRenderer: isClaimIdColumn(c.key)
          ? (
            params: ICellRendererParams<DocumentLibraryGridRow>,
          ) => {
            // debugger
            const row = params.data;

            if (!row || row.rowType === "group") {
              return undefined;
            }

            const label = String(params.value ?? "");
            const parent = row.parentReference;

            if (!parent?.itemId) {
              return (
                <Typography
                  component="span"
                  variant="body2"
                >
                  {label}
                </Typography>
              );
            }

            return (
              <Button
                type="button"
                variant="text"
                size="small"
                onClick={() => {
                  void navigateToParent(parent);
                }}
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
          : c.useDocumentClientUrl
            ? (
              params: ICellRendererParams<DocumentLibraryGridRow>,
            ) => {
              const row = params.data;

              if (!row || row.rowType === "group") {
                return undefined;
              }

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
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {label}
                    </a>
                  ) : (
                      <Typography
                        component="span"
                        variant="body2"
                      >
                      {label}
                    </Typography>
                  )}
                </Stack>
              );
            }
            : undefined,

        valueFormatter: (
          params: ValueFormatterParams<DocumentLibraryGridRow>,
        ) => {
          const kind = c.kind ?? "text";

          if (kind === "date") {
            if (!params.value) {
              return "";
            }

            return moment(params.value).format("MM/DD/YYYY");
          }

          if (kind === "number") {
            return params.value === "" ||
              params.value === null ||
              params.value === undefined
              ? ""
              : String(params.value);
          }

          if (kind === "user") {
            return params.value
              ? String(params.value)
              : "";
          }

          return params.value
            ? String(params.value)
            : "";
        },
      })),
    );

    if (showActions && !showSelectionColumn) {
      defs.push(actionsColDef);
    }

    return defs;
  }, [
    columns,
    groupingEnabled,
    showRowCheckbox,
    showActions,
    navigateInto,
    navigateToParent,
    documentUrlFromRow,
    openVersionHistory,
    onDeleteRow,
  ]);
}