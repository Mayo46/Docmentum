import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Checkbox, Tooltip } from "@mui/material";
import type { ICellRendererParams } from "ag-grid-community";
import type { DocumentLibraryGridRow } from "../types";
import {
  CHECKOUT_LOCK_SLOT_PX,
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
  const isCheckedOut = Boolean(row.checkoutUserId);

  const checkoutUser =
    typeof row.fields?.CheckoutUser === "string" ? row.fields.CheckoutUser : "";

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
      <Box
        sx={{
          width: CHECKOUT_LOCK_SLOT_PX,
          height: CHECKOUT_LOCK_SLOT_PX,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isCheckedOut ? (
          <Tooltip
            title={
              checkoutUser
                ? `Checked out by ${checkoutUser}`
                : "Document is checked out"
            }
          >
            <LockOutlinedIcon
              sx={{
                fontSize: 16,
                color: "text.secondary",
              }}
            />
          </Tooltip>
        ) : null}
      </Box>
    </Box>
  );
}
