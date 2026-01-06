import      { App                  } from "obsidian";
import      { getAppLocale,
              getBrowserLocale,
              resolveLanguage      } from "./i18n.internal";
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
export class I18NService<T extends Record<string, true>> {
  /**
   * Holds the singleton instance of the I18NService.
   *
   * This value is initialized exactly once via {@link I18NService.init}
   * and remains stable for the lifetime of the plugin.
   *
   * A null value indicates that the service has not been initialized yet.
   */  
  private static singleton: I18NService<any> | null = null;

  /**
   * The internally stored translation function.
   *
   * Created once during construction and lexically bound to this instance.
   * This ensures that the same function reference is returned on every access
   * and can be safely used across modules without rebinding.
   */
  private readonly _i18n: (key: I18NKey<T>) => string;

  /**
   * Reference to the Obsidian application instance.
   *
   * This property is assigned by Obsidian when the plugin is loaded and provides
   * access to core application services such as the workspace, vault, metadata
   * cache, and registered APIs.
   *
   * It is declared as optional because it may be undefined during early lifecycle
   * phases (e.g. before `onload` has completed) or after the plugin has been
   * unloaded.
   */
  private app?: App;

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
  static init<T extends Record<string, true>>(settings?: {
    resources?: I18NResourcesByLang<T>,
    fallbackLanguage?: string,
    app?: App
  }): (key: I18NKey<T>) => string {
    if (!I18NService.singleton) {
      if (!settings) {
        throw new Error("Missing init settings.");
      }

      const resources = settings?.resources;

      if (!resources || Object.keys(resources).length === 0) {
        throw new Error("Missing i18n resources.");
      }

      const language  = resolveLanguage(
        resources,
        settings.fallbackLanguage
      );

      I18NService.singleton = new I18NService(resources, language);
    }
    
    if (settings?.app) {
      I18NService.singleton.app = settings.app;
    }

    return I18NService.singleton.i18n;
  }

  /**
   * Returns the currently active application language.
   *
   * This static accessor delegates to the singleton instance of the I18N service.
   * If the service has not been initialized yet, `null` is returned.
   *
   * @returns The active language identifier (e.g. `"en"`, `"de"`), or `null`
   *          if the I18N service singleton is not available.
   */
  static get language(): string | null {
    if (!I18NService.singleton) return null;
    else return I18NService.singleton.getLanguage();
  }

  /**
   * Creates a new I18NService instance.
   *
   * This constructor is intentionally private and may only be invoked internally
   * during singleton initialization via {@link I18NService.init}.
   *
   * The translation function is created exactly once during construction and
   * closes over the service instance. The returned function reference remains
   * stable for the lifetime of the plugin, while the resolved language is
   * determined dynamically at call time based on the current runtime context
   * (Obsidian app locale if available, otherwise browser locale, with a
   * fallback to the resolved fallback language).
   *
   * @param resources The complete set of i18n resources indexed by language code.
   * Each language resource must provide translations for all registered i18n keys.
   * @param fallbackLanguage The resolved fallback language used when no explicit
   * runtime language can be determined or no matching resource exists.
   */
  private constructor(
    private readonly resources: I18NResourcesByLang<T>,
    private readonly fallbackLanguage: string
  ) {
    // store local references to avoid `this` inside closure
    const app = this.app;
    const res = this.resources;
    const fb = this.fallbackLanguage;

    // create translation function once
    this._i18n = (key: I18NKey<T>): string => {
      const lang = this.getLanguage() ?? fb;
      if (lang in res) return res[lang][key];
      else return res[fb][key];
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
  private get i18n(): (key: I18NKey<T>) => string {
    return this._i18n;
  }

  /**
   * Determines the effective language to be used by the I18N service.
   *
   * If an Obsidian application instance is available, the locale configured
   * within Obsidian is returned. Otherwise, the browser's locale is used
   * as a fallback.
   *
   * @returns The resolved language identifier (e.g. `"en"`, `"de"`).
   */
  public getLanguage(): string|null {
    const language = getBrowserLocale();
    return ( this.app ? getAppLocale(this.app) : language) ?? language;
  }
}
