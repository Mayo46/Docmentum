import { useCallback, useEffect, useMemo, useState } from "react";
import type {
    DocumentLibraryFieldDefinition,
    DocumentLibraryGraphClient,
} from "../types";
import { normalizeEditablePropertiesInput } from "../utils/editableProperties";
import { fallbackFieldDefinition } from "../utils/fieldDefinitions";

type UseEditableFieldDefinitionsParams = {
    client: DocumentLibraryGraphClient | null;
    editableProperties?: unknown;
};

export function useEditableFieldDefinitions({
    client,
    editableProperties,
}: UseEditableFieldDefinitionsParams) {
    const editableSignature = useMemo(
        () => JSON.stringify(editableProperties ?? null),
        [editableProperties],
    );

    const { keys, labelOverrides } = useMemo(
        () => normalizeEditablePropertiesInput(editableProperties),
        [editableSignature],
    );

    const keysSignature = keys.join("|");

    const [definitions, setDefinitions] = useState<DocumentLibraryFieldDefinition[]>([]);
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
            // Empty keys => load all available columns (respecting per-field read-only).
            const defs = await client.getFieldDefinitions({ fieldKeys: keys });
            setDefinitions(
                labelOverrides.size === 0
                    ? defs
                    : defs.map((d) => ({
                          ...d,
                          displayName: labelOverrides.get(d.key) ?? d.displayName,
                      })),
            );
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load field definitions");
            setDefinitions(
                keys.map((k) =>
                    fallbackFieldDefinition(k, labelOverrides.get(k)),
                ),
            );
        } finally {
            setLoading(false);
        }
    }, [client, keysSignature, labelOverrides]);

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
