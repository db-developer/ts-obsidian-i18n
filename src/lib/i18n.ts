import      { App                  } from "obsidian";
import      { getAppLocale,
              getBrowserLocale,
              resolveFallback      } from "./i18n.internal";
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

      const language  = resolveFallback(
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
   * Returns the currently active translation language.
   *
   * This static accessor delegates to the singleton instance of the I18N service.
   * If the service has not been initialized yet, `null` is returned.
   *
   * @returns The active language identifier (e.g. `"en"`, `"de"`), or `null`
   *          if the I18N service singleton is not available.
   */
  static get language(): string | null {
    if (!I18NService.singleton) return null;
    else return I18NService.singleton.getLanguage(I18NService.singleton.fallbackLanguage);
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
   * determined dynamically at call time.
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
    // create translation function once
    this._i18n = this.createTranslationFunction();
  }

  /**
   * Creates the translation function for this I18N service instance.
   *
   * The returned function maps a registered {@link I18NKey} to a localized string
   * based on the **desired language** and the **fallback language**.
   *
   * Behavior:
   * - The **desired language** is determined dynamically at call time using
   *   `instance.getLanguage(fallback)`
   * - The desired language may not have a corresponding translation resource.
   * - The **fallback language** is resolved during plugin initialization and is
   *   guaranteed to have a corresponding resource.
   * - The function ensures that a valid string is always returned: if the desired
   *   language has no matching resource, the fallback language resource is used.
   *
   * Implementation details:
   * - Local references to `resources`, `fallbackLanguage`, and `instance` are
   *   captured in the closure to avoid repeated access to `this` inside the
   *   returned function.
   * - The translation function is created once during construction and the
   *   same reference is returned every time, ensuring stability across modules.
   * - This function encapsulates the core business logic for providing guaranteed
   *   values (here: translations) for keys.
   *
   * @returns A stable translation function that maps an {@link I18NKey} to a
   * localized string, always returning a value from either the desired or fallback language.
   */
  private createTranslationFunction(): (key: I18NKey<T>) => string {
    // store local references to avoid `this` inside closure
    const res = this.resources;
    const fb = this.fallbackLanguage;
    const instance = this;

    // create translation function
    return (key: I18NKey<T>): string => {
      const lang = instance.getLanguage( fb );
      if (lang in res) return res[lang][key];
      else return res[fb][key];
    };    
  }

  /**
   * Returns the translation function for this I18N service instance.
   *
   * The function is created once during construction and the same reference
   * is returned on every access, providing stability across modules while still
   * resolving the language dynamically at call time.
   *
   * @returns A translation function that maps an {@link I18NKey} to a localized
   * string, returning a valid resource for either the desired or fallback language.
   */
  public get i18n(): (key: I18NKey<T>) => string {
    return this._i18n;
  }

  /**
   * Core business logic for determining the **desired language** that the I18N service
   * should provide to the user, following the template method design pattern.
   *
   * This method orchestrates multiple sources of locale information to resolve
   * the language the user or system intends to use. Note that the **desired language**
   * returned by this method may differ from the languages actually available in
   * the translation resources.
   *
   * Resolution order:
   * 1. If an Obsidian application instance (`this.app`) is available, the locale
   *    configured within Obsidian is used (`getAppLocale`).
   * 2. Otherwise, the browser's locale is used as a fallback (`getBrowserLocale`).
   * 3. If neither is available or resolvable, the provided `fallback` parameter is returned.
   *    This fallback language is guaranteed to exist because it is resolved during
   *    plugin initialization.
   *
   * Important notes:
   * - This method is **internal** and not part of the public contract, because only
   *   during internal initialization can it be ensured that the fallback language
   *   has a corresponding translation resource.
   * - The passed `fallback` parameter serves as the **final choice** if all other
   *   determinations fail, with the guarantee of an existing translation resource.
   * - The method encapsulates the full business logic for evaluating the desired language,
   *   delegating the actual retrieval details (Obsidian or browser) to helper functions.
   * - It implements a template method pattern, providing a consistent high-level flow
   *   while applying the resolution steps in a defined order.
   *
   * @param fallback - The default language identifier to use if no desired locale can be resolved.
   *                   Guaranteed to have a translation resource.
   * @returns The resolved language identifier representing the **desired** language
   *          (e.g., `"en"`, `"de"`), which may or may not exist in the actual resources.
   */
  private getLanguage(fallback:string): string {
    // die fallback language wird während der initialisierung ermittelt und ist garantiert vorhanden
    // deshalb ist sie die erste wahl, wenn alle anderen ermittlungen fehlschlagen
    let language = getBrowserLocale();
        language = ( this.app ? getAppLocale(this.app) : language) ?? language;
    return language ?? fallback;
  }
}
