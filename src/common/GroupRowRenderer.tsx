import type { MouseEvent } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Checkbox, IconButton, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { DocumentLibraryGridRow } from "../types";

export const GROUP_SELECTION_COL_ID = "groupSelection";
export const GROUP_SELECTION_COL_WIDTH = 56;

export const groupSelectionCellWrapperSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    overflow: "visible",
    boxSizing: "border-box",
};

export const groupSelectionCheckboxSx: SxProps<Theme> = {
    p: 0.75,
    m: 0,
    flexShrink: 0,
    "& .MuiSvgIcon-root": {
        fontSize: 20,
    },
};

export type DocumentLibraryGridAgContext = {
    toggleGroupId: (id: string) => void;
    onGroupContextMenu?: (event: MouseEvent, groupId: string) => void;
    canEditProperties?: boolean;
    selectionEnabled?: boolean;
    isItemSelected?: (itemId: string) => boolean;
    toggleItemSelection?: (itemId: string) => void;
    isGroupFullySelected?: (groupId: string) => boolean;
    isGroupPartiallySelected?: (groupId: string) => boolean;
    toggleGroupSelection?: (groupId: string) => void;
    areAllItemsSelected?: () => boolean;
    areSomeItemsSelected?: () => boolean;
    toggleSelectAllItems?: () => void;
    /** Bumped when selection changes so the grid can refresh checkbox cells. */
    selectionRevision?: number;
    /** Width reserved for pinned Actions column so group controls align with data rows. */
    groupActionsColumnWidth?: number;
};

export default function GroupRowRenderer(
    props: ICellRendererParams<DocumentLibraryGridRow, DocumentLibraryGridAgContext>,
) {
    const data = props.data;
    if (!data || data.rowType !== "group") return null;

    const toggle = props.context?.toggleGroupId;
    const selectionEnabled = props.context?.selectionEnabled;
    // selectionRevision keeps this renderer in sync when row checkboxes change.
    void props.context?.selectionRevision;
    const fullySelected = selectionEnabled
        ? (props.context?.isGroupFullySelected?.(data.id) ?? false)
        : false;
    const partiallySelected = selectionEnabled
        ? (props.context?.isGroupPartiallySelected?.(data.id) ?? false)
        : false;
    const levelPad = 12 + data.level * 20;
    const actionsColWidth = props.context?.groupActionsColumnWidth ?? 0;
    const onContextMenu =
        props.context?.canEditProperties && props.context?.onGroupContextMenu
            ? (e: MouseEvent) => {
                e.preventDefault();
                props.context?.onGroupContextMenu?.(e, data.id);
            }
            : undefined;

    return (
        <Box
            onContextMenu={onContextMenu}
            sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                pr: 1.5,
                bgcolor: (theme) =>
                    theme.palette.mode === "light" ? "grey.100" : "action.hover",
                borderBottom: 1,
                borderColor: "divider",
                boxShadow: (theme) =>
                    `inset 3px 0 0 0 ${theme.palette.primary.main}`,
            }}
        >
            {selectionEnabled ? (
                <Box
                    sx={{
                        width: GROUP_SELECTION_COL_WIDTH,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                        px: "4px",
                    }}
                >
                    <Checkbox
                        size="small"
                        checked={fullySelected}
                        indeterminate={partiallySelected}
                        onChange={() => props.context?.toggleGroupSelection?.(data.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={groupSelectionCheckboxSx}
                        inputProps={{
                            "aria-label": `Select all items in ${data.fieldHeaderName}: ${data.groupValue}`,
                        }}
                    />
                </Box>
            ) : null}
            {actionsColWidth > 0 ? (
                <Box sx={{ width: actionsColWidth, flexShrink: 0 }} aria-hidden />
            ) : null}
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    pl: `${levelPad}px`,
                }}
            >
                <IconButton
                    size="small"
                    aria-label={data.expanded ? "Collapse group" : "Expand group"}
                    onClick={() => toggle?.(data.id)}
                    sx={{
                        flexShrink: 0,
                        alignSelf: "center",
                        width: 32,
                        height: 32,
                        color: "text.secondary",
                        "&:hover": { bgcolor: "action.selected" },
                    }}
                >
                    {data.expanded ? (
                        <ExpandMoreIcon sx={{ fontSize: 20, display: "block" }} />
                    ) : (
                        <ChevronRightIcon sx={{ fontSize: 20, display: "block" }} />
                    )}
                </IconButton>
                <Typography
                    component="div"
                    variant="body2"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        lineHeight: 1.35,
                        letterSpacing: "0.01em",
                        wordBreak: "break-word",
                        alignSelf: "center",
                    }}
                >
                    {data.fieldHeaderName}: {data.groupValue}{" "}
                    <Typography component="span" variant="body2" color="text.secondary" fontWeight={600}>
                        ({data.childCount})
                    </Typography>
                </Typography>
            </Box>
        </Box>
    );
}
