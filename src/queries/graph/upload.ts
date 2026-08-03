import axios from "axios";
import type { UploadFailure } from "../../types";
import { normalizeLookupKey } from "../../utils/columns";
import { stripFileExtension } from "../../utils/files";
import type { ContentTypeHelpers } from "./contentTypes";
import { getAxiosErrorMessage } from "./graphRequest";
import type { GraphClientDeps } from "./types";

export function createUploadApi(
  deps: GraphClientDeps,
  contentTypes: ContentTypeHelpers,
) {
  const { graphBaseUrl, getContext } = deps;

  return {
    async uploadFiles({
      parentDriveItemId,
      files,
      contentType: _contentType,
      properties,
      conflictBehavior,
    }: {
      parentDriveItemId?: string;
      files: File[];
      contentType: string;
      properties: Record<string, unknown>;
      conflictBehavior?: "rename" | "replace" | "fail";
    }) {
      const { accessToken, driveId, siteId, listId } = await getContext();

      const uploadedItemIds: string[] = [];
      const failures: UploadFailure[] = [];

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

      // When the form didn't supply a Title, default each item to its own file name
      // so uploaded documents aren't left with a placeholder/blank title.
      const hasSharedTitle = Object.keys(normalized.fieldProperties).some(
        (key) => normalizeLookupKey(key) === "title",
      );

      for (const file of files) {
        try {
          const fileNameEncoded = encodeURIComponent(file.name);
          const uploadUrl =
            `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
            `${parentDriveItemId ? `/items/${encodeURIComponent(parentDriveItemId)}` : "/root"}` +
            `:/${fileNameEncoded}:/content?` +
            `@microsoft.graph.conflictBehavior=${encodeURIComponent(conflictBehavior ?? "rename")}`;

          let uploaded: { id?: string };
          try {
            const uploadRes = await axios.put(uploadUrl, file, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": file.type || "application/octet-stream",
              },
            });
            uploaded = uploadRes.data;
          } catch (error) {
            throw new Error(getAxiosErrorMessage(error));
          }

          const newItemId = uploaded?.id;
          if (!newItemId) {
            throw new Error(
              "Upload succeeded but no drive item id was returned.",
            );
          }

          if (normalized.contentTypeId) {
            const listItemUrl =
              `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
              `/items/${encodeURIComponent(newItemId)}/listItem`;

            try {
              await axios.patch(
                listItemUrl,
                { contentType: { id: normalized.contentTypeId } },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                },
              );
            } catch (error) {
              throw new Error(getAxiosErrorMessage(error));
            }
          }

          const fieldProperties: Record<string, unknown> = {
            ...normalized.fieldProperties,
            ...(hasSharedTitle ? {} : { Title: stripFileExtension(file.name) }),
          };

          if (Object.keys(fieldProperties).length > 0) {
            const patchUrl =
              `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
              `/items/${encodeURIComponent(newItemId)}/listItem/fields`;

            try {
              await axios.patch(patchUrl, fieldProperties, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              });
            } catch (error) {
              throw new Error(getAxiosErrorMessage(error));
            }
          }

          uploadedItemIds.push(newItemId);
        } catch (e) {
          failures.push({
            fileName: file.name,
            message: e instanceof Error ? e.message : "Upload failed",
          });
        }
      }

      return { uploadedItemIds, failures };
    },
  };
}
