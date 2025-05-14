#!/bin/bash
# Script pour corriger spécifiquement les imports service-factory

echo "Correction des imports service-factory..."

# Remplacer tous les imports de service-factory par serviceFactory
find src -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "service-factory" | xargs sed -i '' 's|service-factory|serviceFactory|g'

echo "✅ Imports service-factory corrigés !"
