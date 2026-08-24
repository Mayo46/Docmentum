import type { DocumentLibraryGraphClient } from "../../types";
import { createCheckoutApi } from "./checkout";
import { createContentTypeHelpers } from "./contentTypes";
import { createDriveItemsApi } from "./driveItems";
import { getFavoritesFilesByIds } from "./favorites";
import { createDropdownValuesHelper } from "./dropdownValues";
import { createFieldsApi } from "./fields";
import { createLibraryResolver } from "./library";
import type { GraphClientOptions } from "./types";
import { createUploadApi } from "./upload";
import { createVersionsApi } from "./versions";

export type { GraphClientOptions } from "./types";

/**
 * Creates a Microsoft Graph-backed document library client.
 * Feature APIs live in sibling modules under `./`.
 */
export function createGraphClient(
  opts: GraphClientOptions,
): DocumentLibraryGraphClient {
  const graphBaseUrl = opts.graphBaseUrl ?? "https://graph.microsoft.com/v1.0";
  const contentTypesLibraryName =
    opts.contentTypesLibrary?.trim() || "ContentTypesLibraryTest";

  const { getContext, getCheckoutUserId } = createLibraryResolver({
    graphBaseUrl,
    opts,
  });
  const favoriteItemIDs = opts.favoriteItemIDs;
  const deps = {
    graphBaseUrl,
    opts,
    getContext,
    getCheckoutUserId,
    favoriteItemIDs,
  };

  const contentTypes = createContentTypeHelpers({
    graphBaseUrl,
    contentTypesLibraryName,
  });
  const dropdownValues = createDropdownValuesHelper({ graphBaseUrl });
  const driveItems = createDriveItemsApi(deps);
  const checkout = createCheckoutApi(deps);
  const fields = createFieldsApi(deps, contentTypes, dropdownValues);
  const versions = createVersionsApi(deps);
  const upload = createUploadApi(deps, contentTypes);

  return {
    ...driveItems,
    listFavorites: () => getFavoritesFilesByIds(deps),
    ...checkout,
    ...fields,
    ...versions,
    ...upload,
  };
}
