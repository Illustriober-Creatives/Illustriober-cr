#!/bin/bash

# Install Awesome Skills to any project
# Usage: ./install-awesome-skills.sh [path]
# Default path: ./.awesome-skills

TARGET_PATH="${1:-./.awesome-skills}"

echo "🚀 Installing Awesome Skills to: $TARGET_PATH"
npx antigravity-awesome-skills --path "$TARGET_PATH"
echo "✅ Done! Skills installed to: $TARGET_PATH"
echo "📖 Pick a bundle in $TARGET_PATH/docs/users/bundles.md and use @skill-name in your AI assistant."
