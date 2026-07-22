import { graphRequest } from "./graphRequest";
import { escapeODataString, parseSiteUrl } from "./helpers";
import type { GraphClientOptions, LibraryContext } from "./types";

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
    ? { driveId: opts.driveId, siteId: "", listId: "" }
    : null;

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
      throw new Error(`List (Library) '${opts.listName}' not found in site lists.`);
    }

    const drive = await graphRequest<{ id: string; name: string }>({
      url:
        `${graphBaseUrl}/sites/${encodeURIComponent(site.id)}` +
        `/lists/${encodeURIComponent(list.id)}/drive?$select=id,name`,
      method: "GET",
      accessToken,
    });

    resolvedLibrary = {
      driveId: drive.id,
      siteId: site.id,
      listId: list.id,
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
    };
  }

  return { ensureLibrary, getContext };
}
