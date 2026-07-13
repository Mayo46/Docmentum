import { useCallback, useEffect, useState } from "react";
import type { DocumentLibraryItemRow } from "../types";
import {
    buildInitialSegments,
    type BreadcrumbSegment,
} from "../common/helpers";

type UseDocumentLibraryNavigationParams = {
    libraryRootLabel: string;
    parentDriveItemId: string;
    initialSegmentName?: string;
};

export function useDocumentLibraryNavigation({
    libraryRootLabel,
    parentDriveItemId,
    initialSegmentName,
}: UseDocumentLibraryNavigationParams) {
    const [segments, setSegments] = useState<BreadcrumbSegment[]>(() =>
        buildInitialSegments(libraryRootLabel, parentDriveItemId, initialSegmentName),
    );

    useEffect(() => {
        setSegments(
            buildInitialSegments(libraryRootLabel, parentDriveItemId, initialSegmentName),
        );
    }, [libraryRootLabel, parentDriveItemId, initialSegmentName]);

    const currentParentDriveItemId =
        segments[segments.length - 1]?.id ?? undefined;
    const uploadsEnabled = !!currentParentDriveItemId;

    const navigateInto = useCallback((row: DocumentLibraryItemRow) => {
        if (!row.isContainer) return;
        setSegments((prev) => [...prev, { name: row.name, id: row.itemId }]);
    }, []);

    const onBreadcrumbClick = useCallback((index: number) => {
        setSegments((prev) => prev.slice(0, index + 1));
    }, []);

    return {
        segments,
        currentParentDriveItemId,
        uploadsEnabled,
        navigateInto,
        onBreadcrumbClick,
    };
}
