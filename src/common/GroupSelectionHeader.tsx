import { Box, Checkbox } from "@mui/material";
import type { IHeaderParams } from "ag-grid-community";
import type { DocumentLibraryGridRow } from "../types";
import {
    groupSelectionCellWrapperSx,
    groupSelectionCheckboxSx,
    type DocumentLibraryGridAgContext,
} from "./GroupRowRenderer";

export default function GroupSelectionHeader(
    params: IHeaderParams<DocumentLibraryGridRow, DocumentLibraryGridAgContext>,
) {
    const ctx = params.context;
    const allSelected = ctx?.areAllItemsSelected?.() ?? false;
    const someSelected = ctx?.areSomeItemsSelected?.() ?? false;

    return (
        <Box sx={groupSelectionCellWrapperSx}>
            <Checkbox
                size="small"
                indeterminate={someSelected && !allSelected}
                checked={allSelected}
                disabled={!ctx?.selectionEnabled}
                onChange={() => ctx?.toggleSelectAllItems?.()}
                sx={groupSelectionCheckboxSx}
                inputProps={{ "aria-label": "Select all rows" }}
            />
        </Box>
    );
}
