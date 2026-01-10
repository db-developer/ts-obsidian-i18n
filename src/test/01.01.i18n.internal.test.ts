// mocks
const deResource = { "settings.header": "Einstellungen" };
const enResource = { "settings.header": "Settings" };

const resources = {
  en: enResource,
  de: deResource,
};

import { App                       } from "obsidian";
import { DEFAULT_FALLBACK_LANGUAGE } from "../lib/config";       
import { getAppLocale,
         getBrowserLocale,
         resolveFallback           } from "../lib/i18n.internal";

// Vitest/Jest helpers to mock global constant
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setPluginFallbackLanguage(value: string | undefined) {
  (globalThis as any).__PLUGIN_FALLBACK_LANGUAGE__ = value;
}

// imports
import   path            from "path";
import { fileURLToPath } from "url";

describe(`Running ${(fileURLToPath(import.meta.url).split(path.sep).join("/").split("/test/")[1] || fileURLToPath(import.meta.url))}`, () => {

  test("getAppLocale is exported and callable", () => {
    expect(typeof getAppLocale).toBe("function");
  });

  test("resolveFallback is exported and callable", () => {
    expect(typeof resolveFallback).toBe("function");
  });

  describe("getAppLocale()", () => {
    test("returns the locale from vault config when present", () => {
      const app = new App();

      vi.spyOn(app.vault, "getConfig").mockReturnValue("de");

      const result = getAppLocale(app);

      expect(app.vault.getConfig).toHaveBeenCalledWith("locale");
      expect(result).toBe("de");
    });

    test("returns null when vault config does not contain a locale", () => {
      const app = new App();

      vi.spyOn(app.vault, "getConfig").mockReturnValue(null);

      const result = getAppLocale(app);

      expect(app.vault.getConfig).toHaveBeenCalledWith("locale");
      expect(result).toBeNull();
    });
  });

  describe("getBrowserLocale()", () => {
    // Backup original localStorage
    let originalLocalStorage: Storage;

    beforeEach(() => {
      // Backup the real localStorage
      originalLocalStorage = window.localStorage;

      // Mock localStorage with vi.fn()
      const store: Record<string, string> = {};
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn((key: string) => store[key] ?? null),
          setItem: vi.fn((key: string, value: string) => (store[key] = value)),
          removeItem: vi.fn((key: string) => delete store[key]),
          clear: vi.fn(() => Object.keys(store).forEach(k => delete store[k])),
          key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
          length: Object.keys(store).length,
        },
        configurable: true,
      });
    });

    afterEach(() => {
      // Restore the original localStorage
      Object.defineProperty(window, "localStorage", { value: originalLocalStorage });
    });

    test("returns null if localStorage has no 'language' key", () => {
      expect(getBrowserLocale()).toBeNull();
    });

    test("returns base language if stored language has no region", () => {
      window.localStorage.setItem("language", "de");
      expect(getBrowserLocale()).toBe("de");
    });

    test("returns primary language subtag if stored language includes region", () => {
      window.localStorage.setItem("language", "en-US");
      expect(getBrowserLocale()).toBe("en");

      window.localStorage.setItem("language", "zh-Hans");
      expect(getBrowserLocale()).toBe("zh");
    });

    test("handles unexpected empty string gracefully", () => {
      window.localStorage.setItem("language", "");
      expect(getBrowserLocale()).toBeNull();
    });
  });

  describe("resolveFallback()", () => {

    afterEach(() => {
      // reset mock after each test
      setPluginFallbackLanguage(undefined);
    });

    test("returns requested language if present in resources", () => {
      const result = resolveFallback(resources, "de");
      expect(result).toBe("de");
    });

    test("returns build-time fallback language if requested is missing", async () => {
      setPluginFallbackLanguage("de");
      vi.resetModules();
      
      const { resolveFallback } = await import("../lib/i18n.internal");

      const result = resolveFallback(resources, "fr");
      expect(result).toBe("de");
    });

    test("ignores build-time fallback if not in resources, throws exception", async() => {
      setPluginFallbackLanguage("fr"); // fr not present
      vi.resetModules();
      
      const { resolveFallback } = await import("../lib/i18n.internal");

      expect(() => resolveFallback(resources, "it")).toThrowError(/No valid fallback language found/);
    });

    test("returns default fallback if requested language missing and no build-time fallback", async() => {
      vi.resetModules();
      
      const { resolveFallback } = await import("../lib/i18n.internal");

      const result = resolveFallback(resources, "it");
      expect(result).toBe(DEFAULT_FALLBACK_LANGUAGE);
    });

    test("throws error if requested, build-time fallback, and default fallback all missing", async () => {
      vi.resetModules();
      
      const { resolveFallback } = await import("../lib/i18n.internal");

      const emptyResources = {};
      expect(() => resolveFallback(emptyResources, "de")).toThrowError(
        /No valid fallback language found/
      );
    });

  });
});
