import type {
  DocumentLibraryFieldDefinition,
  FieldUpdateFailure,
} from "../../types";
import { normalizeLookupKey, toCanonicalKey } from "../../utils/columns";
import {
  fallbackFieldDefinition,
  parseGraphListColumn,
} from "../../utils/fieldDefinitions";
import { resolveRequestedFieldKeys } from "./helpers";
import { graphRequest } from "./graphRequest";
import type { ContentTypeHelpers } from "./contentTypes";
import {
  choicesFromMappings,
  derivedFieldsFromMapping,
  type DropdownValuesHelper,
} from "./dropdownValues";
import type { GraphClientDeps } from "./types";

function withDropdownChoices(
  def: DocumentLibraryFieldDefinition,
  choicesByField: Record<string, string[]>,
  derivedValuesByChoice: Record<string, Record<string, string>>,
): DocumentLibraryFieldDefinition {
  const choices = choicesByField[def.key];
  if (!choices?.length) return def;
  const isDocumentType = def.key === "DocumentType";
  return {
    ...def,
    fieldType: "choice",
    choices,
    ...(isDocumentType && Object.keys(derivedValuesByChoice).length
      ? { derivedValuesByChoice }
      : {}),
  };
}

export function createFieldsApi(
  deps: GraphClientDeps,
  contentTypes: ContentTypeHelpers,
  dropdownValues: DropdownValuesHelper,
) {
  const { graphBaseUrl, getContext } = deps;
  let cachedListColumns: unknown[] | null = null;

  return {
    async getFieldDefinitions({
      fieldKeys = [],
    }: { fieldKeys?: string[] } = {}) {
      const { accessToken, siteId, documentContentTypeIds } = await getContext();
      const requested = resolveRequestedFieldKeys(fieldKeys);

      if (requested.size === 0) {
        return [];
      }

      if (!siteId || !documentContentTypeIds.length) {
        return fieldKeys.map((k) => fallbackFieldDefinition(k.trim()));
      }

      const dropdownValuesPromise = dropdownValues
        .getDocIdentifierMappings(accessToken)
        .catch((error) => {
          console.warn("Failed to load DocIdentifier mappings", error);
          return [];
        });

      let columnRows = cachedListColumns;

      if (!columnRows) {
        const responses = await Promise.all(
          documentContentTypeIds.map((id) =>
            graphRequest<{ value: unknown[] }>({
              url:
                `${graphBaseUrl}/sites/${encodeURIComponent(siteId)}` +
                `/contentTypes/${encodeURIComponent(id)}/columns`,
              method: "GET",
              accessToken,
            }),
          ),
        );

        const uniqueColumns = new Map<string, unknown>();
        for (const response of responses) {
          for (const column of response.value ?? []) {
            const name = (column as { name?: string }).name;

            if (name && !uniqueColumns.has(name)) {
              uniqueColumns.set(name, column);
            }
          }
        }

        columnRows = [...uniqueColumns.values()];

        cachedListColumns = columnRows;
      }

      // Resolve ContentType choices for the ContentType field when it is requested.
      const resolveContentTypeChoices = async () => {
        try {
          return await contentTypes.getContentTypeChoices({
            accessToken,
            siteId,
          });
        } catch {
          return [];
        }
      };

      const withContentTypeChoices = async (
        def: DocumentLibraryFieldDefinition,
      ): Promise<DocumentLibraryFieldDefinition> => {
        if (normalizeLookupKey(def.key) !== "contenttype") return def;
        const choices = await resolveContentTypeChoices();
        if (choices.length === 0) return def;
        return {
          ...def,
          fieldType: "choice",
          choices,
          allowMultipleChoices: false,
        };
      };

      const mappings = await dropdownValuesPromise;
      const dropdownChoices = choicesFromMappings(mappings);
      const derivedValuesByChoice = Object.fromEntries(
        mappings.map((row) => [row.DocIdentifier, derivedFieldsFromMapping(row)]),
      );

      const withResolvedChoices = async (
        def: DocumentLibraryFieldDefinition,
      ): Promise<DocumentLibraryFieldDefinition> => {
        return withDropdownChoices(
          await withContentTypeChoices(def),
          dropdownChoices,
          derivedValuesByChoice,
        );
      };

      const parsed = new Map<string, DocumentLibraryFieldDefinition>();
      for (const col of columnRows) {
        const raw = col as Parameters<typeof parseGraphListColumn>[0];
        const def = parseGraphListColumn(raw);
        if (!def) continue;
        const norm = normalizeLookupKey(def.key);
        if (!requested.has(norm)) continue;
        parsed.set(norm, def);
      }

      const out: DocumentLibraryFieldDefinition[] = [];
      for (const [, canonKey] of requested) {
        const norm = normalizeLookupKey(canonKey);
        const baseDef = parsed.get(norm) ?? fallbackFieldDefinition(canonKey);
        out.push(await withResolvedChoices(baseDef));
      }

      return out;
    },

    async getListItemFieldValues({
      itemId,
      fieldKeys,
    }: {
      itemId: string;
      fieldKeys: string[];
    }) {
      const { accessToken, driveId } = await getContext();
      const keys = fieldKeys
        .map((k) => toCanonicalKey(k) || k.trim())
        .filter(Boolean);

      const baseUrl =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/listItem/fields`;

      // No explicit keys => return every field value for the item.
      const url =
        keys.length === 0
          ? baseUrl
          : `${baseUrl}?$select=${keys.map(encodeURIComponent).join(",")}`;

      return graphRequest<Record<string, unknown>>({
        url,
        method: "GET",
        accessToken,
      });
    },

    async updateListItemFields({
      itemIds,
      properties,
    }: {
      itemIds: string[];
      properties: Record<string, unknown>;
    }) {
      const { accessToken, driveId, siteId, listId } = await getContext();
      const failures: FieldUpdateFailure[] = [];
      if (Object.keys(properties).length === 0) return { failures };

      const normalized = await contentTypes.normalizePatchProperties({
        accessToken,
        siteId,
        listId,
        properties,
      });
      if (normalized.unresolvedContentTypeName) {
        throw new Error(
          `Unable to resolve content type '${normalized.unresolvedContentTypeName}' for this library. ` +
            "Ensure this content type exists on the target list.",
        );
      }

      for (const itemId of itemIds) {
        try {
          if (normalized.contentTypeId) {
            const listItemUrl =
              `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
              `/items/${encodeURIComponent(itemId)}/listItem`;

            await graphRequest({
              url: listItemUrl,
              method: "PATCH",
              accessToken,
              body: { contentType: { id: normalized.contentTypeId } },
            });
          }

          if (Object.keys(normalized.fieldProperties).length > 0) {
            const fieldsUrl =
              `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
              `/items/${encodeURIComponent(itemId)}/listItem/fields`;
            await graphRequest({
              url: fieldsUrl,
              method: "PATCH",
              accessToken,
              body: normalized.fieldProperties,
            });
          }
        } catch (e) {
          failures.push({
            itemId,
            message: e instanceof Error ? e.message : "Update failed",
          });
        }
      }
      return { failures };
    },
  };
}
