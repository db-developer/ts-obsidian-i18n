[BOTTOM](#100---2026-01-03) [LICENSE](LICENSE) [ROADMAP](ROADMAP.md) [README](README.md)

# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- No additions yet

### Changed

- No changes yet

### Fixed

- No fixes yet

## [1.0.2] - 2026-01-10

- Code refactoring to improve separation of concerns and clarity.
- No functional changes.
- No breaking changes.

### Changed

- Configuration constants have been refactored into `config.ts` to 
  separate concerns more cleanly.
- Added DEFAULT_FALLBACK_LANGUAGE as a static last-resort fallback.
- Build-time plugin constants (__PLUGIN_FALLBACK_LANGUAGE__) are now
  safely encapsulated and do not leak into the public API.
- Defensive runtime checks added to prevent ReferenceError if build-time
  replacement is missing.
- PLUGIN_FALLBACK_LANGUAGE now guarantees a string value at runtime,
  even if the build-time plugin fallback is not provided.
- JSDoc added for exported constants to clarify usage, default behavior,
  and guarantees.
- VaultWithConfig type moved to types.ts to separate type definitions
  from logic.
- Notes added about separation of concerns in language resolution logic.
- Clarified the role of platform detection functions
  (getAppLocale, getBrowserLocale) as distinct from business logic.
- Clarified that resolveLanguage() implements the core fallback
  algorithm and is business logic rather than an internal utility.
- Added notes about template method pattern for further extension.
- Clarified the difference between **desired language** (from
  app or browser) and **returned language** (after applying fallback
  logic abd taking available resources into account).
- Moved creation of i18n closure to createTranslationFunction()
  to separate concerns within I18NService.
- Renamed resolveLanguage() to resolveFallback() to better reflect its
  purpose and behavior.

### Fixed

- Removed dead code in I18NService constructor.
- Clarified usage of `this` in closure by introducing `instance` variable.

## [1.0.1] - 2026-01-06

- Generic type parameter added to I18NService for stronger type safety.

### Added

- getAppLocale and getBrowserLocale functions to read Obsidian’s current
  locale setting from the vault configuration, intended for initializing
  the i18n service with the user’s preferred language.

## [1.0.0] - 2026-01-03

- Initial version

### Features

- Type-safe translation keys using `I18NKeyMap`
- Compile-time checking of translation resources
- Singleton service with `init()` and stable translation function
- Automatic fallback to build-time or default language
- Works seamlessly in multi-file plugin setups

[TOP](#changelog) [LICENSE](LICENSE) [ROADMAP](ROADMAP.md) [README](README.md)
