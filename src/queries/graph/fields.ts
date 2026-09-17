import type {
  DocumentLibraryFieldDefinition,
  FieldUpdateFailure,
} from "../../types";
import { normalizeLookupKey, toCanonicalKey } from "../../utils/columns";
import { fallbackFieldDefinition } from "../../utils/fieldDefinitions";
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

  return {
    async getFieldDefinitions({
      fieldKeys = [],
    }: { fieldKeys?: string[] } = {}) {
      const { accessToken, siteId } = await getContext();
      const requested = resolveRequestedFieldKeys(fieldKeys);

      if (requested.size === 0) {
        return [];
      }

      const mappings = await dropdownValues
        .getDocIdentifierMappings(accessToken)
        .catch((error) => {
          console.warn("Failed to load DocIdentifier mappings", error);
          return [];
        });
      const dropdownChoices = choicesFromMappings(mappings);
      const derivedValuesByChoice = Object.fromEntries(
        mappings.map((row) => [
          row.DocIdentifier,
          derivedFieldsFromMapping(row),
        ]),
      );

      const contentTypeChoices =
        siteId &&
        [...requested.values()].some(
          (key) => normalizeLookupKey(key) === "contenttype",
        )
          ? await contentTypes
              .getContentTypeChoices({ accessToken, siteId })
              .catch(() => [] as string[])
          : [];

      const out: DocumentLibraryFieldDefinition[] = [];
      for (const [, canonKey] of requested) {
        let def = fallbackFieldDefinition(canonKey);

        if (
          normalizeLookupKey(def.key) === "contenttype" &&
          contentTypeChoices.length > 0
        ) {
          def = {
            ...def,
            fieldType: "choice",
            choices: contentTypeChoices,
            allowMultipleChoices: false,
          };
        }

        out.push(
          withDropdownChoices(def, dropdownChoices, derivedValuesByChoice),
        );
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
