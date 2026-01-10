import { PLUGIN_FALLBACK_LANGUAGE  } from "./config";
import type { App                  } from "obsidian";
import type { I18NResourcesByLang,
              VaultWithConfig      } from "./types"

/**
 * Returns Obsidian's current locale setting.
 *
 * This function is intended to be called during initialization of the i18n service
 * to determine the user's preferred language. Its use is part of a "template method"
 * in the business logic, allowing the higher-level flow to remain consistent
 * while delegating the actual retrieval to this implementation.
 *
 * Note:
 * - The logic to retrieve the App locale from Obsidian is considered volatile
 *   and may change with future Obsidian releases.
 * - Extracting this logic into a separate function allows easier adaptation,
 *   maintenance, and unit testing without affecting the main business logic.
 * - `VaultWithConfig` acts as a simulation of the vault interface here,
 *   keeping the business logic decoupled from direct Obsidian internals.
 *
 * @param {App} app - The Obsidian application instance.
 * @returns {string|null} The current locale or null if not set.
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
 * Note:
 * - Extracting this logic into a separate function allows easier adaptation,
 *   maintenance, and unit testing without affecting the main business logic.
 * - The call to this function is part of a "template method" pattern within
 *   the business logic, enabling a consistent high-level flow while delegating
 *   the retrieval details.
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
 * Resolves the fallback language to use for translations, based on a requested language,
 * the optional build-time plugin fallback, and the static default fallback.
 * The function ensures that the returned language code exists in the provided resources.
 *
 * Resolution order:
 * 1. If the requested language exists in the provided resources, it is used.
 * 2. If the static default fallback (PLUGIN_FALLBACK_LANGUAGE) exists in the resources, it is used.
 * 3. If none of the above are valid, an error is thrown indicating a misconfiguration.
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
 * 
 * Note:
 * - Extracting this logic into a separate function allows easier adaptation,
 *   maintenance, and unit testing without affecting the main business logic.
 * - Direct accesses to `config.ts` are encapsulated within this function,
 *   keeping the business logic decoupled from configuration details.
 * - The call to this function is part of the I18NService initialization and
 *   guarantees that a valid fallback language is always available.
 */
export function resolveFallback<T extends Record<string, true>>(
  resources: I18NResourcesByLang<T>,
  requested: string = "unknown"
): string {
  // 1. Requested language is explicitly available
  if (requested in resources) {
    return requested;
  }

  // 2. Static default fallback
  if (PLUGIN_FALLBACK_LANGUAGE in resources) {
    return PLUGIN_FALLBACK_LANGUAGE;
  }

  // 4. Hard misconfiguration (should never happen)
  throw new Error(
    "No valid fallback language found. " +
    "Check plugin i18n configuration."
  );
}