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
