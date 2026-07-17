import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import type {
    DocumentLibraryGraphClient,
    DocumentLibraryGridRow,
    onRefresh,
} from "../types";
import type { OnToast } from "../types/documentLibrary";
import ActionMenu from "./ActionMenu";
import type { DocumentLibraryActions } from "../types/action";

interface DocumentLibraryToolbarProps {
    title?: string;
    showToolbar?: boolean;
    actions?: DocumentLibraryActions;
    selectedRows: DocumentLibraryGridRow[];
    client: DocumentLibraryGraphClient;
    onToast: OnToast;
    onRefresh: onRefresh;
}

const DocumentLibraryToolbar = ({
    title,
    showToolbar = false,
    actions,
    selectedRows,
    client,
    onToast,
    onRefresh,
}: DocumentLibraryToolbarProps) => {
    console.log("selectedRows", selectedRows);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const openActionMenu = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const closeActionMenu = () => {
        setMenuAnchor(null);
    };
    if (!showToolbar) {
        return null;
    }
    return (
        <>
            <Box
                position="sticky"
                top={0}
                zIndex={10}
                bgcolor="#fff"
                display="flex"
                alignItems="center"
                gap={1}
            >
                <IconButton
                    size="small"
                    onClick={openActionMenu}
                    onMouseEnter={openActionMenu}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="subtitle1" fontWeight={600}>
                    {title}
                </Typography>
            </Box>
            {selectedRows.length > 0 && (
                <ActionMenu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={closeActionMenu}
                    actions={actions}
                    selectedRows={selectedRows}
                    client={client}
                    onToast={onToast}
                    onRefresh={onRefresh}
                />
            )}
        </>
    );
};

export default DocumentLibraryToolbar;

