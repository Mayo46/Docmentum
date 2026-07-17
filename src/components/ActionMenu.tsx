import {
    Menu,
    MenuItem,
    ListItemText,
} from "@mui/material";
import type { DocumentLibraryGraphClient, DocumentLibraryGridRow } from "../types";
import { handleCancelCheckout, handleCheckout, handleDelete, handleFavorite } from "../actions/documentActions";
import type { OnToast } from "../types/documentLibrary";
import type { DocumentLibraryActions } from "../types/action";

type Props = {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    actions?: DocumentLibraryActions;
    selectedRows: DocumentLibraryGridRow[];
    client: DocumentLibraryGraphClient;
    onToast: OnToast;
    onRefresh: () => void;
};

export default function ActionMenu({
    anchorEl,
    open,
    onClose,
    actions,
    selectedRows,
    client,
    onToast,
    onRefresh
}: Props) {

    const menuItems = [
        {
            show: actions?.editProperties,
            label: "Edit Properties of Selected Docs",
            onClick: () => console.log("Edit Properties"),
        },
        {
            show: actions?.checkout,
            label: "Checkout Selected Docs",
            onClick: () => handleCheckout(selectedRows, client, onToast, onRefresh),
        },
        {
            show: actions?.cancelCheckout,
            label: "Cancel Checkout Selected Docs",
            onClick: () => handleCancelCheckout(selectedRows, client, onToast, onRefresh),
        },
        {
            show: actions?.delete,
            label: "Delete Selected Docs",
            onClick: () => handleDelete(selectedRows, client, onToast, onRefresh),
        },
        {
            show: actions?.export,
            label: "Export Selected Docs",
            onClick: () => console.log("Export"),
        },
        {
            show: actions?.copyUrl,
            label: "Copy URL of Selected Docs",
            onClick: () => console.log("Copy URL"),
        },
        {
            show: actions?.addToFavorites,
            label: "Add Selected Docs to Favorites",
            onClick: () => handleFavorite(selectedRows, client, onToast, onRefresh),
        },
    ];

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
        >
            {menuItems
                .filter((x) => x.show)
                .map((item) => (
                    <MenuItem
                        key={item.label}
                        onClick={() => {
                            item.onClick();
                            onClose();
                        }}
                    >
                        <ListItemText primary={item.label} />
                    </MenuItem>
                ))}
        </Menu>
    );
}