/** Strips a single trailing file extension, e.g. "report.final.pdf" -> "report.final". */
export function stripFileExtension(fileName: string): string {
    return fileName.replace(/\.[^./\\]+$/, "");
}
