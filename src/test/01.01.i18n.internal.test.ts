// mocks
const deResource = { "settings.header": "Einstellungen" };
const enResource = { "settings.header": "Settings" };

const resources = {
  en: enResource,
  de: deResource,
};

import { resolveLanguage, DEFAULT_FALLBACK_LANGUAGE } from "../lib/i18n.internal";

// Vitest/Jest helpers to mock global constant
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setPluginFallbackLanguage(value: string | undefined) {
  (globalThis as any).__PLUGIN_FALLBACK_LANGUAGE__ = value;
}

// imports
import   path            from "path";
import { fileURLToPath } from "url";

describe(`Running ${(fileURLToPath(import.meta.url).split(path.sep).join("/").split("/test/")[1] || fileURLToPath(import.meta.url))}`, () => {

  test("resolveLanguage is exported and callable", () => {
    expect(typeof resolveLanguage).toBe("function");
  });

  describe("resolveLanguage()", () => {

    afterEach(() => {
      // reset mock after each test
      setPluginFallbackLanguage(undefined);
    });

    test("returns requested language if present in resources", () => {
      const result = resolveLanguage(resources, "de");
      expect(result).toBe("de");
    });

    test("returns build-time fallback language if requested is missing", () => {
      setPluginFallbackLanguage("de");
      const result = resolveLanguage(resources, "fr");
      expect(result).toBe("de");
    });

    test("ignores build-time fallback if not in resources, uses default fallback", () => {
      setPluginFallbackLanguage("fr"); // fr not present
      const result = resolveLanguage(resources, "it");
      expect(result).toBe(DEFAULT_FALLBACK_LANGUAGE);
    });

    test("returns default fallback if requested language missing and no build-time fallback", () => {
      const result = resolveLanguage(resources, "it");
      expect(result).toBe(DEFAULT_FALLBACK_LANGUAGE);
    });

    test("throws error if requested, build-time fallback, and default fallback all missing", () => {
      const emptyResources = {};
      expect(() => resolveLanguage(emptyResources, "de")).toThrowError(
        /No valid fallback language found/
      );
    });

  });
});
