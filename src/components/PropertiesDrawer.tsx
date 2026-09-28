import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Drawer,
    Stack,
    Typography,
} from "@mui/material";
import type { DocumentLibraryFieldDefinition } from "../types";
import PropertiesFormFields, {
    buildInitialFormValues,
    formValuesToPatchPayload,
    isFieldEmpty,
    validateRequiredFields,
    type PropertyFormValues,
} from "./PropertiesFormFields";

export type PropertiesDrawerMode = "edit" | "upload";

type Props = {
    open: boolean;
    /** "edit" updates existing documents; "upload" creates new ones from `files`. */
    mode?: PropertiesDrawerMode;
    title: string;
    subtitle?: string;
    /** Files being uploaded — shown at the top of the drawer in upload mode. */
    files?: File[];
    definitions: DocumentLibraryFieldDefinition[];
    definitionsLoading?: boolean;
    initialValues?: Record<string, unknown>;
    valuesLoading?: boolean;
    submitting?: boolean;
    submitDisabled?: boolean;
    error?: string | null;
    /** True when editing a bulk/multi selection (enables the step-through controls). */
    multiItem?: boolean;
    /** Disables the bulk "Save/Upload Multiple" button (e.g. once stepping has begun). */
    bulkActionDisabled?: boolean;
    /** 1-based index of the document currently shown when stepping through. */
    stepCurrent?: number;
    /** Total number of documents in the current selection. */
    stepTotal?: number;
    /** True when the currently shown document is the last one in the selection. */
    isLastStep?: boolean;
    /** Name of the document currently shown when stepping through. */
    stepItemName?: string;
    onClose: () => void;
    onSubmit: (properties: Record<string, unknown>) => Promise<void>;
    /** Saves only the current document, then advances to the next selected document. */
    onSaveAndNext?: (properties: Record<string, unknown>) => Promise<void>;
    /**
     * Navigates back to the file-selection step (upload flow only). Only provided while
     * nothing has been uploaded yet; omitted once upload begins so the selection is locked.
     */
    onBack?: () => void;
};

