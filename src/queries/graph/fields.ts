import type {
  DocumentLibraryFieldDefinition,
  FieldUpdateFailure,
} from "../../types";
import { normalizeLookupKey } from "../../utils/columns";
import {
  fallbackFieldDefinition,
  isHiddenGraphListColumn,
  parseGraphListColumn,
} from "../../utils/fieldDefinitions";
import { resolveRequestedFieldKeys } from "./helpers";
import { graphRequest } from "./graphRequest";
import type { ContentTypeHelpers } from "./contentTypes";
import type { GraphClientDeps } from "./types";

export function createFieldsApi(
  deps: GraphClientDeps,
  contentTypes: ContentTypeHelpers,
) {
  const { graphBaseUrl, getContext } = deps;
  let cachedListColumns: unknown[] | null = null;

  return {
    async getFieldDefinitions({
      fieldKeys = [],
    }: { fieldKeys?: string[] } = {}) {
      const { accessToken, siteId, documentContentTypeId } = await getContext();
      const requested = resolveRequestedFieldKeys(fieldKeys);

      // No specific keys requested => surface every available (non-hidden) column.
      const returnAll = requested.size === 0;

      if (!siteId || !documentContentTypeId) {
        return returnAll
          ? []
          : fieldKeys.map((k) => fallbackFieldDefinition(k.trim()));
      }

      let columnRows = cachedListColumns;
      if (!columnRows) {
        const columns = await graphRequest<{ value: unknown[] }>({
          url:
            `${graphBaseUrl}/sites/${encodeURIComponent(siteId)}` +
            `/contentTypes/${encodeURIComponent(documentContentTypeId)}/columns`,
          method: "GET",
          accessToken,
        });

        console.table(
          (
            columns.value as Array<{
              name: string;
              displayName: string;
              columnGroup?: string;
              hidden?: boolean;
              readOnly?: boolean;
              required?: boolean;
            }>
          ).map((c) => ({
            name: c.name,
            displayName: c.displayName,
            columnGroup: c.columnGroup,
            hidden: c.hidden,
            readOnly: c.readOnly,
            required: c.required,
          })),
        );

        columnRows = columns.value ?? [];
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

      if (returnAll) {
        const out: DocumentLibraryFieldDefinition[] = [];

        for (const col of columnRows) {
          const raw = col as Parameters<typeof parseGraphListColumn>[0];

          if (isHiddenGraphListColumn(raw)) continue;

          const def = parseGraphListColumn(raw);
          if (!def) continue;

          out.push(await withContentTypeChoices(def));
        }

        return out;
      }

      const parsed = new Map<string, DocumentLibraryFieldDefinition>();

      for (const col of columnRows) {
        const raw = col as Parameters<typeof parseGraphListColumn>[0];

        if (isHiddenGraphListColumn(raw)) continue;

        const def = parseGraphListColumn(raw);
        if (!def) continue;

        const norm = normalizeLookupKey(def.key);
        if (requested.has(norm)) {
          parsed.set(norm, def);
        }
      }

      const out: DocumentLibraryFieldDefinition[] = [];

      for (const [, canonKey] of requested) {
        const norm = normalizeLookupKey(canonKey);
        const baseDef = parsed.get(norm) ?? fallbackFieldDefinition(canonKey);
        out.push(await withContentTypeChoices(baseDef));
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
      const keys = fieldKeys.map((k) => k.trim()).filter(Boolean);

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
