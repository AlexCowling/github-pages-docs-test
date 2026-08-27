/**
 * Framework-agnostic token entry point.
 *
 * Contains no React import, so a Node service or an API project can depend on
 * this module to render the same palette in a transactional email or a PDF
 * without pulling a UI runtime into its dependency tree.
 */

export { palette, scale } from "./primitives";
export { light, dark, themes } from "./semantic";
export type { SemanticTokens, ThemeName } from "./semantic";

/** Prefix for every generated CSS custom property. */
export const TOKEN_PREFIX = "ti";
