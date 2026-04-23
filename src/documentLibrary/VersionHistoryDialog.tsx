import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type {
  DocumentLibraryGraphClient,
  DocumentLibraryVersion,
} from "./types";

type Props = {
  open: boolean;
  itemId: string | null;
  itemName?: string;
  client: DocumentLibraryGraphClient;
  onClose: () => void;
  /** Called after a successful restore so the parent grid can refresh. */
  onRestored: () => void;
};

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function formatIdentityDisplay(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const user = o.user as Record<string, unknown> | undefined;
  const app = o.application as Record<string, unknown> | undefined;
  const u =
    (typeof user?.displayName === "string" && user.displayName) ||
    (typeof app?.displayName === "string" && app.displayName);
  return u || undefined;
}

export default function VersionHistoryDialog(props: Props) {
  const { open, itemId, client, onClose, onRestored } = props;
  const [versions, setVersions] = useState<DocumentLibraryVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  useEffect(() => {
    if (!open || !itemId) return;
    setRestoreSuccess(false);
    setLoading(true);
    setError(null);
    client
      .listVersions({ itemId })
      .then((v) => setVersions(v))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load versions"),
      )
      .finally(() => setLoading(false));
  }, [open, itemId, client]);

  const title = useMemo(() => {
    const name = props.itemName ? `: ${props.itemName}` : "";
    return `Version history${name}`;
  }, [props.itemName]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {restoreSuccess ? (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setRestoreSuccess(false)}
          >
            Version restored. The document in the library is now this version.
          </Alert>
        ) : null}

        {loading ? (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 2 }}>
            <CircularProgress size={24} />
            <Typography>Loading versions...</Typography>
          </Stack>
        ) : error ? (
          <Typography color="error" sx={{ py: 2 }}>
            {error}
          </Typography>
        ) : versions.length === 0 ? (
          <Typography sx={{ py: 2 }}>No versions found.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, py: 1 }}>
            {versions.map((v, index) => (
              <Box
                key={v.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  p: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {v.comment
                      ? v.comment
                      : `Version ${versions.length - index}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Modified:{" "}
                    {formatDate(
                      v.lastModifiedDateTime ?? v.createdDateTime,
                    ) || "—"}
                  </Typography>
                  {formatIdentityDisplay(v.lastModifiedBy) ? (
                    <Typography variant="body2" color="text.secondary">
                      By: {formatIdentityDisplay(v.lastModifiedBy)}
                    </Typography>
                  ) : null}
                  {v.size != null ? (
                    <Typography variant="body2" color="text.secondary">
                      Size: {v.size.toLocaleString()} bytes
                    </Typography>
                  ) : null}
                </Box>
                <Tooltip title="Replace the current file in the library with this version">
                  <span>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={restoringId === v.id}
                      onClick={() => {
                        setRestoringId(v.id);
                        setError(null);
                        client
                          .restoreVersion({ itemId: itemId!, versionId: v.id })
                          .then(() => {
                            onRestored();
                            setRestoreSuccess(true);
                            return client.listVersions({ itemId: itemId! });
                          })
                          .then((next) => setVersions(next))
                          .catch((e) =>
                            setError(
                              e instanceof Error ? e.message : "Restore failed",
                            ),
                          )
                          .finally(() => setRestoringId(null));
                      }}
                    >
                      {restoringId === v.id ? "Restoring..." : "Restore"}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
