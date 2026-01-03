import      { resolveLanguage      } from "./i18n.internal";
import type { I18NResourcesByLang, 
              I18NKey              } from "./types";

/**
 * Central i18n service for Obsidian plugins.
 *
 * This class implements a singleton that provides a type-safe translation
 * function for all registered i18n keys.
 *
 * The service must be initialized exactly once during plugin startup via
 * {@link I18NService.init}. After initialization, the returned translation
 * function can be used from any module without reconfiguration.
 *
 * The singleton design is intentional to ensure:
 * - a single, consistent resource set
 * - a single resolved fallback language
 * - safe usage across multiple source files
 *
 * This class has no public constructor and cannot be instantiated directly.
 */
export class I18NService {
  /**
   * Holds the singleton instance of the I18NService.
   *
   * This value is initialized exactly once via {@link I18NService.init}
   * and remains stable for the lifetime of the plugin.
   *
   * A null value indicates that the service has not been initialized yet.
   */  
  private static singleton: I18NService | null = null;

  /**
   * The internally stored translation function.
   *
   * Created once during construction and lexically bound to this instance.
   * This ensures that the same function reference is returned on every access
   * and can be safely used across modules without rebinding.
   */
  private readonly _i18n: (key: I18NKey) => string;

  /**
   * Initializes the global i18n service and returns the translation function.
   *
   * This method must be called exactly once during plugin startup with a complete
   * set of language resources. Subsequent calls are idempotent and will return
   * the already initialized translation function without reinitializing the service.
   *
   * @param settings Configuration object used for initialization.
   * @param settings.resources A non-empty map of language resources indexed by
   * language code. Each resource must provide translations for all registered
   * i18n keys.
   * @param settings.fallbackLanguage Optional preferred fallback language.
   * This value is resolved against the provided resources and may be overridden
   * by build-time or static fallbacks.
   *
   * @returns A translation function that resolves registered i18n keys to
   * localized strings.
   *
   * @throws {Error} If called without settings on first invocation.
   * @throws {Error} If the provided resource map is empty.
   */
  static init(settings?: {
    resources: I18NResourcesByLang;
    fallbackLanguage?: string;
  }): (key: I18NKey) => string {
    if (!I18NService.singleton) {
      if (!settings) {
        throw new Error("Missing init settings.");
      }

      if (Object.keys(settings.resources).length === 0) {
        throw new Error("Missing i18n resources.");
      }

      const resources = settings.resources;
      const language  = resolveLanguage(
        resources,
        settings.fallbackLanguage
      );

      I18NService.singleton = new I18NService(resources, language);
    }

    return I18NService.singleton.i18n;
  }

  /**
   * Creates a new I18NService instance.
   *
   * This constructor is intentionally private and may only be invoked internally
   * during singleton initialization via {@link I18NService.init}.
   *
   * The translation function is created once during construction and is lexically
   * bound to this instance, ensuring a stable reference for all subsequent calls.
   *
   * @param resources The complete set of i18n resources indexed by language code.
   * Each language resource must provide translations for all registered i18n keys.
   * @param fallbackLanguage The resolved fallback language used when no explicit
   * language is available at runtime.
   */
  private constructor(
    private readonly resources: I18NResourcesByLang,
    private readonly fallbackLanguage: string
  ) {
    // store local references to avoid `this` inside closure
    const res = this.resources;
    const fb = this.fallbackLanguage;

    // create translation function once
    this._i18n = (key: I18NKey): string => {
      const lang = window.localStorage.getItem("language") ?? fb;
      const resource = res[lang] ?? res[fb];
      return resource[key];
    };
  }

  /**
   * Returns the translation function for this i18n service instance.
   *
   * The returned function resolves a registered i18n key to its localized string
   * based on the current runtime language. The language is read from
   * `window.localStorage` under the key `"language"` and falls back to the
   * resolved fallback language if no value is present or no matching resource
   * exists.
   *
   * This function is created once during construction and the same reference
   * is returned on every access, ensuring stable identity across modules.
   *
   * @returns A translation function that maps an {@link I18NKey} to a localized
   * string.
   */
  private get i18n(): (key: I18NKey) => string {
    return this._i18n;
  }
}
