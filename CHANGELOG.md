# Changelog

## [Unreleased] - YYYY-MM-DD

### Changed

- Renamed attribute method setValue() to more descriptive publish()
- Renamed tree_panel to explorer
- Renamed Info Panel to Properties to express that these are attribute properties

### Added

- Added Undo/Redo functionality for the last 100 node actions (create, delete, move) with shortcuts (Ctrl+Z / Ctrl+Shift+Z)
- Added node animation on new platform data
- Added class and driver nodes instanciation
- Added REPL custom widget in control view
- Added generic widgets for control view nodes
- Added connection state management for control view nodes
- Added control view with node visualization, minimap, basic controls
- Added i18n dependency
- Added translation files for english and french
- Added UTF-8 support to platform payloads (units, accents, ...)
- Added tree view representation of attributes of type si, number, enum, string and json
- Added basic widgets for attributes of type si, number, bolean, enum and string
- Added basic premliminary widget for future attribute of type file
- Added memory command attribute skeleton

### Removed

- Removed attribute instantiation on the Info Panel, since it's available via ControlView

### Fixed

- Fixed treeview drag and drop #18
- Fixed crash on unknown attributes
- Fixed key identifier issue on info panel widgets

## [0.1.0] - 2025-01-07

### Added

- Added cargo tauri app with Next.js frontend
- Added a connection panel to set the panduza-platform ip/hostname and port
- Added rumqttc backend to publish and subscribe MQTT topics from panduza-platform
- Added treeview to visualize all the platform classes and attributes
- Added info panel to visualize attribute metadata
- Added support for Windows7 by fixing rust to 1.77.2
- Added build info to app, available via command line with --version or in About menu in the UI
- Added rust, typescript, javascript, markdown code formating and linting
- Added translation from localhost to 127.0.0.1 to speed up connections due to Windows DNS

[0.1.0]: https://github.com/Panduza/panduza-app/releases/tag/0.1.0
