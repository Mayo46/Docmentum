import axios from "axios";
import { getAxiosErrorMessage, graphRequest } from "./graphRequest";
import { escapeODataString, parseSiteUrl } from "./helpers";
import type { GraphClientOptions, LibraryContext } from "./types";
import {
  resolveDocumentContentTypes,
  resolveDocumentSetGroups,
  resolveReadOnlyFields,
} from "./documentContentType";

export async function resolveListByDisplayName(params: {
  graphBaseUrl: string;
  accessToken: string;
  siteId: string;
  displayName: string;
}): Promise<{ id: string; displayName: string } | null> {
  const escapedName = escapeODataString(params.displayName);
  const lists = await graphRequest<{
    value: Array<{ id: string; displayName: string }>;
  }>({
    url:
      `${params.graphBaseUrl}/sites/${encodeURIComponent(params.siteId)}/lists` +
      `?$select=id,displayName&$filter=displayName eq '${escapedName}'`,
    method: "GET",
    accessToken: params.accessToken,
  });
  return lists.value[0] ?? null;
}

export function createLibraryResolver(params: {
  graphBaseUrl: string;
  opts: GraphClientOptions;
}) {
  const { graphBaseUrl, opts } = params;

  let resolvedLibrary: LibraryContext | null = opts.driveId
    ? {
        driveId: opts.driveId,
        siteId: "",
        listId: "",
        documentContentTypeIds: [],
        documentSetGroups: [],
        readOnlyFields: [],
      }
    : null;

  /*
   * Cache the site-specific SharePoint user ID used by
   * the Checked Out Docs view.
   */
  let resolvedCheckoutUserId: number | null = null;
  let resolvedCheckoutUserEmail: string | null = null;

  async function ensureLibrary(accessToken: string): Promise<LibraryContext> {
    if (resolvedLibrary?.driveId) return resolvedLibrary;

    if (!opts.siteUrl || !opts.listName) {
      throw new Error("Missing driveId or siteUrl/listName for Graph client.");
    }

    const { hostname, sitePath } = parseSiteUrl(opts.siteUrl);
    const site = await graphRequest<{ id: string }>({
      url: `${graphBaseUrl}/sites/${encodeURIComponent(hostname)}:${sitePath}?$select=id`,
      method: "GET",
      accessToken,
    });

    const list = await resolveListByDisplayName({
      graphBaseUrl,
      accessToken,
      siteId: site.id,
      displayName: opts.listName,
    });

    if (!list) {
      throw new Error(
        `List (Library) '${opts.listName}' not found in site lists.`,
      );
    }

    const drive = await graphRequest<{ id: string; name: string }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}` +
        `/lists/${encodeURIComponent(list.id)}/drive?$select=id,name`,
      method: "GET",
      accessToken,
    });
    const documentContentTypeNames = resolveDocumentContentTypes(opts.siteUrl);
    const documentSetGroups = resolveDocumentSetGroups(opts.siteUrl);
    const readOnlyFields = resolveReadOnlyFields(opts.siteUrl);

    const contentTypes = await graphRequest<{
      value: Array<{
        id: string;
        name: string;
      }>;
    }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}` +
        `/contentTypes`,
      method: "GET",
      accessToken,
    });

    const matchingContentTypes = contentTypes.value.filter((ct) =>
      documentContentTypeNames.includes(ct.name),
    );

    if (matchingContentTypes.length !== documentContentTypeNames.length) {
      const missing = documentContentTypeNames.filter(
        (name) => !matchingContentTypes.some((ct) => ct.name === name),
      );

      throw new Error(`Content type(s) not found: ${missing.join(", ")}.`);
    }
    resolvedLibrary = {
      driveId: drive.id,
      siteId: site.id,
      listId: list.id,
      documentContentTypeIds: matchingContentTypes.map((ct) => ct.id),
      documentSetGroups,
      readOnlyFields,
    };

    return resolvedLibrary;
  }

  async function getContext() {
    const accessToken = await opts.getAccessToken();
    const lib = await ensureLibrary(accessToken);

    return {
      accessToken,
      driveId: lib.driveId,
      siteId: lib.siteId,
      listId: lib.listId,
      documentContentTypeIds: lib.documentContentTypeIds,
      documentSetGroups: lib.documentSetGroups,
      readOnlyFields: lib.readOnlyFields,
    };
  }

  /*
   * Resolves the current user's SharePoint lookup ID for the
   * current site.
   *
   * SharePoint user lookup IDs are site-specific, so the same
   * user may have ID 46 in Indexing and ID 19 in Claims.
   *
   * The result is cached so we only resolve it once for the
   * current Graph client instance.
   */
  async function getCheckoutUserId(): Promise<number | null> {
    if (opts.documentType !== "checkout" || !opts.userEmail) {
      return null;
    }

    const normalizedEmail = opts.userEmail.trim().toLowerCase();

    /*
     * Return cached SharePoint user ID if this email
     * has already been resolved.
     */
    if (
      resolvedCheckoutUserId !== null &&
      resolvedCheckoutUserEmail === normalizedEmail
    ) {
      return resolvedCheckoutUserId;
    }

    const { accessToken, siteId } = await getContext();

    /*
     * Find the hidden User Information List.
     * Including "system" makes Graph return hidden/system lists.
     */
    const lists = await graphRequest<{
      value: Array<{
        id: string;
        displayName?: string;
        name?: string;
        system?: Record<string, unknown>;
      }>;
    }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(siteId)}/lists` +
        `?$select=id,displayName,name,system`,
      method: "GET",
      accessToken,
    });

    const userInfoList = lists.value.find(
      (list) =>
        list.displayName === "User Information List" ||
        list.name === "User Information List",
    );

    if (!userInfoList) {
      throw new Error(
        "User Information List was not found for the current SharePoint site.",
      );
    }

    /*
     * Query only the current user instead of loading/paging
     * through the entire User Information List.
     *
     * EMail is not indexed, so Graph requires the Prefer header.
     */
    const escapedEmail = normalizedEmail.replace(/'/g, "''");

    const userUrl =
      `${graphBaseUrl}/sites/${encodeURIComponent(siteId)}` +
      `/lists/${encodeURIComponent(userInfoList.id)}/items` +
      `?$expand=fields($select=EMail)` +
      `&$filter=${encodeURIComponent(`fields/EMail eq '${escapedEmail}'`)}` +
      `&$top=1`;

    let response: {
      data: {
        value?: Array<{
          id: string;
          fields?: Record<string, unknown>;
        }>;
      };
    };

    try {
      response = await axios.get(userUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly",
        },
      });
    } catch (error) {
      throw new Error(getAxiosErrorMessage(error));
    }

    const item = response.data.value?.[0];

    if (!item) {
      throw new Error(
        `SharePoint user '${opts.userEmail}' was not found in the current site.`,
      );
    }

    /*
     * The User Information List item ID is the site-specific
     * SharePoint lookup ID used by CheckoutUserLookupId.
     */
    const userId = Number(item.id);

    if (Number.isNaN(userId)) {
      throw new Error(
        `Invalid SharePoint user ID returned for '${opts.userEmail}'.`,
      );
    }

    /*
     * Cache it so subsequent checkout loads don't need
     * another User Information List lookup.
     */
    resolvedCheckoutUserId = userId;
    resolvedCheckoutUserEmail = normalizedEmail;

    return userId;
  }

  return {
    ensureLibrary,
    getContext,
    getCheckoutUserId,
  };
}