export default function PropertiesDrawer(props: Props) {
    const {
        open,
        mode = "edit",
        title,
        subtitle,
        files = [],
        definitions,
        definitionsLoading = false,
        initialValues,
        valuesLoading = false,
        submitting = false,
        submitDisabled = false,
        error: externalError,
        multiItem = false,
        bulkActionDisabled = false,
        stepCurrent,
        stepTotal,
        isLastStep = false,
        stepItemName,
        onClose,
        onSubmit,
        onSaveAndNext,
        onBack,
    } = props;

    const [values, setValues] = useState<PropertyFormValues>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const isUpload = mode === "upload";

    const definitionsKey = useMemo(
        () => definitions.map((d) => d.key).join("|"),
        [definitions],
    );
    const initialValuesKey = useMemo(
        () => JSON.stringify(initialValues ?? {}),
        [initialValues],
    );

    useEffect(() => {
        if (!open) return;
        setValues(buildInitialFormValues(definitions, initialValues));
        setSubmitError(null);
        setFieldErrors({});
    }, [open, definitionsKey, initialValuesKey, definitions, initialValues]);

    const loading = definitionsLoading || valuesLoading;
    const displayError = submitError ?? externalError;
   
    // Upload can proceed even with no editable metadata columns (files-only upload).
    const actionsDisabled =
        submitting ||
        loading ||
        submitDisabled ||
        (!isUpload && definitions.length === 0);

  

    const runSubmit = async (
        handler?: (properties: Record<string, unknown>) => Promise<void>,
        options?: { skipNameCheck?: boolean },
    ) => {
        if (!handler) return;
        setSubmitError(null);
        const requiredErrors = validateRequiredFields(definitions, values);
        if (Object.keys(requiredErrors).length > 0) {
            setFieldErrors((prev) => ({ ...prev, ...requiredErrors }));
            return;
        }
        const payload = formValuesToPatchPayload(definitions, values);
        
        try {
            await handler(payload);
        } catch (e) {
            const message =
                e instanceof Error
                    ? e.message
                    : isUpload
                        ? "Failed to upload"
                        : "Failed to save properties";
            
            setSubmitError(message);
        }
    };

    const canStep =
        multiItem &&
        !!onSaveAndNext &&
        typeof stepTotal === "number" &&
        stepTotal > 1;
    const saveLabel = isUpload
        ? multiItem
            ? "Upload All Files"
            : "Upload"
        : multiItem
            ? "Save All Docs"
            : "Save";
    const nextLabel = isUpload
        ? isLastStep
            ? "Upload & Finish"
            : "Upload & Next"
        : isLastStep
            ? "Save & Finish"
            : "Save & Next";

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{
                    width: { xs: "100vw", sm: 720 },
                    p: 2.5,
                    display: "flex",
                    flexDirection: "column",
                    height: "100dvh",
                    maxHeight: "100dvh",
                    overflow: "hidden",
                }}
                role="presentation"
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
                {subtitle ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {subtitle}
                    </Typography>
                ) : null}

                {canStep ? (
                    <Alert severity="info" icon={false} sx={{ mt: 1, mb: 2, py: 0.5 }}>
                        {isUpload ? "Uploading" : "Editing"} document {stepCurrent} of{" "}
                        {stepTotal}
                        {stepItemName ? ` — ${stepItemName}` : ""}
                    </Alert>
                ) : (
                    <Box sx={{ mb: 2 }} />
                )}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", pt: 1, px: 0.25 }}>
                        {definitions.length > 0 ? (
                            <PropertiesFormFields
                                definitions={definitions}
                                values={values}
                                onChange={(next) => {
                                    setValues(next);
                                    setFieldErrors((prev) => {
                                        if (Object.keys(prev).length === 0) return prev;
                                        const cleared = { ...prev };
                                        for (const key of Object.keys(prev)) {
                                            if (!isFieldEmpty(next[key])) delete cleared[key];
                                        }
                                        return cleared;
                                    });
                                }}
                                disabled={submitting}
                                fieldErrors={fieldErrors}
                            />
                        ) : isUpload ? (
                            <Alert severity="info">
                                No editable metadata — {files.length > 1 ? "files" : "the file"}{" "}
                                will be uploaded as-is.
                            </Alert>
                        ) : (
                            <Alert severity="info">
                                No editable properties configured.
                            </Alert>
                        )}
                    </Box>
                )}

                {displayError ? (
                    <Alert severity="error" sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
                        {displayError}
                    </Alert>
                ) : null}

                <Stack
                    direction={canStep ? "column" : "row"}
                    spacing={1}
                    justifyContent="flex-end"
                    sx={{ mt: 2, pt: 1 }}
                >
                    
                    <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        alignItems="center"
                    >
                        {onBack ? (
                            <Button
                                variant="outlined"
                                onClick={onBack}
                                disabled={submitting}
                                sx={{ mr: "auto" }}
                            >
                                Back
                            </Button>
                        ) : null}
                        <Button variant="outlined" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            variant={canStep ? "outlined" : "contained"}
                            disabled={
                                actionsDisabled ||
                                (canStep && bulkActionDisabled)
                            }
                            onClick={() =>
                                runSubmit(onSubmit)
                            }
                            startIcon={
                                submitting && !canStep ? (
                                    <CircularProgress size={16} />
                                ) : null
                            }
                        >
                            {saveLabel}
                        </Button>
                        {canStep ? (
                            <Button
                                variant="outlined"
                                disabled={actionsDisabled}
                                onClick={() => runSubmit(onSaveAndNext)}
                                startIcon={submitting ? <CircularProgress size={16} /> : null}
                            >
                                {nextLabel}
                            </Button>
                        ) : null}
                    </Stack>
                </Stack>
            </Box>
        </Drawer>
    );
}
