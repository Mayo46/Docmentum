import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { DocumentLibraryFieldDefinition } from "../types";
import {
  formatFieldValueForInput,
  formatFieldValueForPatch,
} from "../utils/fieldDefinitions";
import {
  COLUMN_GROUP_LABELS,
  COLUMN_GROUPS,
  DOCUMENT_FIELD_ORDER,
  GROUP_ORDER,
} from "../utils/constants";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useState } from "react";
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
  console.log("PropertiesFormFields", { definitions, values, disabled });
  const setKey = (key: string, value: string | boolean | string[]) => {
    onChange({ ...values, [key]: value });
  };

  // const groupedDefinitions = definitions.reduce<
  //   Record<string, DocumentLibraryFieldDefinition[]>
  // >((acc, def) => {
  //   let group = def.columnGroup ?? "";
  //   // Show "Core Document Columns" under the Parent section.
  //   if (group === COLUMN_GROUPS.CORE) {
  //     group = COLUMN_GROUPS.DOCUMENT;
  //   }
  //   if (!acc[group]) {
  //     acc[group] = [];
  //   }
  //   acc[group].push(def);
  //   return acc;
  // }, {});

  const DOCUMENT_FIELD_ORDER_MAP = new Map(
    DOCUMENT_FIELD_ORDER.map((key, index) => [key.toLowerCase(), index]),
  );

  const groupedDefinitions = definitions.reduce<
    Record<string, DocumentLibraryFieldDefinition[]>
  >((acc, def) => {
    let group = def.columnGroup ?? "";

    // Show "Core Document Columns" under the Document section.
    if (group === COLUMN_GROUPS.CORE) {
      group = COLUMN_GROUPS.DOCUMENT;
    }

    if (!acc[group]) {
      acc[group] = [];
    }

    acc[group].push(def);

    return acc;
  }, {});

  // Apply the required order only to the Document section.
  if (groupedDefinitions[COLUMN_GROUPS.DOCUMENT]) {
    groupedDefinitions[COLUMN_GROUPS.DOCUMENT].sort((a, b) => {
      const aIndex =
        DOCUMENT_FIELD_ORDER_MAP.get(a.key.toLowerCase()) ??
        Number.MAX_SAFE_INTEGER;

      const bIndex =
        DOCUMENT_FIELD_ORDER_MAP.get(b.key.toLowerCase()) ??
        Number.MAX_SAFE_INTEGER;

      return aIndex - bIndex;
    });
  }

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    [COLUMN_GROUPS.DOCUMENT]: true,
    [COLUMN_GROUPS.DOCUMENT_SET]: true,
  });
  const toggleSection = (group: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
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

    if (def.fieldType === "dateTime") {
      return (
        <TextField
          key={def.key}
          label={def.displayName}
          size="small"
          fullWidth
          value={typeof value === "string" ? value : ""}
          slotProps={{
            input: { readOnly: true },
            inputLabel: { shrink: true },
          }}
          sx={readOnlyFieldSx}
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

  // return <Stack spacing={2}>{definitions.map(renderField)}</Stack>;
  return (
    <Stack spacing={3}>
      {GROUP_ORDER.filter((group) => groupedDefinitions[group]?.length).map(
        (group) => {
          const expanded = expandedSections[group];
          return (
            <Stack key={group} spacing={2}>
              <Box
                sx={{
                  p: "9px 16px",
                  bgcolor: "#e9ecef",
                  borderBottom: "1px solid #dee2e6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection(group)}
              >
                <Typography fontWeight="bold" fontSize={15}>
                  {COLUMN_GROUP_LABELS[group]}
                </Typography>
                {expanded ? (
                  <ExpandLess fontSize="small" />
                ) : (
                  <ExpandMore fontSize="small" />
                )}
              </Box>
              {expanded && (
                <Stack spacing={2}>
                  {groupedDefinitions[group].map(renderField)}
                </Stack>
              )}
            </Stack>
          );
        },
      )}
    </Stack>
  );
}
