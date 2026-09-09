import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DocumentLibraryFieldDefinition,
  DocumentLibraryGraphClient,
} from "../types";
import {
  getEditablePropertyConfig,
  normalizeEditablePropertiesInput,
} from "../utils/editableProperties";
import { fallbackFieldDefinition } from "../utils/fieldDefinitions";
import { FORCED_READONLY_FIELDS } from "../utils/constants";
import { normalizeLookupKey } from "../utils/columns";

type UseEditableFieldDefinitionsParams = {
  client: DocumentLibraryGraphClient | null;
  editableProperties?: unknown;
};

const CHOICE_FIELDS = new Set([
  "ClaimType",
  "ClaimWorkflow",
  "DocumentType",
  "G2CompanyName",
  "Companies",
  "Category",
  "SubCategory",
  "InputSource",
  "InputSources",
]);

export function useEditableFieldDefinitions({
  client,
  editableProperties,
}: UseEditableFieldDefinitionsParams) {
  const editableSignature = useMemo(
    () => JSON.stringify(editableProperties ?? null),
    [editableProperties],
  );

  const { keys, labelOverrides, configs } = useMemo(
    () => normalizeEditablePropertiesInput(editableProperties),
    [editableSignature],
  );

  const keysSignature = keys.join("|");

  const [definitions, setDefinitions] = useState<
    DocumentLibraryFieldDefinition[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!client) {
      setDefinitions([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const defs = await client.getFieldDefinitions({ fieldKeys: keys });

      const updatedDefinitions = defs.map((d) => {
        const config = getEditablePropertyConfig(configs, d.key);
        const displayName =
          config?.displayName ?? labelOverrides.get(d.key) ?? d.displayName;
        const forcedReadOnly = FORCED_READONLY_FIELDS.some(
          (field) =>
            normalizeLookupKey(field) === normalizeLookupKey(d.key) ||
            normalizeLookupKey(field) === normalizeLookupKey(displayName),
        );

        return {
          ...d,
          displayName,
          fieldType: d.choices?.length
            ? ("choice" as const)
            : (config?.fieldType ??
              (CHOICE_FIELDS.has(d.key) ? ("choice" as const) : d.fieldType)),
          readOnly:
            d.readOnly ||
            config?.readOnly === true ||
            forcedReadOnly,
          required: config?.required ?? d.required ?? false,
          columnGroup: config?.columnGroup ?? d.columnGroup,
        };
      });

      setDefinitions(updatedDefinitions);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load field definitions",
      );

      setDefinitions(
        keys.map((k) => {
          const config = getEditablePropertyConfig(configs, k);
          return {
            ...fallbackFieldDefinition(
              k,
              config?.displayName ?? labelOverrides.get(k),
            ),
            fieldType: config?.fieldType ?? "text",
            readOnly: config?.readOnly ?? false,
            required: config?.required ?? false,
            columnGroup: config?.columnGroup,
          };
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [client, keysSignature, labelOverrides, configs]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    keys,
    definitions,
    loading,
    error,
    reload: load,
  };
}
