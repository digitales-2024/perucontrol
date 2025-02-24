#!/bin/bash

cd backend
echo "🔨  Backend quick build check..."
if ! dotnet build --nologo; then
    echo "❌ Build failed! Fix compilation errors before pushing"
    exit 1
fi
echo "✅ Build succeeded!"
exit 0

