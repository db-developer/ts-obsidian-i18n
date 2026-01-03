import { describe, test, expect, afterEach } from "vitest";
import { fileURLToPath } from "url";
import path from "path";

import { I18NService } from "../lib/i18n";
import { I18NResourcesByLang, I18NKeyMap } from "../lib/types";

// Mock I18NKeyMap for testing
declare module "../lib/types" {
  interface I18NKeyMap {
    "settings.header": true;
    "settings.table.header.prefix": true;
  }
}

const en: I18NResourcesByLang = {
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
      const t = I18NService.init({ resources: en });
      expect(typeof t).toBe("function");
      expect(t("settings.header")).toBe("Settings");
    });

    test("init is idempotent: second call returns same function", () => {
      const t1 = I18NService.init({ resources: en });
      const t2 = I18NService.init({ resources: en });
      expect(t1).toBe(t2);
    });

    test("throws error if called without settings on first init", () => {
      expect(() => I18NService.init()).toThrowError(/Missing init settings/);
    });

    test("throws error if resources are empty", () => {
      expect(() =>
        I18NService.init({ resources: {} })
      ).toThrowError(/Missing i18n resources/);
    });

    test("translation respects localStorage language", () => {
      const t = I18NService.init({ resources: en });
      window.localStorage.setItem("language", "de");
      expect(t("settings.header")).toBe("Einstellungen");
    });

    test("translation falls back to init fallbackLanguage if localStorage missing", () => {
      const t = I18NService.init({
        resources: en,
        fallbackLanguage: "de",
      });
      expect(t("settings.header")).toBe("Einstellungen");
    });

    test("translation falls back to DEFAULT_FALLBACK_LANGUAGE if fallback missing", () => {
      const customResources: I18NResourcesByLang = { en: en.en };
      const t = I18NService.init({ resources: customResources });
      expect(t("settings.header")).toBe("Settings");
    });
  }
);
