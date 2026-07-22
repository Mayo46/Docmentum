import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import type { DocumentLibraryActions } from "../types/actions";
import type {
  DocumentLibraryGraphClient,
  DocumentLibraryGridRow,
  OnRefresh,
} from "../types";
import type { OnToast } from "../types/documentLibrary";
import ActionMenu from "./ActionMenu";

interface DocumentLibraryToolbarProps {
  title?: string;
  showToolbar?: boolean;
  actions?: DocumentLibraryActions;
  selectedRows: DocumentLibraryGridRow[];
  client: DocumentLibraryGraphClient;
  onToast: OnToast;
  onRefresh: OnRefresh;
  onEditProperties?: (itemIds: string []) => void; 
  onActionLoadingChange?: (loading: boolean) => void;
}

const DocumentLibraryToolbar = ({
  title,
  showToolbar = false,
  actions,
  selectedRows,
  client,
  onToast,
  onRefresh,
  onEditProperties,
  onActionLoadingChange,
}: DocumentLibraryToolbarProps) => {
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
        <ActionMenu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeActionMenu}
          actions={actions}
          selectedRows={selectedRows}
          client={client}
          onToast={onToast}
          onRefresh={onRefresh}
          onEditProperties={onEditProperties}
          disabled={selectedRows.length === 0}
          onActionLoadingChange={onActionLoadingChange}
        />
    </>
  );
};

export default DocumentLibraryToolbar;
