import { ListItemText, Menu, MenuItem } from "@mui/material";
import type {
    DocumentLibraryContextMenuState,
    DocumentLibraryPropertiesEditTarget,
} from "../types";

type DocumentLibraryContextMenuProps = {
    contextMenu: DocumentLibraryContextMenuState | null;
    bulkSelectedCount: number;
    onClose: () => void;
    onEditProperties: (target: DocumentLibraryPropertiesEditTarget) => void;
};

export default function DocumentLibraryContextMenu({
    contextMenu,
    bulkSelectedCount,
    onClose,
    onEditProperties,
}: DocumentLibraryContextMenuProps) {
    return (
        <Menu
            open={contextMenu !== null}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            <MenuItem
                disabled={
                    contextMenu?.target.kind === "bulk" && bulkSelectedCount === 0
                }
                onClick={() => {
                    if (contextMenu) onEditProperties(contextMenu.target);
                }}
            >
                <ListItemText
                    primary={
                        contextMenu?.target.kind === "bulk"
                            ? `Edit properties (${bulkSelectedCount} selected)`
                            : "Edit properties"
                    }
                />
            </MenuItem>
        </Menu>
    );
}
