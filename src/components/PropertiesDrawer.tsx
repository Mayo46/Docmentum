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
    type PropertyFormValues,
} from "./PropertiesFormFields";

type Props = {
    open: boolean;
    title: string;
    subtitle?: string;
    definitions: DocumentLibraryFieldDefinition[];
    definitionsLoading?: boolean;
    initialValues?: Record<string, unknown>;
    valuesLoading?: boolean;
    submitting?: boolean;
    submitDisabled?: boolean;
    error?: string | null;
    /** True when editing a bulk/multi selection (enables the step-through controls). */
    multiItem?: boolean;
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
};

export default function PropertiesDrawer(props: Props) {
    const {
        open,
        title,
        subtitle,
        definitions,
        definitionsLoading = false,
        initialValues,
        valuesLoading = false,
        submitting = false,
        submitDisabled = false,
        error: externalError,
        multiItem = false,
        stepCurrent,
        stepTotal,
        isLastStep = false,
        stepItemName,
        onClose,
        onSubmit,
        onSaveAndNext,
    } = props;

    const [values, setValues] = useState<PropertyFormValues>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

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
    }, [open, definitionsKey, initialValuesKey, definitions, initialValues]);

    const loading = definitionsLoading || valuesLoading;
    const displayError = submitError ?? externalError;
    const actionsDisabled =
        submitting || loading || submitDisabled || definitions.length === 0;

    const runSubmit = async (
        handler?: (properties: Record<string, unknown>) => Promise<void>,
    ) => {
        if (!handler) return;
        setSubmitError(null);
        try {
            await handler(formValuesToPatchPayload(definitions, values));
        } catch (e) {
            setSubmitError(
                e instanceof Error ? e.message : "Failed to save properties",
            );
        }
    };

    const canStep =
        multiItem &&
        !!onSaveAndNext &&
        typeof stepTotal === "number" &&
        stepTotal > 1;
    const saveLabel = multiItem ? "Save Multiple Docs" : "Save";
    const nextLabel = isLastStep ? "Save and Finish" : "Save and Move to Next Doc";

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{
                    width: { xs: "100vw", sm: 560 },
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
                        Editing document {stepCurrent} of {stepTotal}
                        {stepItemName ? ` — ${stepItemName}` : ""}
                    </Alert>
                ) : (
                    <Box sx={{ mb: 2 }} />
                )}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : definitions.length === 0 ? (
                    <Alert severity="info">No editable properties configured.</Alert>
                ) : (
                    <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", pt: 1, px: 0.25 }}>
                        <PropertiesFormFields
                            definitions={definitions}
                            values={values}
                            onChange={setValues}
                            disabled={submitting}
                        />
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
                    
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button variant="outlined" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            variant={canStep ? "outlined" : "contained"}
                            disabled={actionsDisabled}
                            onClick={() => runSubmit(onSubmit)}
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
