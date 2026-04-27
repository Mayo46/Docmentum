import type { UploadFailure } from "./../types";
import moment from "moment";

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


