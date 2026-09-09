import type {
  DocumentLibraryFieldDefinition,
  FieldUpdateFailure,
} from "../../types";
import { normalizeLookupKey, toCanonicalKey } from "../../utils/columns";
import { FORCED_READONLY_FIELDS } from "../../utils/constants";
import {
  fallbackFieldDefinition,
  isHiddenGraphListColumn,
  parseGraphListColumn,
} from "../../utils/fieldDefinitions";
import { resolveRequestedFieldKeys } from "./helpers";
import { graphRequest } from "./graphRequest";
import type { ContentTypeHelpers } from "./contentTypes";
import type { DropdownValuesHelper } from "./dropdownValues";
import type { GraphClientDeps } from "./types";

function isForcedReadOnlyField(key: string, displayName?: string): boolean {
  const names = [key, displayName]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => normalizeLookupKey(value));
  return FORCED_READONLY_FIELDS.some((field) =>
    names.includes(normalizeLookupKey(field)),
  );
}

function applyReadOnly(
  def: DocumentLibraryFieldDefinition,
  documentSetGroups: string[],
  readOnlyFields: string[],
): DocumentLibraryFieldDefinition {
  const isDocumentSetField = documentSetGroups.some(
    (group) => group.trim() === (def.columnGroup ?? "").trim(),
  );
  const isConfiguredReadOnly = readOnlyFields.some(
    (field) => normalizeLookupKey(field) === normalizeLookupKey(def.key),
  );
  if (
    isDocumentSetField ||
    isConfiguredReadOnly ||
    isForcedReadOnlyField(def.key, def.displayName)
  ) {
    def.readOnly = true;
  }
  return def;
}

function withDropdownChoices(
  def: DocumentLibraryFieldDefinition,
  choicesByField: Record<string, string[]>,
): DocumentLibraryFieldDefinition {
  const choices =
    choicesByField[def.key] ?? choicesByField[normalizeLookupKey(def.key)];
  if (!choices?.length) return def;
  return {
    ...def,
    fieldType: "choice",
    choices,
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
      const {
        accessToken,
        siteId,
        documentContentTypeIds,
        documentSetGroups,
        readOnlyFields,
      } = await getContext();
      const requested = resolveRequestedFieldKeys(fieldKeys);

      // No specific keys requested => surface every available (non-hidden) column.
      const returnAll = requested.size === 0;

      if (!siteId || !documentContentTypeIds.length) {
        return returnAll
          ? []
          : fieldKeys.map((k) => fallbackFieldDefinition(k.trim()));
      }

      const dropdownChoicesPromise = dropdownValues
        .getDropdownChoices(accessToken)
        .catch((error) => {
          console.warn("Failed to load dropdown values", error);
          return {} as Record<string, string[]>;
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

        // Merge and remove duplicate columns.
        const uniqueColumns = new Map<string, unknown>();
        responses.forEach((response, index) => {
          console.group(`Content Type ${index + 1}`);
          // console.table(response.value);
          console.table(
            response.value.map((column) => {
              const c = column as {
                name: string;
                displayName: string;
                columnGroup?: string;
                hidden?: boolean;
                readOnly?: boolean;
                required?: boolean;
                type?: string;
              };
              return {
                name: c.name,
                displayName: c.displayName,
                columnGroup: c.columnGroup,
                columnType: c.type,
                hidden: c.hidden,
                readOnly: c.readOnly,
                required: c.required,
              };
            }),
          );
          console.groupEnd();
        });

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

      // Resolve ContentType choices once, reused whether returning all or a subset.
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

      const dropdownChoices = await dropdownChoicesPromise;

      const withResolvedChoices = async (
        def: DocumentLibraryFieldDefinition,
      ): Promise<DocumentLibraryFieldDefinition> => {
        return withDropdownChoices(
          await withContentTypeChoices(def),
          dropdownChoices,
        );
      };

      if (returnAll) {
        const out: DocumentLibraryFieldDefinition[] = [];
        for (const col of columnRows) {
          const raw = col as Parameters<typeof parseGraphListColumn>[0];
          if (isHiddenGraphListColumn(raw)) continue;
          const def = parseGraphListColumn(raw);

          if (!def) continue;
          applyReadOnly(def, documentSetGroups, readOnlyFields);
          out.push(await withResolvedChoices(def));
        }

        return out;
      }

      const parsed = new Map<string, DocumentLibraryFieldDefinition>();
      for (const col of columnRows) {
        const raw = col as Parameters<typeof parseGraphListColumn>[0];
        const def = parseGraphListColumn(raw);
        if (!def) continue;
        const norm = normalizeLookupKey(def.key);
        if (!requested.has(norm)) continue;
        applyReadOnly(def, documentSetGroups, readOnlyFields);
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
