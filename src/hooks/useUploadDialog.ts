import { useCallback, useState } from "react";

/** Stable-ish identity for a File used to de-duplicate the pending selection. */
function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

/**
 * State for the two-step upload flow's first step: the file-selection dialog.
 *
 * Owns the pending file list and the dialog's open state. Transitions to/from the
 * Edit Properties drawer are wired by the consumer:
 * - `hideDialog` closes the dialog but keeps the files (used when advancing to Edit
 *   Properties, so the user can navigate back to the same selection).
 * - `closeDialog` closes and clears the files (used when cancelling/abandoning).
 * - `reopenDialog` re-opens the dialog without touching the files (used for "Back").
 */
export function useUploadDialog() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const openDialog = useCallback((initial: File[] = []) => {
    setFiles(initial);
    setOpen(true);
  }, []);

  const reopenDialog = useCallback(() => setOpen(true), []);

  const addFiles = useCallback((incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    if (arr.length === 0) return;
    setFiles((prev) => {
      const seen = new Set(prev.map(fileKey));
      const merged = [...prev];
      for (const file of arr) {
        const key = fileKey(file);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(file);
        }
      }
      return merged;
    });
  }, []);

  const removeFileAt = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /** Close but keep the pending files (advancing to Edit Properties). */
  const hideDialog = useCallback(() => setOpen(false), []);

  /** Close and clear the pending files (cancel / abandon). */
  const closeDialog = useCallback(() => {
    setOpen(false);
    setFiles([]);
  }, []);

  return {
    open,
    files,
    openDialog,
    reopenDialog,
    addFiles,
    removeFileAt,
    hideDialog,
    closeDialog,
  };
}
