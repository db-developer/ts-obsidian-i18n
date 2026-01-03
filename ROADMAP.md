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

## Short-Term Goals

### 1. API Stabilization

- Review public API for long-term stability
- Ensure backwards compatibility for minor updates
- Lock down exported types and helpers

### 2. Documentation Improvements

- Add concise usage examples for common Obsidian plugin patterns
- Document recommended Rollup configurations for `__PLUGIN_FALLBACK_LANGUAGE__`
- Provide troubleshooting notes for bundling and type-checking issues

---

## Mid-Term Ideas

### 3. Extended Language Support

- Automated type generation from resource JSON files
- Optional runtime language switcher

### 4. Multi-File Plugin Usage

- Guidance for using `I18NService.init()` across multiple plugin files
- Best practices for consistent translation function references

---

## Long-Term Considerations

### 5. Shared Resources Across Plugins

- Pluggable resource loaders (JSON, YAML, or remote sources)
- Contextual or namespaced keys support
- Multi-plugin shared translation resources

### 6. Integration with Obsidian UI

- Integration with Obsidian settings UI for dynamic language selection
- Optional UI components for translation management

---

## Non-Goals

The following are explicitly out of scope:

- Runtime dependency loading
- Network-based translation fetching
- External configuration files
- Heavy or full-featured i18n frameworks beyond plugin scope

---

## Philosophy

This project prioritizes:

- Type safety and compile-time guarantees
- Predictable fallback behavior
- Build-time integration over runtime complexity
- Minimal external dependencies

Features are added only if they align with these principles.

[TOP](#roadmap) [CHANGELOG](CHANGELOG.md) [LICENSE](LICENSE) [README](README.md)