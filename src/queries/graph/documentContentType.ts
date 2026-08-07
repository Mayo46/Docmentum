import { SITE_CONTENT_TYPES } from "../../utils/constants";

export function resolveDocumentContentType(siteUrl: string): string {
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