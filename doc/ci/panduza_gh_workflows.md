# Panduza CI/CD - GitHub Workflows

## Summary

The GitHub actions workflows used in `panduza-app` CI/CD are the following:

- **[Format & Lint](../../.github/workflows/format_lint.yml)**: Runs cargo fmt and clippy and npm eslint and prettier. Executes automatically on `pull requests` and on `pushes to main`.

- **[Build](../../.github/workflows/build.yml)**: Updates npm and cargo dependencies and builds the tauri app in release mode. This workflow is currently manually triggered. The `branch`, `platform {ubuntu, windows, macos}`, and `appimage {true, false}` options can be selected. The `appimage` option can be used, on `ubuntu`, to save on artifact size, these files are much bigger than the other artifacts (approx. 20x bigger).

- **[Release](../../.github/workflows/release.yml)**: This worflow is manually triggered, and the user can specify a `version` (needs to follow the semver format, without `v` prefix). The worflow starts running the format and lint, and build workflows on the selected release branch (most often `main`). This ensures that no potential failures are present on release branch before proceeding to a release. It then checks that l`CHANGELOG.md` date matches today's date, it also checks consistency of `version` across [CHANGELOG.md](../CHANGELOG.md), [Cargo.toml](../src-tauri/Cargo.toml), [Cargo.lock](../src-tauri/Cargo.lock), [package.json](../package.json), [package.lock.json](../package-lock.json) by bumping all entries. These changes are committed and signed by `github-actions[bot]`and pushed. Next an ~~annotated signed~~\* lightweigth tag is generated also by `github-actions[bot]` and pushed. Since the application embeddes the tag for versioning purposes, we need to re-run the build flow once more, but this time on the tag reference. Finally the GitHub release is generated with release notes matching the `CHANGELOG.md` section for the current version. All the build artifacts are also added to the list of release assets.

\* Currently GitHub seems to have a limitation on generating signed annotated tags with it's API, and thus we opt to have lightweight tag, till the issue is fixed. Signed annotated tags can always be generated manually, replacing the lightweigth ones. [See issue](https://github.com/orgs/community/discussions/4924).
