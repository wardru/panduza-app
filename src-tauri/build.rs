use std::process::Command;

fn main() {
    let git_describe = Command::new("git")
        .args(["describe", "--tags", "--dirty"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim()[1..].to_string())
        .unwrap_or_else(|_| "unknown".to_string());

    println!("cargo:rustc-env=GIT_DESCRIBE={}", git_describe);

    tauri_build::build();
}
