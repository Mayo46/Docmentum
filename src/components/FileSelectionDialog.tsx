import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  files: File[];
  onAddFiles: (files: FileList | File[] | null) => void;
  onRemoveFile: (index: number) => void;
  /** Cancel/abandon the upload (clears the pending selection). */
  onCancel: () => void;
  /** Advance to the Edit Properties step with the current selection. */
  onContinue: () => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

/**
 * Step 1 of the upload flow: pick the files to upload. Supports drag-and-drop and
 * browse, lists the selected files with a per-file remove action, then hands the
 * selection off to the Edit Properties drawer via `onContinue`.
 */
export default function FileSelectionDialog({
  open,
  files,
  onAddFiles,
  onRemoveFile,
  onCancel,
  onContinue,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = useCallback(() => inputRef.current?.click(), []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onAddFiles(e.target.files);
      e.target.value = "";
    },
    [onAddFiles],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      onAddFiles(e.dataTransfer.files);
    },
    [onAddFiles],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleBrowseClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      openFilePicker();
    },
    [openFilePicker],
  );

  const hasFiles = files.length > 0;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Upload documents</DialogTitle>
      <DialogContent dividers>
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onClick={openFilePicker}
          role="button"
          tabIndex={0}
          sx={{
            border: "2px dashed",
            borderColor: isDragging ? "primary.main" : "divider",
            bgcolor: isDragging ? "action.hover" : "background.default",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color .15s ease, background-color .15s ease",
          }}
        >
          <CloudUploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Drag &amp; drop files here
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            or click to browse from your computer
          </Typography>
          <Button variant="outlined" onClick={handleBrowseClick}>
            Browse files
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={handleInputChange}
          />
        </Box>

        {hasFiles ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Selected files ({files.length})
            </Typography>
            <Divider />
            <List dense sx={{ maxHeight: 260, overflow: "auto" }}>
              {files.map((file, index) => (
                <ListItem
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => onRemoveFile(index)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <InsertDriveFileOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={formatBytes(file.size)}
                    primaryTypographyProps={{ noWrap: true, title: file.name }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3, textAlign: "center" }}
          >
            No files selected yet.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onContinue} disabled={!hasFiles}>
          Go to Edit Properties
        </Button>
      </DialogActions>
    </Dialog>
  );
}
