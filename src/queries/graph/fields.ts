import type {
  DocumentLibraryFieldDefinition,
  FieldUpdateFailure,
} from "../../types";
import { normalizeLookupKey } from "../../utils/columns";
import {
  fallbackFieldDefinition,
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
    async getFieldDefinitions({ fieldKeys }: { fieldKeys: string[] }) {
      const { accessToken, siteId, listId } = await getContext();
      const requested = resolveRequestedFieldKeys(fieldKeys);
      if (requested.size === 0) return [];

      if (!siteId || !listId) {
        return fieldKeys.map((k) => fallbackFieldDefinition(k.trim()));
      }

      let columnRows = cachedListColumns;
      if (!columnRows) {
        // SharePoint Graph rejects $select on /lists/{id}/columns for many libraries (400).
        const json = await graphRequest<{ value: unknown[] }>({
          url:
            `${graphBaseUrl}/sites/${encodeURIComponent(siteId)}` +
            `/lists/${encodeURIComponent(listId)}/columns`,
          method: "GET",
          accessToken,
        });
        columnRows = json.value ?? [];
        cachedListColumns = columnRows;
      }

      const parsed = new Map<string, DocumentLibraryFieldDefinition>();
      for (const col of columnRows) {
        const def = parseGraphListColumn(
          col as Parameters<typeof parseGraphListColumn>[0],
        );
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
        if (norm === "contenttype") {
          try {
            const choices = await contentTypes.getContentTypeChoices({
              accessToken,
              siteId,
            });
            if (choices.length > 0) {
              out.push({
                ...baseDef,
                fieldType: "choice",
                choices,
                allowMultipleChoices: false,
              });
              continue;
            }
          } catch {
            // Keep original field definition as fallback when CT lookup fails.
          }
        }
        out.push(baseDef);
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
      if (keys.length === 0) return {};

      const select = keys.map(encodeURIComponent).join(",");
      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/listItem/fields` +
        `?$select=${select}`;

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
