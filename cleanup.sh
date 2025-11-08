#!/bin/bash

# Cleanup Script for E-commerce Project
# Removes unused files, backup files, and system files

echo "🧹 Starting cleanup..."

# Navigate to project root
cd "$(dirname "$0")"

# Count files before cleanup
BEFORE=$(find . -type f | wc -l)

echo ""
echo "📦 Removing backup files..."
find . -name "*.backup" -type f -delete
find . -name "*.bak" -type f -delete
find . -name "*.old" -type f -delete
find . -name "*.tmp" -type f -delete
echo "✅ Backup files removed"

echo ""
echo "🍎 Removing .DS_Store files..."
find . -name ".DS_Store" -type f -delete
echo "✅ .DS_Store files removed"

echo ""
echo "📁 Removing empty directories..."
# Remove old empty components directory
if [ -d "frontend1/src/components" ]; then
    if [ -z "$(ls -A frontend1/src/components 2>/dev/null)" ]; then
        rm -rf frontend1/src/components
        echo "✅ Removed empty frontend1/src/components"
    else
        echo "⚠️  frontend1/src/components not empty, keeping it"
    fi
fi

# Remove old empty styles/Pages directory if empty
if [ -d "frontend1/src/styles/Pages" ]; then
    if [ -z "$(ls -A frontend1/src/styles/Pages 2>/dev/null)" ]; then
        rm -rf frontend1/src/styles/Pages
        echo "✅ Removed empty frontend1/src/styles/Pages"
    fi
fi

echo ""
echo "🗑️  Cleaning build artifacts..."
if [ -d "frontend1/build" ]; then
    echo "  Keeping build directory (can be removed with 'rm -rf frontend1/build')"
fi

if [ -d "frontend1/node_modules/.cache" ]; then
    rm -rf frontend1/node_modules/.cache
    echo "✅ Removed node_modules cache"
fi

echo ""
echo "📊 Checking for unused npm packages..."
if command -v npx &> /dev/null; then
    cd frontend1
    echo "  Run 'npx depcheck' to find unused dependencies"
    cd ..
else
    echo "  npx not available, skipping dependency check"
fi

# Count files after cleanup
AFTER=$(find . -type f | wc -l)
REMOVED=$((BEFORE - AFTER))

echo ""
echo "✅ Cleanup complete!"
echo "📊 Files removed: $REMOVED"
echo ""
echo "Next steps:"
echo "  1. Review unused variables in build warnings"
echo "  2. Run 'npm run build' to verify everything works"
echo "  3. Consider running 'npx depcheck' in frontend1/"
