import { useCallback, useState } from "react";
import type { DragEvent, MouseEvent, ReactNode } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckIcon from "@mui/icons-material/Check";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Box,
  Breadcrumbs,
  Button,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { BreadcrumbSegment } from "./../common/helpers";

export type GroupByMenuOption = {
  key: string,
  headerName: string;
};

type UploadPannelProps = {
  uploadsEnabled: boolean;
  showBreadcrumb?: boolean;
  showUploadControls?: boolean;
  loading: boolean;
  segments: BreadcrumbSegment[];
  onBreadcrumbClick: (index: number) => void;
  /** Files dropped directly onto the panel; opens the file-selection dialog pre-filled. */
  onSelectFiles: (files: FileList | null) => void;
  /** Opens the file-selection dialog (Step 1 of the upload flow). */
  onImportClick: () => void;
  onRefresh: () => void;
  /** Group-by dropdown: columns from grid props (or defaults); null = no grouping. */
  groupByMenu?: {
    columns: GroupByMenuOption[];
    selectedKey: string | null;
    onChange: (key: string | null) => void;
  };
  children: ReactNode;
};

export default function UploadPannel({
  uploadsEnabled,
  showBreadcrumb = true,
  showUploadControls = true,
  loading,
  segments,
  onBreadcrumbClick,
  onSelectFiles,
  onImportClick,
  onRefresh,
  groupByMenu,
  children,
}: UploadPannelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [groupMenuAnchor, setGroupMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const uploadControlsEnabled = uploadsEnabled && showUploadControls;
  const openGroupMenu = useCallback((e: MouseEvent<HTMLElement>) => {
    setGroupMenuAnchor(e.currentTarget);
  }, []);
  const closeGroupMenu = useCallback(() => setGroupMenuAnchor(null), []);

  const handleImportClick = useCallback(() => {
    if (!uploadControlsEnabled) return;
    onImportClick();
  }, [uploadControlsEnabled, onImportClick]);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      if (!uploadControlsEnabled) return;
      e.preventDefault();
      setIsDragging(false);
      onSelectFiles(e.dataTransfer.files);
    },
    [onSelectFiles, uploadControlsEnabled],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      if (!uploadControlsEnabled) return;
      e.preventDefault();
    },
    [uploadControlsEnabled],
  );

  return (
    <Box
      sx={{
        border:
          uploadControlsEnabled && isDragging ? "2px dashed" : "1px solid",
        borderColor:
          uploadControlsEnabled && isDragging ? "primary.main" : "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
      onDrop={uploadControlsEnabled ? handleDrop : undefined}
      onDragOver={uploadControlsEnabled ? handleDragOver : undefined}
      onDragEnter={
        uploadControlsEnabled ? () => setIsDragging(true) : undefined
      }
      onDragLeave={
        uploadControlsEnabled ? () => setIsDragging(false) : undefined
      }
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          p: 2,
          alignItems: "center",
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1, pr: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Documents
          </Typography>
          {showBreadcrumb ? (
            <Breadcrumbs sx={{ mt: 0.5, mb: 0.5 }} aria-label="Folder path">
              {segments.map((seg, index) => {
                const isLast = index === segments.length - 1;
                const key = `${seg.id ?? "root"}-${index}`;
                if (isLast) {
                  return (
                    <Typography
                      key={key}
                      color="text.primary"
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      {seg.name}
                    </Typography>
                  );
                }
                return (
                  <Link
                    key={key}
                    component="button"
                    type="button"
                    variant="body2"
                    underline="hover"
                    color="inherit"
                    onClick={() => onBreadcrumbClick(index)}
                    sx={{ cursor: "pointer" }}
                  >
                    {seg.name}
                  </Link>
                );
              })}
            </Breadcrumbs>
          ) : null}

          <Typography variant="body2" color="text.secondary">
            {uploadControlsEnabled
              ? "Drag & drop files here, or use the Upload button."
              : uploadsEnabled
                ? ""
                : "Upload is disabled at root level. Open a folder to upload files."}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems={"center"}>
          {showUploadControls ? (
            <Tooltip title="Pick files to upload">
              <span>
                <Button
                  variant="contained"
                  startIcon={<UploadFileIcon />}
                  onClick={handleImportClick}
                  disabled={!uploadsEnabled}
                >
                  Import Docs
                </Button>
              </span>
            </Tooltip>
          ) : null}

          {groupByMenu ? (
            <>
              <Tooltip title="Group by column">
                <IconButton
                  color={groupByMenu.selectedKey ? "primary" : "default"}
                  aria-label="Group by column"
                  aria-controls={groupMenuAnchor ? "group-by-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={groupMenuAnchor ? "true" : undefined}
                  onClick={openGroupMenu}
                  disabled={loading}
                  sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Menu
                id="group-by-menu"
                anchorEl={groupMenuAnchor}
                open={Boolean(groupMenuAnchor)}
                onClose={closeGroupMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    groupByMenu.onChange(null);
                    closeGroupMenu();
                  }}
                  selected={groupByMenu.selectedKey === null}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {groupByMenu.selectedKey === null ? (
                      <CheckIcon fontSize="small" />
                    ) : null}
                  </ListItemIcon>
                  <ListItemText primary="No grouping" />
                </MenuItem>
                {groupByMenu.columns.map((col) => (
                  <MenuItem
                    key={col.key}
                    onClick={() => {
                      groupByMenu.onChange(col.key);
                      closeGroupMenu();
                    }}
                    selected={groupByMenu.selectedKey === col.key}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {groupByMenu.selectedKey === col.key ? (
                        <CheckIcon fontSize="small" />
                      ) : null}
                    </ListItemIcon>
                    <ListItemText primary={col.headerName || col.key} />
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : null}

          <Button variant="outlined" onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
        </Stack>
      </Box>

      {children}
    </Box>
  );
}
