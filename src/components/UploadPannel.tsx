import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
    Box,
    Breadcrumbs,
    Button,
    Link,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import type { BreadcrumbSegment } from "./../common/helpers";

type UploadPannelProps = {
    uploadsEnabled: boolean;
    showBreadcrumb?: boolean;
    loading: boolean;
    segments: BreadcrumbSegment[];
    onBreadcrumbClick: (index: number) => void;
    onSelectFiles: (files: FileList | null) => void;
    onRefresh: () => void;
    children: ReactNode;
};

export default function UploadPannel({
    uploadsEnabled,
    showBreadcrumb = true,
    loading,
    segments,
    onBreadcrumbClick,
    onSelectFiles,
    onRefresh,
    children,
}: UploadPannelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            onSelectFiles(e.target.files);
            e.target.value = "";
        },
        [onSelectFiles],
    );

    const handleUploadButtonClick = useCallback(() => {
        if (!uploadsEnabled) return;
        fileInputRef.current?.click();
    }, [uploadsEnabled]);

    const handleDrop = useCallback(
        (e: DragEvent) => {
            if (!uploadsEnabled) return;
            e.preventDefault();
            setIsDragging(false);
            onSelectFiles(e.dataTransfer.files);
        },
        [onSelectFiles, uploadsEnabled],
    );

    const handleDragOver = useCallback(
        (e: DragEvent) => {
            if (!uploadsEnabled) return;
            e.preventDefault();
        },
        [uploadsEnabled],
    );

    return (
        <Box
            sx={{
                border: uploadsEnabled && isDragging ? "2px dashed" : "1px solid",
                borderColor: uploadsEnabled && isDragging ? "primary.main" : "divider",
                borderRadius: 2,
                overflow: "hidden",
            }}
            onDrop={uploadsEnabled ? handleDrop : undefined}
            onDragOver={uploadsEnabled ? handleDragOver : undefined}
            onDragEnter={uploadsEnabled ? () => setIsDragging(true) : undefined}
            onDragLeave={uploadsEnabled ? () => setIsDragging(false) : undefined}
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
                        {uploadsEnabled
                            ? "Drag & drop files here, or use the Upload button."
                            : "Upload is disabled at root level. Open a folder to upload files."}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleFileInputChange}
                    />

                    <Tooltip title="Pick files to upload">
                        <span>
                            <Button
                                variant="contained"
                                startIcon={<UploadFileIcon />}
                                onClick={handleUploadButtonClick}
                                disabled={!uploadsEnabled}
                            >
                                Upload
                            </Button>
                        </span>
                    </Tooltip>

                    <Button variant="outlined" onClick={onRefresh} disabled={loading}>
                        Refresh
                    </Button>
                </Stack>
            </Box>

            {children}
        </Box>
    );
}
