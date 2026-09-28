import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import type { DocumentLibraryItemRow } from "./../types";

type DeleteDialogProps = {
    open: boolean;
    documents: DocumentLibraryItemRow[];
    skippedDocuments?: DocumentLibraryItemRow[];
    skippedCheckedOutDocuments?: DocumentLibraryItemRow[];
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

function documentLabel(row: DocumentLibraryItemRow) {
    const title = row.fields?.Title;
    if (typeof title === "string" && title.trim()) return title;
    return row.name;
}

export default function DeleteDialog({
    open,
    documents,
    skippedDocuments = [],
    skippedCheckedOutDocuments = [],
    onClose,
    onConfirm,
}: DeleteDialogProps) {
    const count = documents.length;
    const heading =
        count === 1
            ? `Are you sure you want to delete "${documentLabel(documents[0])}"?`
            : `Are you sure you want to delete ${count} documents?`;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {count === 1 ? "Delete document?" : "Delete documents?"}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    {count > 0 ? (
                        <Typography>{heading}</Typography>
                    ) : (
                        <Typography>No documents can be deleted.</Typography>
                    )}
                    {count > 1 ? (
                        <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                            {documents.map((row) => (
                                <Typography
                                    key={row.itemId}
                                    component="li"
                                    variant="body2"
                                >
                                    {documentLabel(row)}
                                </Typography>
                            ))}
                        </Stack>
                    ) : null}
                    {skippedDocuments.length > 0 ? (
                        <Stack spacing={1}>
                            <Typography color="text.secondary" variant="body2">
                                These documents will not be deleted because you
                                did not import them:
                            </Typography>
                            <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                                {skippedDocuments.map((row) => (
                                    <Typography
                                        key={row.itemId}
                                        component="li"
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {documentLabel(row)}
                                    </Typography>
                                ))}
                            </Stack>
                        </Stack>
                    ) : null}
                    {skippedCheckedOutDocuments.length > 0 ? (
                        <Stack spacing={1}>
                            <Typography color="text.secondary" variant="body2">
                                These documents will not be deleted because they
                                are checked out by another user:
                            </Typography>
                            <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                                {skippedCheckedOutDocuments.map((row) => (
                                    <Typography
                                        key={row.itemId}
                                        component="li"
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {documentLabel(row)}
                                    </Typography>
                                ))}
                            </Stack>
                        </Stack>
                    ) : null}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>

                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={count === 0}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
