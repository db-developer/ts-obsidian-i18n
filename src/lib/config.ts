/**
 * The static default fallback language used when neither the requested language
 * nor the build-time plugin fallback language is available in the resources.
 *
 * This value is guaranteed to exist and serves as the last-resort fallback.
 */
export const DEFAULT_FALLBACK_LANGUAGE = "en" as const;

/**
 * The fallback language of the plugin, which can be replaced at build time by Rollup.
 *
 * This constant is optional and may be undefined if not replaced during the build.
 * Use a static default fallback in that case.
 *
 * Example Rollup replacement using `@rollup/plugin-replace`:
 * 
 * ```ts
 * import replace from '@rollup/plugin-replace';
 * 
 * replace({
 *   preventAssignment: true,
 *   __PLUGIN_FALLBACK_LANGUAGE__: JSON.stringify('de'),
 * });
 * ```
 *
 * Usage:
 * - Check if it's defined at runtime before using it.
 * - Combine with a static default fallback to ensure safety.
 */
declare const __PLUGIN_FALLBACK_LANGUAGE__: string | undefined;

/**
 * The effective fallback language used by the plugin at runtime.
 *
 * This value resolves the plugin's fallback language in a defensive and
 * deterministic way:
 *
 * - If a build-time fallback language (`__PLUGIN_FALLBACK_LANGUAGE__`) was
 *   provided and replaced by the bundler, that value is used.
 * - Otherwise, a static default fallback language is applied.
 *
 * This constant is intentionally designed to **never be `undefined`**.
 * The resolution happens eagerly at module initialization time to ensure
 * that all consumers can rely on a stable, non-optional `string` value
 * without additional runtime checks.
 *
 * Build-time configuration details are fully encapsulated and do not leak
 * into the public API of the plugin.
 */
export const PLUGIN_FALLBACK_LANGUAGE: string =
  typeof __PLUGIN_FALLBACK_LANGUAGE__ !== "undefined"
    ? __PLUGIN_FALLBACK_LANGUAGE__
    : DEFAULT_FALLBACK_LANGUAGE;
