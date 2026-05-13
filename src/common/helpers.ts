import type { UploadFailure } from "./../types";
import { jwtDecode } from "jwt-decode";
import moment from "moment";

/** Claims commonly present on Microsoft / Graph access tokens (v1 and v2). */
type GraphAccessTokenClaims = {
    name?: string;
    preferred_username?: string;
    unique_name?: string;
    email?: string;
    upn?: string;
    given_name?: string;
    family_name?: string;
};

/**
 * Best-effort display name from a JWT access token payload (no signature verification).
 * Used to stamp Created By / Modified By–style metadata on upload.
 */
export function displayNameFromGraphAccessToken(accessToken: string): string | undefined {
    try {
        const claims = jwtDecode<GraphAccessTokenClaims>(accessToken);
        const name = claims.name?.trim();
        if (name) return name;
        const preferred = claims.preferred_username?.trim();
        if (preferred) return preferred;
        const unique = claims.unique_name?.trim();
        if (unique) return unique;
        const email = claims.email?.trim();
        if (email) return email;
        const upn = claims.upn?.trim();
        if (upn) return upn;
        const given = claims.given_name?.trim();
        const family = claims.family_name?.trim();
        if (given && family) return `${given} ${family}`;
        if (given) return given;
        if (family) return family;
        return undefined;
    } catch {
        return undefined;
    }
}

export type BreadcrumbSegment = { name: string; id: string | undefined };

export function buildInitialSegments(
    libraryRootLabel: string,
    parentDriveItemId: string,
    initialSegmentName?: string,
): BreadcrumbSegment[] {
    const root: BreadcrumbSegment = { name: libraryRootLabel, id: undefined };
    const trimmed = parentDriveItemId.trim();
    if (!trimmed) return [root];
    return [
        root,
        {
            name: initialSegmentName?.trim() || "Folder",
            id: trimmed,
        },
    ];
}

export function formatDate(value: unknown) {
    if (!value) return "";
    const m = moment(String(value));
    if (!m.isValid()) return String(value);
    return m.format("YYYY-MM-DD hh:mm:ss a");
}

/** SharePoint / Graph may return Content Type as string, object, or CT id (0x…). */
export function formatContentTypeValue(raw: unknown): string {
    if (raw === null || raw === undefined) return "";
    if (typeof raw === "string") {
        const s = raw.trim();
        if (!s) return "";
        if (/^0x[0-9A-F]+$/i.test(s) && s.length > 8) return "";
        return s;
    }
    if (typeof raw === "object") {
        const o = raw as Record<string, unknown>;
        const name = o.name ?? o.label ?? o.displayName ?? o.Title ?? o.title;
        if (typeof name === "string" && name.trim()) return name.trim();
    }
    return "";
}

export function toastFromFailures(failures: UploadFailure[]) {
    if (failures.length === 0) return "";
    return failures.map((f) => `${f.fileName}: ${f.message}`).join("\n");
}


