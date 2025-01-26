#!/bin/bash

# Get the list of staged files
CACHED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

run_lint() {
    if [ "$NO_LINT" == "1" ]; then
        echo -e "\033[33m[Lint] Skipped due to NO_LINT=1.\033[0m"
        return
    fi

    echo -e "\033[34m[Lint] Checking staged JavaScript and TypeScript files...\033[0m"
    FILES=$(echo "$CACHED_FILES" | grep -E '\.(js|jsx|ts|tsx|mjs)$')

    if [ -z "$FILES" ]; then
        echo -e "\033[32m[Lint] No JavaScript or TypeScript files staged for linting.\033[0m"
        return
    fi
    if [ ! -f ./node_modules/.bin/eslint ]; then
        echo -e "\033[33m[Eslint] Dependencies not installed. Installing...\033[0m"
        npm install --force
    fi

    echo "$FILES" | xargs ./node_modules/.bin/eslint

    if [ $? -ne 0 ]; then
        echo -e "\033[31m[Lint] Linting failed. Please fix the errors before committing.\033[0m"
        exit 1
    fi

    echo -e "\033[32m[Lint] No linting issues detected.\033[0m"
}


run_clippy() {
    if [ "$NO_CLIPPY" == "1" ]; then
        echo -e "\033[33m[Clippy] Skipped due to NO_CLIPPY=1.\033[0m"
        return
    fi

    echo -e "\033[34m[Clippy] Running Clippy for Rust files...\033[0m"

    # Check if there are any staged Rust files
    RUST_FILES=$(echo "$CACHED_FILES" | grep '\.rs$')

    if [ -z "$RUST_FILES" ]; then
        echo -e "\033[32m[Clippy] No Rust files staged for Clippy checks.\033[0m"
        return
    fi

    # Run Clippy on Rust files
    cd src-tauri || { echo -e "\033[31m[Clippy] Error: src-tauri directory not found.\033[0m"; exit 1; }
    cargo clippy -- -D warnings
    if [ $? -ne 0 ]; then
        echo -e "\033[31m[Clippy] Clippy found issues. Please fix them before committing.\033[0m"
        exit 1
    fi
    cd ..

    echo -e "\033[32m[Clippy] No issues found by Clippy.\033[0m"
}

run_prettier() {
    if [ "$NO_PRETTIER" == "1" ]; then
        echo -e "\033[33m[Prettier] Skipped due to NO_PRETTIER=1.\033[0m"
        return
    fi

    echo -e "\033[34m[Prettier] Checking files staged for formatting...\033[0m"
    FILES=$(echo "$CACHED_FILES" | grep -v '\.rs$' | sed 's| |\\ |g')

    if [ -z "$FILES" ]; then
        echo -e "\033[32m[Prettier] No files staged for formatting.\033[0m"
        return
    fi

    if [ ! -f ./node_modules/.bin/prettier ]; then
        echo -e "\033[33m[Prettier] Dependencies not installed. Installing...\033[0m"
        npm install --force
    fi

    echo "$FILES" | xargs ./node_modules/.bin/prettier --ignore-unknown --write

    if [ $? -ne 0 ]; then
        echo -e "\033[31m[Formatting] Prettier failed,.\033[0m"
        exit 1
    fi


    echo "$FILES" | xargs git add
    echo -e "\033[32m[Prettier] Formatting completed. Files have been re-staged.\033[0m"
}

format_rust() {
    if [ "$NO_RUST_FMT" == "1" ]; then
        echo -e "\033[33m[Rust] Skipped due to NO_RUST_FMT=1.\033[0m"
        return
    fi

    echo -e "\033[34m[Rust] Checking Rust files staged for formatting...\033[0m"

    RUST_FILES=$(echo "$CACHED_FILES" | grep '\.rs$')

    if [ -z "$RUST_FILES" ]; then
        echo -e "\033[32m[Rust] No Rust files staged for formatting.\033[0m"
        return
    fi

    cd src-tauri
    cargo fmt
    cd ..

    echo "$RUST_FILES" | xargs git add
    echo -e "\033[32m[Rust] Formatting completed. Files have been re-staged.\033[0m"
}

if [ $# -eq 0 ]; then
    echo -e "\033[31m[Error] No arguments provided. Specify which tasks to run.\033[0m"
    exit 1
fi

for task in "$@"; do
    case $task in
        run_lint)
            run_lint
            ;;
        run_clippy)
            run_clippy
            ;;
        run_prettier)
            run_prettier
            ;;
        run_rust_fmt)
            format_rust
            ;;
        *)
            echo -e "\033[31m[Error] Unknown cmd: $task\033[0m"
            exit 1
            ;;
    esac
done

echo -e "\033[32m[Script] Selected tasks completed successfully.\033[0m"

exit 0
