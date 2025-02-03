# Changelog

## [Unreleased] - YYYY-MM-DD

### Changed

- Renamed `Tree Panel` to `Explorer`
- Renamed `Info Panel` to `Properties` to better reflect that it displays attribute properties
- Renamed the attribute method setValue() to the more descriptive publish()

### Added

- Added helper lines in the control view when unlocked to improve node alignment
- Added copy/paste/cut functionality for nodes with shortcuts (Ctrl+C / Ctrl+V / Ctrl+X)
- Added select/unselect functionality for nodes with shortcuts (Ctrl+A / Esc)
- Added automatic load/save functionality at application start/close, and with shortcuts (Ctrl+S), for connection data, control view, and language
- Added undo/redo functionality for the last 100 node actions (create, delete, move) with shortcuts (Ctrl+Z / Ctrl+Shift+Z)
- Added a context menu in the tree view (right-click) to copy attribute metadata to the system clipboard
- Added node animation on new platform data subscription
- Added class and driver node instantiation
- Added a REPL custom widget in the control view
- Added generic widgets for control view nodes
- Added connection state management for control view nodes
- Added a control view with node visualization, a minimap, and basic controls
- Added i18n dependency for translations
- Added translation files for English and French
- Added UTF-8 support for platform payloads (units, accents, etc.)
- Added a tree view representation for attributes of type si, number, enum, string, and json
- Added basic widgets for attributes of type si, number, boolean, enum, and string
- Added a preliminary basic widget for future file-type attributes
- Added a memory command attribute skeleton

### Removed

- Removed attribute instantiation in the `Info Panel`, as it's now available via the control view

### Fixed

- Fixed tree view drag-and-drop (#18)
- Fixed a crash on unknown attributesx`

## [0.1.0] - 2025-01-07

### Added

- Added a Cargo Tauri app with a Next.js frontend
- Added a connection panel to set the panduza-platform IP/hostname and port
- Added a rumqttc backend to publish and subscribe to MQTT topics from panduza-platform
- Added a tree view to visualize all platform classes and attributes
- Added an info panel to display attribute metadata
- Added support for Windows 7 by fixing Rust to version 1.77.2
- Added build info to the app, accessible via the command line (--version) or the `About` menu in the UI
- Added Rust, TypeScript, JavaScript, and Markdown formatting and linting
- Added translation from `localhost` to `127.0.0.1` to speed up connections due to Windows DNS

[0.1.0]: https://github.com/Panduza/panduza-app/releases/tag/0.1.0
