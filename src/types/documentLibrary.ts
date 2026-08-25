import type { DocumentLibraryActions } from "./actions";
import type {
  DocumentLibraryColumn,
  DocumentLibraryGraphClient,
  DocumentLibraryGridRow,
  DocumentLibraryItemRow,
  DocumentLibraryUploadColumn,
} from "./index";

export type DocumentLibraryPropertiesEditTarget =
  | { kind: "item"; itemId: string; name: string }
  | { kind: "bulk"; groupId: string; label: string }
  | { kind: "selection"; itemIds: string[]; label: string };

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

/**
 * Which documents to load.
 * - `library` (default): folder/document-set children
 * - `favorites`: items the user has favorited (followed)
 * - `checkout`: documents currently checked out in the library
 */
export type DocumentLibraryDocumentType = "library" | "favorites" | "checkout";

export type DocumentLibraryProps = {
  client: DocumentLibraryGraphClient;
  parentDriveItemId: string;
  libraryRootLabel?: string;
  initialSegmentName?: string;
  showActions?: boolean;
  showBreadcrumb?: boolean;
  showUploadControls?: boolean; /** When grouping is off, show a per-row selection checkbox column. Default false. */
  showRowCheckbox?: boolean; /** Grid viewport height (CSS length or pixels). When omitted, height fits the current page of rows. */
  gridHeight?: number | string;
  documentClientUrlFieldKey: string;
  columns: DocumentLibraryColumn[];
  uploadColumns?: DocumentLibraryUploadColumn[]; /** SharePoint columns editable on upload and via right-click (same shapes as `columns`). */
  editableProperties?: unknown;
  uploadPrefillProperties?: Record<
    string,
    unknown
  >; /** Reserved for future use. */
  titleColumnKey?: string;

  /** Called whenever the selected document rows change.Returns the currently selected document rows. */
  onSelectionChange?: (rows: DocumentLibraryGridRow[]) => void;

  /** Notifies the consuming application when a document action starts or finishes. */
  onActionLoadingChange?: (loading: boolean) => void;

  showToolbar?: boolean;

  /** Controls which document actions are available in the action menu. */
  actions?: DocumentLibraryActions;
  
  /** Toolbar / tab display title only  */
  dashboardName?: string;

  /** Which document source to fetch @default "library" */
  documentType?: DocumentLibraryDocumentType;
  
  /** Optional externally supplied document rows. When provided, the grid displays these rows instead of loading documents from SharePoint. */
  externalRows?: DocumentLibraryItemRow[];

  /** Notifies the consuming application when a document is favorited. */
  onFavorite?: (itemIds: string[]) => Promise<void>;
  /** Notifies the consuming application when a document is unfavorited. */
  onUnfavorite?: (itemIds: string[]) => Promise<void>;
  /** Optional externally supplied document total count. When provided, the grid displays this count instead of loading documents from SharePoint. */
  externalTotalCount?: number;
  /** Optional externally supplied document has more flag. When provided, the grid displays this flag instead of loading documents from SharePoint. */
  externalHasMore?: boolean;
  /** Optional externally supplied document load more function. When provided, the grid displays this function instead of loading documents from SharePoint. */
  onLoadMoreExternal?: () => Promise<void>;
};
