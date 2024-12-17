#!/bin/bash

# Script check changelog version and date and update it if necessary
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

# Extract the first line with `## [] - ` pattern
FIRST_LINE=$(grep -m 1 -E "^## \[.*\] - .*" "$CHANGELOG_FILE")

if [[ -z "$FIRST_LINE" ]]; then
    echo "No valid version and date found in $CHANGELOG_FILE"
    exit 1
fi

# Extract version and date using regex
CHANGELOG_VERSION=$(echo "$FIRST_LINE" | sed -E 's/^## \[(.*)\] - .*/\1/')
CHANGELOG_DATE=$(echo "$FIRST_LINE" | sed -E 's/^## \[.*\] - (.*)/\1/')

echo "Extracted Version: $CHANGELOG_VERSION"
echo "Extracted Date: $CHANGELOG_DATE"

# Compare version
if [[ "$CHANGELOG_VERSION" == "$VERSION" ]]; then
    echo "Version matches: $CHANGELOG_VERSION"
else
    echo "Version mismatch: Changelog=$CHANGELOG_VERSION, VERSION=$VERSION"
    echo "Correcting it by setting the version to $VERSION!"

    # Update the version in CHANGELOG.md
    sed -i -E "0,/^## \[.*\] - .*/{s/^## \[.*\] - (.*)/## [$VERSION] - \1/}" $CHANGELOG_FILE

    echo "Version updated to $VERSION in $CHANGELOG_FILE"
fi

# Compare date
TODAY=$(date +%Y-%m-%d)
if [[ "$CHANGELOG_DATE" == "$TODAY" ]]; then
    echo "Date matches: $CHANGELOG_DATE"
else
    echo "Date mismatch: Changelog=$CHANGELOG_DATE, Today=$TODAY"
    echo "Correcting it by setting today's date!"

    # Update the date in CHANGELOG.md
    sed -i -E "0,/^## \[.*\] - .*/{s/^## \[(.*)\] - .*/## [\1] - $TODAY/}" $CHANGELOG_FILE

    echo "Date updated to $TODAY in $CHANGELOG_FILE"
fi

# Extract the hyperlink for the specified version
hyperlink=$(grep -E "^\\[$VERSION\\]: " "$CHANGELOG_FILE")

if [ -z "$hyperlink" ]; then
    echo "Hyperlink not found for version $VERSION, adding it!"
    if grep -qE "^\[.*\]: " "$CHANGELOG_FILE"; then
        awk -v version="[$VERSION]: https://github.com/Panduza/panduza-app/releases/tag/$VERSION" '
        BEGIN { added = 0 }
        /^\[.*\]: / && !added { print version; added = 1 }
        { print }
        ' "$CHANGELOG_FILE" > tmpfile && mv tmpfile "$CHANGELOG_FILE"
    else
        echo "" >> "$CHANGELOG_FILE"
        echo "[$VERSION]: https://github.com/Panduza/panduza-app/releases/tag/$VERSION" >> "$CHANGELOG_FILE"
    fi
else
    echo "Hyperlink found for version $VERSION, nothing to do."
fi
