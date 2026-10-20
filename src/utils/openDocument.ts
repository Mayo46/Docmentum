const OFFICE_CONFIG: Record<string, { scheme: string; pathPrefix: string }> = {
  doc: { scheme: "ms-word", pathPrefix: "/:w:/r" },
  docx: { scheme: "ms-word", pathPrefix: "/:w:/r" },
  docm: { scheme: "ms-word", pathPrefix: "/:w:/r" },

  xls: { scheme: "ms-excel", pathPrefix: "/:x:/r" },
  xlsx: { scheme: "ms-excel", pathPrefix: "/:x:/r" },
  xlsm: { scheme: "ms-excel", pathPrefix: "/:x:/r" },

  ppt: { scheme: "ms-powerpoint", pathPrefix: "/:p:/r" },
  pptx: { scheme: "ms-powerpoint", pathPrefix: "/:p:/r" },
  pptm: { scheme: "ms-powerpoint", pathPrefix: "/:p:/r" },
};

export function getOfficeUrl(
  serverRelativeUrl: string | undefined,
  filename: string,
  siteUrl: string,
): string | undefined {
  if (!serverRelativeUrl?.startsWith("/")) return undefined;

  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const config = OFFICE_CONFIG[extension];

  if (!config) return undefined;

  const origin = new URL(siteUrl).origin;

  return `${origin}${config.pathPrefix}${serverRelativeUrl}?web=1`;
}

export function handleOpenDocument(filename: string, fileUrl: string): void {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const config = OFFICE_CONFIG[extension];

  if (config) {
    window.location.href = `${config.scheme}:ofv|u|${fileUrl}`;
    return;
  }

  window.open(fileUrl, "_blank", "noopener,noreferrer");
}
