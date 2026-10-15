#!/usr/bin/env bash
CLI_LOCATION="$(pwd)/cli"
echo "Building plugin in $(pwd)"
printf "Please input sudo password to proceed.\n"

TMP_DIR="$(pwd)/.decky-tmp"
mkdir -p "$TMP_DIR"

sudo -E $CLI_LOCATION/decky plugin build "$(pwd)" --tmp-output-path "$TMP_DIR"