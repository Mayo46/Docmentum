import { Box, Checkbox } from "@mui/material";
import type { ICellRendererParams } from "ag-grid-community";
import type { DocumentLibraryGridRow } from "../types";
import {
    groupSelectionCellWrapperSx,
    groupSelectionCheckboxSx,
    type DocumentLibraryGridAgContext,
} from "./GroupRowRenderer";

export default function GroupSelectionCheckbox(
    props: ICellRendererParams<DocumentLibraryGridRow> & {
        context?: DocumentLibraryGridAgContext;
    },
) {
    const row = props.data;
    if (!row || row.rowType !== "data") return null;

    const ctx = props.context;
    if (!ctx?.selectionEnabled) return null;

    const checked = ctx.isItemSelected(row.itemId);

    return (
        <Box sx={groupSelectionCellWrapperSx}>
            <Checkbox
                size="small"
                checked={checked}
                onChange={() => ctx.toggleItemSelection(row.itemId)}
                onClick={(e) => e.stopPropagation()}
                sx={groupSelectionCheckboxSx}
                inputProps={{ "aria-label": `Select ${row.name}` }}
            />
        </Box>
    );
}
