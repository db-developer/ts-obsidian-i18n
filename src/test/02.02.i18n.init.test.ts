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
    vi.resetModules();
    vi.clearAllMocks();

    // Reset singleton for each test
    (I18NService as any).singleton = null;
    window.localStorage.clear?.();
  });

  describe("Testing static method init", () => {  

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
  });

  describe("Testing i18n translate function returned from init", () => {  
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

    test("init sets app on existing singleton when provided later", () => {
      const fakeApp = {} as any;

      const t1 = I18NService.init({ resources: en });
      const t2 = I18NService.init({ resources: en, app: fakeApp });

      expect(t1).toBe(t2);
      expect((I18NService as any).singleton.app).toBe(fakeApp);
    });

    test("translation uses app locale when app is provided", async () => {
      vi.resetModules();

      vi.doMock("../lib/i18n.internal", () => ({
        getAppLocale: () => "de",
        getBrowserLocale: () => "en",
        resolveFallback: (r: any) => Object.keys(r)[0],
      }));

      const { I18NService } = await import("../lib/i18n");

      const fakeApp = {} as any;
      const t = I18NService.init({ resources: en, app: fakeApp });

      expect(t("settings.header")).toBe("Einstellungen");
      vi.doUnmock("../lib/i18n.internal");
    });

    test("translation falls back to browser locale when no app is set", async () => {
      vi.resetModules();

      vi.doMock("../lib/i18n.internal", () => ({
        getAppLocale: () => "de",
        getBrowserLocale: () => "en",
        resolveFallback: (r: any) => Object.keys(r)[0],
      }));


      const { I18NService } = await import("../lib/i18n");

      const t = I18NService.init({ resources: en });

      expect(t("settings.header")).toBe("Settings");
      vi.doUnmock("../lib/i18n.internal");
    });
  });

  describe("Testing static property language", () => {
    test("returns null if the singleton is not initialized", () => {
      // @ts-expect-error – accessing private static for test setup
      I18NService.singleton = undefined;

      expect(I18NService.language).toBeNull();
    });

    test("delegates to singleton.getLanguage()", () => {
      const getLanguageMock = vi.fn().mockReturnValue("en");

      // @ts-expect-error – accessing private static for test setup
      I18NService.singleton = {
        getLanguage: getLanguageMock,
      } as unknown as I18NService<Record<string, true>>;

      expect(I18NService.language).toBe("en");
      expect(getLanguageMock).toHaveBeenCalledTimes(1);
    });

    test("returns null if singleton.getLanguage() returns null", () => {
      const getLanguageMock = vi.fn().mockReturnValue(null);

      // @ts-expect-error – accessing private static for test setup
      I18NService.singleton = {
        getLanguage: getLanguageMock,
      } as unknown as I18NService<Record<string, true>>;

      expect(I18NService.language).toBeNull();
      expect(getLanguageMock).toHaveBeenCalledTimes(1);
    });
  });
});
