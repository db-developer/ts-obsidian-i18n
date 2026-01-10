[BOTTOM](#philosophy) [CHANGELOG](CHANGELOG.md) [LICENSE](LICENSE) [README](README.md)

# Roadmap

This document outlines the planned and potential future development of the `ts-obsidian-i18n` package.
The roadmap is intentionally lightweight and pragmatic.

---

## Current State

- Stable `I18NService` singleton
- Type-safe translation keys via `I18NKeyMap`
- Compile-time checking of translation resources
- LocalStorage language selection
- Default fallback language handling
- Fully bundled, no runtime dependencies
- Comprehensive unit test coverage

---

## Legend for Status Emojis

| Emoji | Meaning |
|-------|---------|
| ✅     | Completed / Implemented – The feature or task has been fully realized and is working as intended. |
| ❌     | Not required / Out of Scope – The feature is intentionally excluded because it is unnecessary or contradicts design principles. |
| ⚠️     | Pending / Attention Needed – The feature, task, or detail is still open, under consideration, or requires further work. |

---

## Short-Term Goals

### 1. API Stabilization

- ✅ Review public API for long-term stability (since 1.0.2)
  - Public API is minimal and clearly defined
    - `I18NService.init()` → the only entry point
    - Translation function → stable, immutable, returns consistent results
  - All helper functions are internal
    - `getLanguage()`, `_i18n`, `getAppLocale()`, `getBrowserLocale()` → private
    - No helper is inadvertently exposed in the public interface
  - Invariants are guaranteed
    - Fallback language is always present
    - Template method and heuristic for desired language are documented
  - Stability ensured
    - No dependency on external contexts directly visible to plugins
    - Changes to internal code do not affect the public API

- ✅ Ensure backwards compatibility for minor updates (since 1.0.2)
  - The planned separation of `I18NService` into two internal responsibilities
    (Lifecycle / Initialization vs Translation Service) **does not change the public API**
  - Public API remains unchanged:
    - `I18NService.init()` → still the only entry point
    - Translation function → still the stable reference used by plugins
  - Private methods and internal logic are only redistributed between internal classes,
    without requiring new calls or changes from plugin consumers
  - Therefore, backwards compatibility for minor releases is ensured

- ✅ Lock down exported types and helpers (since 1.0.2)
  - Only the necessary types and helpers are exported from the library
  - Internal utility functions and types are kept private
  - Public type signatures and interfaces are consistent and well-defined
  - No accidental re-exports of internal modules or helpers
  - API documentation only exposes public types; internal types/helpers are marked as private/internal
  - This ensures a minimal and stable public interface, reducing the risk of breaking changes in minor releases


### 2. Documentation Improvements

- ✅ Add concise usage examples for common Obsidian plugin patterns (since 1.0.2)
  - README provides step-by-step examples for plugin integration
    - Basic setup with `I18NService.init()` and `app` injection
    - Type-safe translation keys using `I18NKeyMap` and resource objects
    - Translation function usage across multiple plugin files
    - Demonstrates fallback logic (LocalStorage, browser, Rollup fallback)
    - Dynamic language switching example

- ✅ Document recommended Rollup configurations for `__PLUGIN_FALLBACK_LANGUAGE__` (since 1.0.2)
  - README contains a clear Rollup configuration example using `@rollup/plugin-replace`
  - Explains how `__PLUGIN_FALLBACK_LANGUAGE__` is replaced at build time
  - Shows interaction with translation resources and fallback logic
  - Ensures plugin authors can safely integrate compile-time fallback language

- ⚠️ Provide troubleshooting notes for bundling and type-checking issues
  - Currently not implemented; no concrete guidance available yet
  - Potential future content could include:
    - Rollup bundling issues (e.g., `__PLUGIN_FALLBACK_LANGUAGE__` not replaced)
    - TypeScript errors related to `I18NKeyMap` or translation resources
    - Multi-file plugin setup conflicts
  - Marked as a future improvement to support plugin developers

---

## Mid-Term Ideas

### 3. Extended Language Support

- ✅ Optional runtime language switcher (since 1.0.2)
  - Achieved via dynamic evaluation in `getLanguage()` at each translation call
  - Language is determined at runtime from Obsidian app locale or browser/localStorage
  - No additional switcher needed; translation function reacts automatically to environment changes
  - Ensures that the i18n service always provides the **desired language** for the user
- ❌~~Consider explicit API for runtime language changes~~ Not of interest.

### 4. Multi-File Plugin Usage

- ✅ Guidance for using `I18NService.init()` across multiple plugin files (since 1.0.2)
  - Demonstrated via a central `bootstrap.ts` in the README
  - All plugin files import the already initialized `I18N` translation function
  - Prevents multiple initializations and ensures a consistent function reference
  - Provides clear guidance for multi-file plugin setups

- ✅ Best practices for consistent translation function references (since 1.0.2)
  - Achieved via singleton pattern: `I18NService.init()` called once in `bootstrap.ts`
  - All plugin files import the same `I18N` translation function
  - Ensures a stable function reference across the entire plugin
  - Prevents duplicate initializations and guarantees consistent behavior

### 5. Internal Architecture Refinement

- Consider separating **lifecycle / initialization responsibilities**
  from **pure translation and language-resolution logic**
- Introduce a clear distinction between:
  - bootstrap / runtime context management (resources, fallback resolution, app binding)
  - translation service with stable runtime behavior
- Preserve API stability while improving internal separation of concerns
- ⚠️ Defer implementation until concrete feature pressure justifies the change

---

## Long-Term Considerations

### 6. Shared Resources Across Plugins

- ✅ Contextual or namespaced keys support (since 1.0.2)
  - Achieved via TypeScript module augmentation in the README:
    ```ts
    declare module "ts-obsidian-i18n" {
      type I18NKeyMap = typeof I18NKeys;
    }
    ```
  - Ensures unique keys across the plugin
  - Provides contextual and namespaced key support without runtime overhead

- ✅ Multi-plugin shared translation resources (since 1.0.2)
  - Each plugin can augment the key map independently
  - Shared translation resources are possible while maintaining type safety
  - Guarantees compile-time checking and consistency across multiple plugins

### 7. Integration with Obsidian UI

- ❌ Integration with Obsidian settings UI for dynamic language selection
  - Not required: the current translation language is dynamically determined at each call
- ❌ Optional UI components for translation management
  - Not required: the current translation language is dynamically determined at each call
  - No additional UI elements are needed to manage or switch languages
  - The translation function always provides the desired language based on runtime context

---

## Non-Goals

The following are explicitly out of scope:

- Runtime dependency loading
- Network-based translation fetching
- External configuration files
- Heavy or full-featured i18n frameworks beyond plugin scope
- Automated type generation from resource JSON files
  - Translation keys and values are fixed at compile time
  - No runtime loading or dynamic type generation is required
- Pluggable resource loaders (JSON, YAML, or remote sources)
  - All translation resources are statically defined and bundled at build time
  - No runtime resource loading is necessary or supported

---

## Philosophy

This project prioritizes:

- Type safety and compile-time guarantees
- Predictable fallback behavior
- Build-time integration over runtime complexity
- Minimal external dependencies

Features are added only if they align with these principles.

[TOP](#roadmap) [CHANGELOG](CHANGELOG.md) [LICENSE](LICENSE) [README](README.md)
