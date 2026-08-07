import { Menu, MenuItem, ListItemText } from "@mui/material";
import type { DocumentLibraryActions } from "../types/actions";
import type {
  DocumentLibraryGraphClient,
  DocumentLibraryGridRow,
} from "../types";
import {
  handleCancelCheckout,
  handleCheckin,
  handleCheckout,
  handleCopyUrl,
  handleDelete,
  handleExport,
  handleFavorite,
  handleUnfavorite,
} from "../actions/documentActions";
import type { OnToast } from "../types/documentLibrary";

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  actions?: DocumentLibraryActions;
  selectedRows: DocumentLibraryGridRow[];
  client: DocumentLibraryGraphClient;
  onToast: OnToast;
  onRefresh: () => void;
  onEditProperties?: (itemIds: string[]) => void;
  disabled?: boolean;
  onActionLoadingChange?: (loading: boolean) => void;
  onFavorite?: (itemIds: string[]) => Promise<void>;
  onUnfavorite?: (itemIds: string[]) => Promise<void>;
};

export default function ActionMenu({
  anchorEl,
  open,
  onClose,
  actions,
  selectedRows,
  client,
  onToast,
  onRefresh,
  onEditProperties,
  disabled,
  onActionLoadingChange,
  onFavorite,
  onUnfavorite,
}: Props) {
  const selectedItemIds = selectedRows
    ?.filter((row) => row.rowType === "data")
    .map((row) => row.itemId);
  const executeAction = async (action: () => Promise<void>) => {
    try {
      onActionLoadingChange?.(true);
      await action();
    } finally {
      onActionLoadingChange?.(false);
    }
  };

  const menuItems = [
    {
      show: actions?.editDocumentProperties,
      label: "Edit Properties of Selected Docs",
      onClick: () => onEditProperties?.(selectedItemIds),
    },
    {
      show: actions?.bulkUpdateClaimIDForSelectedDocuments,
      label: "Bulk Update Claim ID of Selected Docs",
      onClick: () => console.log("Bulk Update Claim ID of Selected Docs"),
    },
    {
      show: actions?.checkinDocuments,
      label: "Checkin Selected Docs",
      onClick: () =>
        executeAction(() =>
          handleCheckin(selectedRows, client, onToast, onRefresh),
        ),
    },
    {
      show: actions?.checkoutDocuments,
      label: "Checkout Selected Docs",
      onClick: () =>
        executeAction(() =>
          handleCheckout(selectedRows, client, onToast, onRefresh),
        ),
    },
    {
      show: actions?.cancelDocumentCheckout,
      label: "Cancel Checkout Selected Docs",
      onClick: () =>
        executeAction(() =>
          handleCancelCheckout(selectedRows, client, onToast, onRefresh),
        ),
    },
    {
      show: actions?.deleteDocuments,
      label: "Delete Selected Docs",
      onClick: () =>
        executeAction(() =>
          handleDelete(selectedRows, client, onToast, onRefresh),
        ),
    },
    {
      show: actions?.exportDocuments,
      label: "Export Selected Docs",
      onClick: () => handleExport(selectedRows, client, onToast),
    },
    {
      show: actions?.copyDocumentUrls,
      label: "Copy URL of Selected Docs",
      onClick: () => handleCopyUrl(selectedRows, onToast),
    },
    {
      show: actions?.addDocumentsToFavorites,
      label: "Add Selected Docs to Favorites",
      onClick: () =>
        executeAction(() =>
          handleFavorite(selectedRows, onFavorite!, onToast, onRefresh),
        ),
    },
    {
      show: actions?.removeDocumentsToFavorites,
      label: "Remove Selected Docs to Favorites",
      onClick: () =>
        executeAction(() =>
          handleUnfavorite(selectedRows, onUnfavorite!, onToast, onRefresh),
        ),
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
            disabled={disabled}
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
