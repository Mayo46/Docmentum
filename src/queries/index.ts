/**
 * Public Graph client entry — re-exports the modular implementation.
 * Prefer importing from here so existing consumers stay stable.
 */
export { createGraphClient } from "./graph/createGraphClient";
export type { GraphClientOptions } from "./graph/types";
