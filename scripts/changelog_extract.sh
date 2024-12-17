#!/bin/bash

# Script to extract a changelog section and corresponding hyperlink for a specific version
#TODO: Ideally this would be ported to hallmark

# Ensure a version and changelog arguments is provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <version> <changelog_file>"
    exit 1
fi

# Command-line argument
VERSION="$1"
CHANGELOG_FILE="$2"

# Check if the file exists
if [ ! -f "$CHANGELOG_FILE" ]; then
    echo "File not found: $CHANGELOG_FILE"
    exit 1
fi

# Check if version is a valid semantic version
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Invalid version: $VERSION"
    exit 1
fi

# Extract the section for the specified version
section=$(sed -n "/^## \[$VERSION\]/,/^## \[/p" "$CHANGELOG_FILE" | sed '$d')

# Extract the hyperlink for the specified version
hyperlink=$(grep -E "^\\[$VERSION\\]: " "$CHANGELOG_FILE")

if [ -z "$section" ]; then
    echo "Version $VERSION not found in $CHANGELOG_FILE"
    exit 1
fi

# Output the extracted content
echo "# Changelog"
echo
echo "$section"
if [ -n "$hyperlink" ]; then
    echo
    echo "$hyperlink"
fi
