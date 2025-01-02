# Changelog

## [Unreleased] - YYYY-MM-DD

### Added

- Added i18n dependency
- Added translation files for english and french
- UTF-8 support
- Added number, json, enum attribute support
- Added basic widgets for enum and number
- Added memory command attribute skeleton

### Fixed

- Fixed crash on unknown attributes
- Fixed key identifier issue on info panel widgets

### Changed

- Renamed tree_panel to explorer

## [0.1.0] - 2025-01-07

### Added

- Add cargo tauri app with Next.js frontend
- Add a connection panel to set the panduza-platform ip/hostname and port
- Add rumqttc backend to publish and subscribe MQTT topics from panduza-platform
- Add treeview to visualize all the platform classes and attributes
- Add info panel to visualize attribute metadata
- Add support for Windows7 by fixing rust to 1.77.2
- Add build info to app, available via command line with --version or in About menu in the UI
- Add rust, typescript, javascript, markdown code formating and linting
- Add translation from localhost to 127.0.0.1 to speed up connections due to Windows DNS

[0.1.0]: https://github.com/Panduza/panduza-app/releases/tag/0.1.0
