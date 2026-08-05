import type {
    DocumentLibraryGraphClient,
    DocumentLibraryItemRow,
    DocumentLibraryToast,
} from ".";
import type { GroupTreeNode } from "../utils/groupTree";

export type UseDocumentLibraryPropertiesParams = {
    client: DocumentLibraryGraphClient;
    editableProperties?: unknown;
    uploadPrefillProperties?: Record<string, unknown>;
    /** Folder the upload flow targets (current navigation location). */
    parentDriveItemId?: string;
    rows: DocumentLibraryItemRow[];
    groupTree: GroupTreeNode[];
    selectedItemIds: Set<string>;
    groupingEnabled: boolean;
    refresh: () => Promise<void>;
    onToast: (toast: DocumentLibraryToast) => void;
    /** Clears grid selection after a successful multi-file edit. */
    clearSelection?: () => void;
    /** Optional externally supplied document rows. When provided, the grid displays these rows instead of fetching data through the client. */ 
    externalRows?: DocumentLibraryItemRow[];
};
