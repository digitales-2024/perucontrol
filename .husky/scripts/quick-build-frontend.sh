#!/bin/bash

cd frontend
echo "🔨  Frontend quick build check..."
if ! pnpm run build; then
    echo "❌ Build failed! Fix compilation errors before pushing"
    exit 1
fi
echo "✅ Build succeeded!"
exit 0

