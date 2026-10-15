#!/bin/bash

set -e

DECK=deck@192.168.68.51
DEST=/home/deck/homebrew/plugins/DeckyClocker

pnpm build

# Recreate the plugin folder owned by deck, then restart the loader afterwards
ssh -t "$DECK" "sudo mkdir -p $DEST && sudo chown -R deck:deck $DEST"

rsync -rv --no-perms --no-owner --no-group --no-times \
  dist main.py plugin.json package.json LICENSE py_modules \
  "$DECK:$DEST/"

ssh -t "$DECK" "sudo systemctl restart plugin_loader"