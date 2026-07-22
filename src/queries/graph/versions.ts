import type { DocumentLibraryVersion } from "../../types";
import { graphRequest, graphRequestNoJson } from "./graphRequest";
import type { GraphClientDeps } from "./types";

export function createVersionsApi(deps: GraphClientDeps) {
  const { graphBaseUrl, getContext } = deps;

  return {
    async listVersions({ itemId }: { itemId: string }) {
      const { accessToken, driveId } = await getContext();
      // driveItemVersion supports id, lastModifiedDateTime, size, lastModifiedBy, publication, content.
      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/versions` +
        `?$select=id,lastModifiedDateTime,lastModifiedBy,size`;

      const json = await graphRequest<{ value: DocumentLibraryVersion[] }>({
        url,
        method: "GET",
        accessToken,
      });

      return json.value ?? [];
    },

    async restoreVersion({
      itemId,
      versionId,
    }: {
      itemId: string;
      versionId: string;
    }) {
      const { accessToken, driveId } = await getContext();
      const url =
        `${graphBaseUrl}/drives/${encodeURIComponent(driveId)}` +
        `/items/${encodeURIComponent(itemId)}/versions/${encodeURIComponent(versionId)}/restoreVersion`;
      await graphRequestNoJson({ url, method: "POST", accessToken });
    },
  };
}
