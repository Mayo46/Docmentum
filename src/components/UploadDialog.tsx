import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { DocumentLibraryUploadColumn, UploadFailure } from './../types'

type Props = {
  open: boolean
  files: File[]
  uploadColumns: DocumentLibraryUploadColumn[]
  initialProperties?: Record<string, unknown>
  initialContentType?: string
  onClose: () => void
  onUpload: (params: {
    files: File[]
    contentType: string
    properties: Record<string, unknown>
  }) => Promise<{ uploadedItemIds: string[]; failures: UploadFailure[] }>
}

export default function UploadDialog(props: Props) {
  const {
    open,
    files,
    uploadColumns,
    initialProperties,
    initialContentType,
    onClose,
    onUpload,
  } = props

  const [contentType, setContentType] = useState(initialContentType ?? 'document')
  const [values, setValues] = useState<Record<string, unknown>>(initialProperties ?? {})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setContentType(initialContentType ?? 'document')
    setValues(initialProperties ?? {})
    setError(null)
    setSubmitting(false)
  }, [open, initialProperties, initialContentType])

  const fileSummary = useMemo(() => {
    if (!files.length) return ''
    if (files.length === 1) return files[0].name
    return `${files.length} files selected`
  }, [files])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload documents</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {fileSummary}
          </Typography>

          <FormControl fullWidth>
            <InputLabel id="content-type-label">Content type</InputLabel>
            <Select
              labelId="content-type-label"
              value={contentType}
              label="Content type"
              onChange={(e) => setContentType(String(e.target.value))}
              disabled
            >
              <MenuItem value="document">document</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {uploadColumns.map((c) => (
              <TextField
                key={c.key}
                label={c.label}
                value={values[c.key] === undefined || values[c.key] === null ? '' : String(values[c.key])}
                type={c.inputType === 'number' ? 'number' : c.inputType === 'date' ? 'date' : 'text'}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => {
                  const next = e.target.value
                  setValues((prev) => ({
                    ...prev,
                    [c.key]: next,
                  }))
                }}
                size="small"
              />
            ))}
          </Box>

          {error ? (
            <Typography color="error" sx={{ whiteSpace: 'pre-wrap' }}>
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={async () => {
            setSubmitting(true)
            setError(null)
            try {
              const result = await onUpload({
                files,
                contentType,
                properties: values,
              })

              // Keep dialog open if only some files failed; grid will toast.
              if (result.failures.length === 0) onClose()
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Upload failed')
            } finally {
              setSubmitting(false)
            }
          }}
          variant="contained"
          disabled={submitting || files.length === 0}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  )
}

