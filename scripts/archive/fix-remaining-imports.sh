#!/bin/bash

echo "Correction des imports restants..."

# 1. Corriger les imports de migration-manager vers migrationManager
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*./migration-manager|from "./migrationManager"|g'

# 2. Corriger les imports de error-tracking-service vers errorTrackingService
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*./error-tracking-service|from "./errorTrackingService"|g'

echo "✅ Imports corrigés. L'application devrait maintenant fonctionner correctement."
