import type { App                 } from "obsidian";
import type { I18NResourcesByLang } from "./types"

/**
 * Represents a Vault object with access to configuration values.
 *
 * Extends the standard Obsidian Vault (`App["vault"]`) by adding a
 * `getConfig` method to retrieve stored configuration keys.
 *
 * @typedef {App["vault"] & { getConfig(key: string): string | null }} VaultWithConfig
 *
 * @property {function(string): string | null} getConfig
 *   Retrieves the value of a configuration key from the vault.
 *   Returns `null` if the key does not exist.
 */
type VaultWithConfig = App["vault"] & {
  getConfig(key: string): string | null;
};

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
 *  Returns obsidians current locale setting.
 *  This function is intended to be called during initialization
 *  of the i18n service to determine the user's preferred language.
 *
 *  @param {App} app - The Obsidian application instance.
 *  @returns {sting|null}
 */
export function getAppLocale(app: App): string|null {
  const vault    = app.vault as VaultWithConfig;
  return vault.getConfig("locale");
}

/**
 * Returns the browser language stored in localStorage, normalized to a base language code.
 *
 * Chromium-based environments (including Obsidian) may persist the UI language
 * under the `language` key in `window.localStorage`, typically in BCP-47 format
 * (e.g. "de-DE", "en-US").
 *
 * The returned value is reduced to the primary language subtag (e.g. "de", "en").
 *
 * @returns {string | null}
 *   The normalized base language code if present, otherwise `null` when no
 *   language information is stored.
 */
export function getBrowserLocale(): string|null {
  const lang = window.localStorage.getItem("language");
  return lang ? lang.split("-")[0] : null;
}

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
export function resolveLanguage<T extends Record<string, true>>(
  resources: I18NResourcesByLang<T>,
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