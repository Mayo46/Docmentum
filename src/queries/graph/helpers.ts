import { normalizeLookupKey } from "../../utils/columns";

export function getFieldDisplayName(person?: unknown): string | undefined {
  if (!person || typeof person !== "object") return undefined;
  const p = person as Record<string, any>;
  return (
    p?.user?.displayName ??
    p?.application?.displayName ??
    p?.user?.id ??
    p?.userPrincipalName ??
    undefined
  );
}

export function parseSiteUrl(siteUrl: string) {
  const u = new URL(siteUrl);
  return { hostname: u.hostname, sitePath: u.pathname };
}

export function escapeODataString(value: string) {
  return value.replace(/'/g, "''");
}

export function resolveRequestedFieldKeys(
  fieldKeys: string[],
): Map<string, string> {
  const canonByNorm = new Map<string, string>();
  for (const k of fieldKeys) {
    const trimmed = k.trim();
    if (!trimmed) continue;
    canonByNorm.set(normalizeLookupKey(trimmed), trimmed);
  }
  return canonByNorm;
}
