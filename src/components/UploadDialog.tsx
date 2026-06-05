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
import type {
  DocumentLibraryFieldDefinition,
  DocumentLibraryUploadColumn,
  UploadFailure,
} from './../types'
import PropertiesFormFields, {
  buildInitialFormValues,
  formValuesToPatchPayload,
  type PropertyFormValues,
} from './PropertiesFormFields'
import { filterFieldDefinitionsForUpload } from '../utils/fieldDefinitions'

type Props = {
  open: boolean
  files: File[]
  /** Legacy static fields when `fieldDefinitions` is not used. */
  uploadColumns?: DocumentLibraryUploadColumn[]
  fieldDefinitions?: DocumentLibraryFieldDefinition[]
  definitionsLoading?: boolean
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
    uploadColumns = [],
    fieldDefinitions = [],
    definitionsLoading = false,
    initialProperties,
    initialContentType,
    onClose,
    onUpload,
  } = props

  const uploadFieldDefinitions = useMemo(
    () => filterFieldDefinitionsForUpload(fieldDefinitions),
    [fieldDefinitions],
  )
  const useDynamicFields = uploadFieldDefinitions.length > 0
  const fieldDefinitionsKey = useMemo(
    () => uploadFieldDefinitions.map((d) => d.key).join('|'),
    [uploadFieldDefinitions],
  )

  const [contentType, setContentType] = useState(initialContentType ?? 'document')
  const [legacyValues, setLegacyValues] = useState<Record<string, unknown>>(initialProperties ?? {})
  const [dynamicValues, setDynamicValues] = useState<PropertyFormValues>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setContentType(initialContentType ?? 'document')
    setLegacyValues(initialProperties ?? {})
    setDynamicValues(
      buildInitialFormValues(uploadFieldDefinitions, initialProperties),
    )
    setError(null)
    setSubmitting(false)
  }, [open, initialProperties, initialContentType, fieldDefinitionsKey])

  const fileSummary = useMemo(() => {
    if (!files.length) return ''
    if (files.length === 1) return files[0].name
    return `${files.length} files selected`
  }, [files])

  const resolvedProperties = useMemo(() => {
    if (useDynamicFields) {
      return formValuesToPatchPayload(uploadFieldDefinitions, dynamicValues)
    }
    return legacyValues
  }, [useDynamicFields, uploadFieldDefinitions, dynamicValues, legacyValues])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload Documents</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="content-type-label">Content type</InputLabel>
            <Select
              labelId="content-type-label"
              value={contentType}
              label="Content type"
              onChange={(e) => setContentType(String(e.target.value))}
              disabled
            >
              <MenuItem value="document">Document</MenuItem>
            </Select>
          </FormControl>

          {definitionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={28} />
            </Box>
          ) : useDynamicFields ? (
            <PropertiesFormFields
              definitions={uploadFieldDefinitions}
              values={dynamicValues}
              onChange={setDynamicValues}
              disabled={submitting}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {uploadColumns.map((c) => (
                <TextField
                  key={c.key}
                  label={c.label}
                  value={legacyValues[c.key] === undefined || legacyValues[c.key] === null ? '' : String(legacyValues[c.key])}
                  type={c.inputType === 'number' ? 'number' : c.inputType === 'date' ? 'date' : 'text'}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => {
                    const next = e.target.value
                    setLegacyValues((prev) => ({
                      ...prev,
                      [c.key]: next,
                    }))
                  }}
                  size="small"
                />
              ))}
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            {fileSummary}
            {files.length > 1 ? ' — the same properties will apply to all files.' : ''}
          </Typography>

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
                properties: resolvedProperties,
              })

              if (result.failures.length === 0) onClose()
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Upload failed')
            } finally {
              setSubmitting(false)
            }
          }}
          variant="contained"
          disabled={submitting || definitionsLoading || files.length === 0}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  )
}
