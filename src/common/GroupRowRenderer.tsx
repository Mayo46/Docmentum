import type { ICellRendererParams } from "ag-grid-community";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, IconButton, Typography } from "@mui/material";
import type { DocumentLibraryGridRow } from "../types";

export type DocumentLibraryGridAgContext = {
    toggleGroupId: (id: string) => void;
};

export default function GroupRowRenderer(
    props: ICellRendererParams<DocumentLibraryGridRow, DocumentLibraryGridAgContext>,
) {
    const data = props.data;
    if (!data || data.rowType !== "group") return null;

    const toggle = props.context?.toggleGroupId;
    const levelPad = 8 + data.level * 12;
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                pr: 1.5,
                pl: `${levelPad}px`,
                bgcolor: (theme) =>
                    theme.palette.mode === "light" ? "grey.100" : "action.hover",
                borderBottom: 1,
                borderColor: "divider",
                boxShadow: (theme) =>
                    `inset 3px 0 0 0 ${theme.palette.primary.main}`,
            }}
        >
            <IconButton
                size="small"
                aria-label={data.expanded ? "Collapse group" : "Expand group"}
                onClick={() => toggle?.(data.id)}
                sx={{
                    mr: 0.5,
                    flexShrink: 0,
                    alignSelf: "center",
                    p: 0.25,
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
    );
}
