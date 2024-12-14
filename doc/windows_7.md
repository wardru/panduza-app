# Windows 7 x64 compatibility

## Rust toolchain

Rust dropped Windows 7 as Tier 3 (unsupported) from 1.76. Tauri 2.1 requires a minimal version of 1.77.2, and by chance it seems to be working fine. [rust-toolchain.toml](../rust-toolchain.toml) makes sure the app is compiled with a fixed version of Rust.

This caveat prevents us from using on more recent version of Rust. There might be a way to use an [unofficial Windows 7 toolchain](https://doc.rust-lang.org/rustc/platform-support/win7-windows-msvc.html) with more recent compiler versions but this needs further investigation.

## Webview

The version of the webview bundled with Tauri doesn't work and the installer fails.

Therefore we package the install without it and rely on the webview installed on the system.

The latest compatible version of the `Edge WebView2` is `v109.0.1518.78` and needs to be installed prior to installing the app.

## Service Pack

In order to work, it also requires service pack to be updated with these two update files:

`KB3020369`

`KB3125574-V4`

Webview installer and service pack update files are currently stored on Google Drive.
