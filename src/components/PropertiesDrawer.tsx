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
    onClose: () => void;
    onSubmit: (properties: Record<string, unknown>) => Promise<void>;
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
        onClose,
        onSubmit,
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

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{
                    width: { xs: "100vw", sm: 400 },
                    p: 2.5,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                }}
                role="presentation"
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
                {subtitle ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                        {subtitle}
                    </Typography>
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
                    <Box sx={{ flex: 1, overflow: "auto", pt: 1, px: 0.25 }}>
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

                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2, pt: 1 }}>
                    <Button variant="outlined" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={
                            submitting ||
                            loading ||
                            submitDisabled ||
                            definitions.length === 0
                        }
                        onClick={async () => {
                            setSubmitError(null);
                            try {
                                await onSubmit(formValuesToPatchPayload(definitions, values));
                            } catch (e) {
                                setSubmitError(
                                    e instanceof Error ? e.message : "Failed to save properties",
                                );
                            }
                        }}
                        startIcon={submitting ? <CircularProgress size={16} /> : null}
                    >
                        Save
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
}
