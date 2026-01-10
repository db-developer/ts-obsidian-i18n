import type { App                 } from "obsidian";

/**
 * Compile-time registry for all valid i18n translation keys.
 *
 * This interface is intentionally empty and must be augmented by consumers
 * via TypeScript module augmentation.
 *
 * The values are marker-only and have no runtime meaning.
 */
export type I18NKeyMapOf<T extends Record<string, true>> = T;

/**
 * Union type of all registered i18n keys.
 */
export type I18NKey<T extends Record<string, true>> = keyof T;

/**
 * A single language resource.
 * Must provide a translation for every registered i18n key.
 */
export type I18NResource<T extends Record<string, true>> = {[K in keyof T]: string};

/**
 * Collection of language resources indexed by language code.
 */
export type I18NResourcesByLang<T extends Record<string, true>> = Record<string, I18NResource<T>>;

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
export type VaultWithConfig = App["vault"] & {
  getConfig(key: string): string | null;
};
