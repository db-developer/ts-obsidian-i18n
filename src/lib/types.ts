/**
 * Compile-time registry for all valid i18n translation keys.
 *
 * This interface is intentionally empty and must be augmented by consumers
 * via TypeScript module augmentation.
 *
 * The values are marker-only and have no runtime meaning.
 */
export interface I18NKeyMap {[key: string]: true}

/**
 * Union type of all registered i18n keys.
 */
export type I18NKey = keyof I18NKeyMap;

/**
 * A single language resource.
 * Must provide a translation for every registered i18n key.
 */
export type I18NResource = {[K in I18NKey]: string};

/**
 * Collection of language resources indexed by language code.
 */
export type I18NResourcesByLang = Record<string, I18NResource>;