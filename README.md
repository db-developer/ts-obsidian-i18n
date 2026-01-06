[BOTTOM](#types) [CHANGELOG](CHANGELOG.md) [LICENSE](LICENSE) [ROADMAP](ROADMAP.md)

# Obsidian I18N Utility

A small, self-contained **i18n utility** designed for use inside **Obsidian plugins**.

This module provides a type-safe `I18NService` singleton and related types to unify translation access
across multiple plugin files, while respecting configurable fallback languages and compile-time key checking.

The primary design goal is **safe integration into Obsidian plugins via bundling**.
The module is **not intended to be loaded dynamically at runtime**.

---

## Motivation

Obsidian plugins run in a constrained environment:

- External runtime dependencies are discouraged
- `node_modules` are typically not shipped with plugins
- All code should be bundled into the final plugin file

This module is therefore designed to:

- Provide **type-safe translations** with compile-time key checking
- Integrate cleanly with Obsidian’s plugin environment
- Be **bundled (e.g. via Rollup)** directly into the plugin output
- Provide consistent translation and fallback behavior across multiple plugin files

---

## Features

* Type-safe translation keys using `I18NKeyMap`
* Compile-time checking of translation resources
* Singleton service with `init()` and stable translation function
* Automatic fallback to build-time or default language
* Works seamlessly in multi-file plugin setups

---

## Installation

```bash
npm install ts-obsidian-i18n
```

**Peer dependency:**

```bash
obsidian >= 1.5.0
```

---

## Basic Usage

### 1. Define translation keys

Create or augment the key map using TypeScript module augmentation:

```ts
// src/lib/types.ts
import "ts-obsidian-i18n";

/**
 * Define all translation keys here.
 * Each key must map to `true`.
 */
export const I18NKeys = {
  "settings.header": true;
  "settings.table.header.prefix": true;
  "settings.control.tooltip.delete": true;
} as const;

/**
 * Type representing all valid translation keys.
 * This enables type-safe key checking in the translation function.
 */
export type I18NKeyMap = typeof I18NKeys;

/**
 * Augment the module to include our key map.
 * This ensures unique keys across the plugin.
 */
declare module "ts-obsidian-i18n" {
  // may look redundant, but necessary for augmentation
  type I18NKeyMap = typeof I18NKeys;
}
```

> This ensures **type-safety**: any call to the translation function with a key not defined here will fail at compile time.

---

### 2. Create translation resources

Define translations for each language you want to support:

```ts
// src/lib/lang.ts
import type { I18NResourcesByLang } from "ts-obsidian-i18n";

export const resources: I18NResourcesByLang = {
  en: {
    "settings.header": "Settings",
    "settings.table.header.prefix": "Prefix",
    "settings.control.tooltip.delete": "Delete mapping"
  },
  de: {
    "settings.header": "Einstellungen",
    "settings.table.header.prefix": "Präfix",
    "settings.control.tooltip.delete": "Mapping löschen"
  }
};
```

alternatively, you can import resources from separate files:

```ts
// src/lib/de.ts
import type { I18NResource } from "ts-obsidian-i18n";
import type { I18NKeyMap   } from "./types";

export const de: I18NResource<I18NKeyMap> = {
  "settings.header": "Einstellungen",
  "settings.table.header.prefix": "Präfix",
  "settings.control.tooltip.delete": "Mapping löschen"
};
```

and then:

```ts
// src/lib/lang.ts
import type { I18NResourcesByLang } from "ts-obsidian-i18n";
import      { en                  } from "./en";
import      { de                  } from "./de";
import type { I18NKeyMap          } from "./types";

export const RESOURCES: I18NResourcesByLang<I18NKeyMap> = { en, de };
```

> Every key from `I18NKeyMap` **must exist** in each resource.

---

### 3. Initialize the I18N service

```ts
// src/lib/bootstrap.ts
import { I18NService } from "ts-obsidian-i18n";
import { RESOURCES   } from "./lang";

export { I18NService } from "ts-obsidian-i18n";
export const I18N = I18NService.init({resources: RESOURCES, fallbackLanguage: "en"});
```

```ts
// src/lib/plugin.ts
import { I18NService } from "ts-obsidian-i18n";

export class DailyNoteStructurePlugin extends Plugin {
  public constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    // Provide 'app' to I18NService for Obsidian integration
    I18NService.init({ app });
  }
  // ...
}

```

* `i18n` is a **translation function**: `(key: I18NKey) => string`
* Safe to call from any file after initialization
* Singleton ensures the same function reference everywhere

---

### 4. Use the translation function

```ts
import { I18N } from "./bootstrap";
console.log(I18N("settings.header")); // "Settings" or localized value
console.log(I18N("settings.table.header.prefix")); // "Prefix" or localized value
```

* Automatically uses language from `window.localStorage.getItem("language")`
* Falls back to `fallbackLanguage` if missing
* Falls back to default `"en"` if neither is present

---

## Build-time Fallback Language with Rollup

`ts-obsidian-i18n` supports a **compile-time fallback language** via Rollup replacement:

```ts
declare const __PLUGIN_FALLBACK_LANGUAGE__: string | undefined;
```

You can replace this during the Rollup build using the `@rollup/plugin-replace` plugin:

```js
// .config/rollup.config.mjs
import replace from "@rollup/plugin-replace";

export default {
  input: "src/index.ts",
  output: {
    file: "index.js",
    format: "esm",
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        __PLUGIN_FALLBACK_LANGUAGE__: JSON.stringify("en") // your desired fallback
      }
    })
  ]
};
```

* If `__PLUGIN_FALLBACK_LANGUAGE__` is defined and present in your resources, it will be used automatically as the fallback.
* If missing, `DEFAULT_FALLBACK_LANGUAGE = "en"` is used.

---

## Advanced Usage

#### Dynamic language switching

```ts
window.localStorage.setItem("language", "de");
console.log(i18n("settings.header")); 
```

#### Multi-file plugin

```ts
// file1.ts
import { I18N } from "./bootstrap";
console.log(I18N("fiel.1.header"));

// file2.ts
import { I18N } from "./bootstrap";
console.log(I18N("file.2.header")); // same reference, same behavior
```

---

## API Reference

### `I18NService`

| Method                  | Description                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `static init(settings)` | Initializes the singleton service and returns the translation function. Must be called once. |
| `i18n(key: I18NKey)`    | Translation function returned by `init()`.                                                   |

### Types

* `I18NKeyMap`: Augmentable interface defining all translation keys
* `I18NKey`: `keyof I18NKeyMap`
* `I18NResource`: `{ [key in I18NKey]: string }`
* `I18NResourcesByLang`: `{ [lang: string]: I18NResource }`


[TOP](#obsidian-i18n-utility) [CHANGELOG](CHANGELOG.md) [LICENSE](LICENSE) [ROADMAP](ROADMAP.md)
