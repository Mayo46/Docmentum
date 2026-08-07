import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { DocumentLibraryFieldDefinition } from "../types";
import {
  formatFieldValueForInput,
  formatFieldValueForPatch,
} from "../utils/fieldDefinitions";
export type PropertyFormValues = Record<string, string | boolean | string[]>;

const editableFieldSx = {
  backgroundColor: "white",
  borderRadius: 1,
};

const readOnlyFieldSx = {
  backgroundColor: "#e9ecef",
  borderRadius: 1,
};

type Props = {
  definitions: DocumentLibraryFieldDefinition[];
  values: PropertyFormValues;
  onChange: (values: PropertyFormValues) => void;
  disabled?: boolean;
};

export function buildInitialFormValues(
  definitions: DocumentLibraryFieldDefinition[],
  source?: Record<string, unknown>,
): PropertyFormValues {
  const out: PropertyFormValues = {};
  for (const def of definitions) {
    out[def.key] = formatFieldValueForInput(
      def,
      source?.[def.key],
    ) as PropertyFormValues[string];
  }
  return out;
}

export function formValuesToPatchPayload(
  definitions: DocumentLibraryFieldDefinition[],
  values: PropertyFormValues,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const def of definitions) {
    if (def.readOnly) continue;
    const raw = values[def.key];
    if (raw === undefined) continue;
    if (def.fieldType === "text" || def.fieldType === "multiline") {
      if (typeof raw === "string" && raw.trim() === "") continue;
    }
    out[def.key] = formatFieldValueForPatch(def, raw);
  }
  return out;
}

export default function PropertiesFormFields({
  definitions,
  values,
  onChange,
  disabled = false,
}: Props) {
  const setKey = (key: string, value: string | boolean | string[]) => {
    onChange({ ...values, [key]: value });
  };
 
  const renderField = (def: DocumentLibraryFieldDefinition) => {
    const value = values[def.key];
    const isReadOnly = !!def.readOnly;
    const fieldSx = isReadOnly ? readOnlyFieldSx : editableFieldSx;

    if (def.fieldType === "boolean") {
      return (
        <FormControlLabel
          key={def.key}
          control={
            <Checkbox
              checked={!!value}
              disabled={disabled || isReadOnly}
              onChange={(e) => setKey(def.key, e.target.checked)}
            />
          }
          label={def.displayName}
        />
      );
    }

    if (def.fieldType === "choice" && def.choices?.length) {
      if (def.allowMultipleChoices) {
        const selected = Array.isArray(value) ? value : [];
        return (
          <Autocomplete
            key={def.key}
            multiple
            options={def.choices}
            value={selected}
            disabled={disabled}
            readOnly={isReadOnly}
            onChange={(_, next) => setKey(def.key, next)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={def.displayName}
                size="small"
                sx={fieldSx}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        );
      }
      return (
        <FormControl key={def.key} fullWidth size="small" disabled={disabled}>
          <InputLabel id={`${def.key}-label`} shrink>
            {def.displayName}
          </InputLabel>
          <Select
            labelId={`${def.key}-label`}
            label={def.displayName}
            readOnly={isReadOnly}
            displayEmpty
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setKey(def.key, String(e.target.value))}
            sx={fieldSx}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {def.choices.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (def.fieldType === "number") {
      return (
        <TextField
          key={def.key}
          label={def.displayName}
          type="number"
          size="small"
          disabled={disabled}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => setKey(def.key, e.target.value)}
          sx={fieldSx}
          slotProps={{
            input: { readOnly: isReadOnly },
            inputLabel: { shrink: true },
          }}
        />
      );
    }

    if (def.fieldType === "date") {
      return (
        <TextField
          key={def.key}
          label={def.displayName}
          type="date"
          size="small"
          disabled={disabled}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setKey(def.key, e.target.value)}
          sx={fieldSx}
          slotProps={{
            input: { readOnly: isReadOnly },
            inputLabel: { shrink: true },
          }}
        />
      );
    }

    return (
      <TextField
        key={def.key}
        label={def.displayName}
        size="small"
        disabled={disabled}
        multiline={def.fieldType === "multiline"}
        minRows={def.fieldType === "multiline" ? 2 : undefined}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => setKey(def.key, e.target.value)}
        sx={fieldSx}
        slotProps={{
          input: { readOnly: isReadOnly },
          inputLabel: { shrink: true },
        }}
      />
    );
  };
  return (
    <Stack spacing={2}>
      {definitions.map(renderField)}
    </Stack>
  );
}
