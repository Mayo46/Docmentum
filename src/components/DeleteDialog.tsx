import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import type { DocumentLibraryItemRow } from "./../types";

type DeleteDialogProps = {
    open: boolean;
    deleteTarget: DocumentLibraryItemRow | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

export default function DeleteDialog({
    open,
    deleteTarget,
    onClose,
    onConfirm,
}: DeleteDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogContent>
                <Typography>
                    {deleteTarget
                        ? `Are you sure you want to delete "${deleteTarget.fields?.Title || deleteTarget.name}"?`
                        : "Are you sure?"}
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>

                <Button onClick={onConfirm} color="error" variant="contained">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
