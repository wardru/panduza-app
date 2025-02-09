# Changelog

## [UnReleased] - YYYY-MM-DD

### Changed

- Dropped NextJS and migrated to Vite
- Bumped Tauri to 2.2.5
- Unpined Rust 1.77.2

### Added

### Removed

- **Breaking**: Removed Windows7 build support, since Rust 1.77.2 was last supported version on Windows7

### Fixed

## [0.2.0] - 2025-02-04

### Changed

- Refactored `Properties` to reflect settings and info fields ([#148](https://github.com/Panduza/panduza-app/pull/148))
- Renamed `Tree Panel` to `Explorer`
- Renamed `Info Panel` to `Properties` to better reflect that it displays attribute properties
- Renamed the attribute method setValue() to the more descriptive publish()

### Added

- Added a control view with node visualization, a minimap, and basic controls
- Added generic widgets for control view nodes, for attributes of type si, number, boolean, enum, and string ([#16](https://github.com/Panduza/panduza-app/issues/16))
- Added class and driver node instantiation ([#19](https://github.com/Panduza/panduza-app/issues/19))
- Added automatic load/save functionality at application start/close, and with shortcuts (Ctrl+S), for connection data, control view, and language ([#17](https://github.com/Panduza/panduza-app/issues/17))
- Added undo/redo functionality for the last 100 node actions (create, delete, move) with shortcuts (Ctrl+Z / Ctrl+Shift+Z) ([#63](https://github.com/Panduza/panduza-app/issues/63))
- Added helper lines in the control view when unlocked to improve node alignment ([#149](https://github.com/Panduza/panduza-app/issues/149))
- Added copy/paste/cut functionality for nodes with shortcuts (Ctrl+C / Ctrl+V / Ctrl+X) ([#86](https://github.com/Panduza/panduza-app/issues/86))
- Added select/unselect functionality for nodes with shortcuts (Ctrl+A / Esc)
- Added a context menu in the tree view (right-click) to copy attribute metadata to the system clipboard ([#52](https://github.com/Panduza/panduza-app/issues/52))
- Added graph node with a demo sinewave, node is created on (Ctrl+G) shortcut ([#15](https://github.com/Panduza/panduza-app/issues/15))
- Added node animation on new platform data subscription
- Added a REPL custom widget in the control view ([#26](https://github.com/Panduza/panduza-app/issues/26))
- Added connection state management for control view nodes
- Added i18n dependency for translations ([#20](https://github.com/Panduza/panduza-app/issues/20))
- Added translation files for English and French
- Added UTF-8 support for platform payloads (units, accents, etc.)
- Added a preliminary basic widget for future file-type attributes ([#13](https://github.com/Panduza/panduza-app/issues/13))

### Removed

- Removed attribute representation in the `Info Panel`, as it's now available via the control view

### Fixed

- Fixed tree view drag-and-drop ([#18](https://github.com/Panduza/panduza-app/issues/18))
- Fixed a crash on unknown attributes

## [0.1.0] - 2025-01-07

### Added

- Added a Cargo Tauri app with a Next.js frontend
- Added a connection panel to set the panduza-platform IP/hostname and port
- Added a rumqttc backend to publish and subscribe to MQTT topics from panduza-platform
- Added a `Info Panel` representation for attributes of type si, number, enum, string, and json
- Added a tree view to visualize all platform classes and attributes
- Added an info panel to display attribute metadata
- Added support for Windows 7 by fixing Rust to version 1.77.2
- Added build info to the app, accessible via the command line (--version) or the `About` menu in the UI
- Added Rust, TypeScript, JavaScript, and Markdown formatting and linting
- Added translation from `localhost` to `127.0.0.1` to speed up connections due to Windows DNS

[0.2.0]: https://github.com/Panduza/panduza-app/releases/tag/0.2.0
[0.1.0]: https://github.com/Panduza/panduza-app/releases/tag/0.1.0
