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

type UseEditableFieldDefinitionsParams = {
  client: DocumentLibraryGraphClient | null;
  editableProperties?: unknown;
};

function definitionFromConfig(
  key: string,
  config: ReturnType<typeof getEditablePropertyConfig>,
  graphDef?: DocumentLibraryFieldDefinition,
  labelOverride?: string,
): DocumentLibraryFieldDefinition {
  const base = graphDef ?? fallbackFieldDefinition(key, config?.displayName);
  return {
    ...base,
    displayName: config?.displayName ?? labelOverride ?? base.displayName,
    fieldType: config?.fieldType ?? base.fieldType,
    readOnly: config?.readOnly ?? false,
    required: config?.required ?? false,
    columnGroup: config?.columnGroup ?? base.columnGroup,
  };
}

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
    if (!keys.length) {
      setDefinitions([]);
      setError(null);
      setLoading(false);
      return;
    }

    const fromConfig = (graphDefs: DocumentLibraryFieldDefinition[] = []) =>
      keys.map((k) => {
        const config = getEditablePropertyConfig(configs, k);
        const graphDef = graphDefs.find(
          (d) => d.key === k || d.key.toLowerCase() === k.toLowerCase(),
        );
        return definitionFromConfig(
          k,
          config,
          graphDef,
          labelOverrides.get(k),
        );
      });

    if (!client) {
      setDefinitions(fromConfig());
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const defs = await client.getFieldDefinitions({ fieldKeys: keys });
      setDefinitions(fromConfig(defs));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load field definitions",
      );
      setDefinitions(fromConfig());
    } finally {
      setLoading(false);
    }
  }, [client, keysSignature, labelOverrides, configs, keys]);

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
