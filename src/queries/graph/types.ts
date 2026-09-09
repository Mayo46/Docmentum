import type { DocumentLibraryDocumentType } from "../../types";

export type GraphClientOptions = {
  driveId?: string;
  siteUrl?: string;
  listName?: string;
  /** Library/list display name used to source Content Type dropdown values. */
  contentTypesLibrary?: string;
  /** Config-Dev list whose column values populate choice fields. */
  dropdownList?: string;
  columns?: unknown;
    graphBaseUrl?: string;
  /** Return a valid access token for Microsoft Graph. */
  getAccessToken: () => Promise<string>;
  /** SharePoint user lookup email — scopes checkout queries to that user's checked-out items. */
  userEmail?: string;
  documentType?: DocumentLibraryDocumentType;
  favoriteItemIDs?: string[];
};

export type LibraryContext = {
  driveId: string;
  siteId: string;
  listId: string;
  documentContentTypeIds: string[];
  documentSetGroups: string[];
  readOnlyFields: string[];
};

export type GraphRequestContext = LibraryContext & {
  accessToken: string;
};

export type NormalizedPatchProperties = {
  fieldProperties: Record<string, unknown>;
  contentTypeId?: string;
  unresolvedContentTypeName?: string;
};

export type GraphClientDeps = {
  graphBaseUrl: string;
  opts: GraphClientOptions;
  getContext: () => Promise<GraphRequestContext>;
  getCheckoutUserId: () => Promise<number | null>;
  favoriteItemIDs?: string[];
};
