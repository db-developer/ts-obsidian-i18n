import type { I18NResourcesByLang } from "./types"

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
 * The static default fallback language used when neither the requested language
 * nor the build-time plugin fallback language is available in the resources.
 *
 * This value is guaranteed to exist and serves as the last-resort fallback.
 *
 * Example usage in `resolveLanguage`:
 * 
 * ```ts
 * const lang = resolveLanguage(requestedLang, resources);
 * ```
 */
export const DEFAULT_FALLBACK_LANGUAGE = "en" as const;

/**
 * Resolves the effective language to use for translations, based on the requested language,
 * the optional build-time plugin fallback, and the static default fallback.
 *
 * Resolution order:
 * 1. If the requested language exists in the provided resources, it is used.
 * 2. If a build-time fallback language (__PLUGIN_FALLBACK_LANGUAGE__) is defined and exists in the resources, it is used.
 * 3. If the static default fallback (DEFAULT_FALLBACK_LANGUAGE) exists in the resources, it is used.
 * 4. If none of the above are valid, an error is thrown indicating a misconfiguration.
 *
 * @param resources - The map of available translations, keyed by language code.
 * @param requested - The language requested by the user or system (e.g., from localStorage).
 * @returns The resolved language code present in the resources.
 * @throws Error if no valid fallback language is found.
 *
 * Example Rollup replacement for __PLUGIN_FALLBACK_LANGUAGE__:
 * 
 * ```ts
 * import replace from '@rollup/plugin-replace';
 * 
 * replace({
 *   preventAssignment: true,
 *   __PLUGIN_FALLBACK_LANGUAGE__: JSON.stringify('de'),
 * });
 * ```
 */
export function resolveLanguage(
  resources: I18NResourcesByLang,
  requested: string = "unknown"
): string {
  // 1. Requested language is explicitly available
  if (requested in resources) {
    return requested;
  }

  // 2. Build-time fallback is defined AND present in the resource set
  if (
    typeof __PLUGIN_FALLBACK_LANGUAGE__ === "string" &&
    __PLUGIN_FALLBACK_LANGUAGE__ in resources
  ) {
    return __PLUGIN_FALLBACK_LANGUAGE__;
  }

  // 3. Static default fallback
  if (DEFAULT_FALLBACK_LANGUAGE in resources) {
    return DEFAULT_FALLBACK_LANGUAGE;
  }

  // 4. Hard misconfiguration (should never happen)
  throw new Error(
    "No valid fallback language found. " +
    "Check plugin i18n configuration."
  );
}