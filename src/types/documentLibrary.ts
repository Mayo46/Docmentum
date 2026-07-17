import type { DocumentLibraryActions } from "./action";
import type {
    DocumentLibraryColumn,
    DocumentLibraryGraphClient,
    DocumentLibraryGridRow,
    DocumentLibraryUploadColumn,
} from "./index";

export type DocumentLibraryPropertiesEditTarget =
    | { kind: "item"; itemId: string; name: string }
    | { kind: "bulk"; groupId: string; label: string };

export type DocumentLibraryContextMenuState = {
    mouseX: number;
    mouseY: number;
    target: DocumentLibraryPropertiesEditTarget;
};

export type DocumentLibraryToast = {
    kind: "success" | "error";
    message: string;
};

export type OnToast = (next: DocumentLibraryToast) => void;

export type DocumentLibraryProps = {
    client: DocumentLibraryGraphClient;
    parentDriveItemId: string;
    libraryRootLabel?: string;
    initialSegmentName?: string;
    showActions?: boolean;
    showBreadcrumb?: boolean;
    showUploadControls?: boolean;
    /** When grouping is off, show a per-row selection checkbox column. Default false. */
    showRowCheckbox?: boolean;
    /** Grid viewport height (CSS length or pixels). When omitted, height fits the current page of rows. */
    gridHeight?: number | string;
    documentClientUrlFieldKey: string;
    columns: DocumentLibraryColumn[];
    uploadColumns?: DocumentLibraryUploadColumn[];
    /** SharePoint columns editable on upload and via right-click (same shapes as `columns`). */
    editableProperties?: unknown;
    uploadPrefillProperties?: Record<string, unknown>;
    /** Reserved for future use. */
    titleColumnKey?: string;
    onSelectionChange?: (row: DocumentLibraryGridRow[]) => void;
    showHamburger?: boolean;
    actions?: DocumentLibraryActions;
};
