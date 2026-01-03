import { describe, test, expect, afterEach } from "vitest";
import { fileURLToPath } from "url";
import path from "path";

import { I18NService } from "../lib/i18n";
import type { I18NResourcesByLang } from "../lib/types";

// Mock I18NKeyMap for testing
declare module "../lib/types" {
  interface I18NKeyMap {
    "settings.header": true;
    "settings.table.header.prefix": true;
  }
}

// Sample language resources
const resources: I18NResourcesByLang = {
  en: {
    "settings.header": "Settings",
    "settings.table.header.prefix": "Prefix",
  },
  de: {
    "settings.header": "Einstellungen",
    "settings.table.header.prefix": "Präfix",
  },
};

describe(`Running ${(fileURLToPath(import.meta.url).split(path.sep).join("/").split("/test/")[1] || fileURLToPath(import.meta.url))}`, () => {
    afterEach(() => {
      // Reset singleton for each test
      (I18NService as any).singleton = null;
      window.localStorage.clear?.();
    });

    test("init returns a callable translation function", () => {
      const t = I18NService.init({ resources });
      expect(typeof t).toBe("function");
      expect(t("settings.header")).toBe("Settings");
      expect(t("settings.table.header.prefix")).toBe("Prefix");
    });

    test("translation function returns the same reference on multiple accesses", () => {
      const t1 = I18NService.init({ resources });
      const t2 = I18NService.init({ resources });
      expect(t1).toBe(t2);
    });

    test("throws error if called without settings on first init", () => {
      expect(() => I18NService.init()).toThrowError(/Missing init settings/);
    });

    test("throws error if resources are empty", () => {
      expect(() => I18NService.init({ resources: {} })).toThrowError(/Missing i18n resources/);
    });

    test("translation respects localStorage language", () => {
      const t = I18NService.init({ resources });
      window.localStorage.setItem("language", "de");
      expect(t("settings.header")).toBe("Einstellungen");
      expect(t("settings.table.header.prefix")).toBe("Präfix");
    });

    test("translation falls back to init fallbackLanguage if localStorage language is missing in resources", () => {
      const t = I18NService.init({ resources, fallbackLanguage: "de" });
      window.localStorage.setItem("language", "fr"); // non-existent language
      expect(t("settings.header")).toBe("Einstellungen"); // fallbackLanguage = "de"
      expect(t("settings.table.header.prefix")).toBe("Präfix");
    });

    test("translation falls back to DEFAULT_FALLBACK_LANGUAGE if both requested and fallback are missing", () => {
      const partialResources: I18NResourcesByLang = { en: resources.en };
      const t = I18NService.init({ resources: partialResources, fallbackLanguage: "fr" });
      window.localStorage.setItem("language", "fr"); // non-existent language
      expect(t("settings.header")).toBe("Settings"); // DEFAULT_FALLBACK_LANGUAGE = "en"
      expect(t("settings.table.header.prefix")).toBe("Prefix");
    });
  }
);
