import { SITE_CONTENT_TYPES, SITE_DOCUMENT_SET_GROUPS, SITE_READONLY_FIELDS } from "../../utils/constants";

export function resolveDocumentContentTypes(siteUrl: string): string[] {
  const normalized = siteUrl.toLowerCase();

  const match = Object.entries(SITE_CONTENT_TYPES).find(([site]) =>
    normalized.includes(site.toLowerCase()),
  );

  if (!match) {
    throw new Error(
      `No document content type mapping exists for site '${siteUrl}'.`,
    );
  }

  return match[1];
}

export function resolveDocumentSetGroups(siteUrl: string): string[] {
  const normalized = siteUrl.toLowerCase();

  const match = Object.entries(SITE_DOCUMENT_SET_GROUPS).find(([site]) =>
    normalized.includes(site.toLowerCase()),
  );

  if (!match) {
    return [];
  }

  return match[1];
}

export function resolveReadOnlyFields(siteUrl: string): string[] {
  const normalized = siteUrl.toLowerCase();

  const match = Object.entries(SITE_READONLY_FIELDS).find(([site]) =>
    normalized.includes(site.toLowerCase()),
  );

  return match?.[1] ?? [];
}