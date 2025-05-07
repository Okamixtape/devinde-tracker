#!/bin/bash
# Script pour mettre à jour automatiquement tous les imports
# en kebab-case vers camelCase

echo "Mise à jour des imports en camelCase..."

# 1. Mettre à jour les imports data-models.ts → dataModels.ts
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*['\''"].*interfaces/data-models['\''"]|from "../services/interfaces/dataModels"|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*['\''"].*\/data-models['\''"]|from "../interfaces/dataModels"|g'

# 2. Mettre à jour les imports service-interfaces.ts → serviceInterfaces.ts
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*['\''"].*interfaces/service-interfaces['\''"]|from "../services/interfaces/serviceInterfaces"|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*['\''"].*\/service-interfaces['\''"]|from "../interfaces/serviceInterfaces"|g'

# 3. Mettre à jour les imports utils/*-*.ts → utils/camelCase.ts
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*['\''"].*utils/error-handling['\''"]|from "../services/utils/errorHandling"|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*['\''"].*utils/data-operations['\''"]|from "../services/utils/dataOperations"|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*['\''"].*utils/jwt-helper['\''"]|from "../services/utils/jwtHelper"|g'

# 4. Mettre à jour les imports migrations/*-*.ts → migrations/camelCase.ts
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*['\''"].*migrations/migration-init['\''"]|from "../services/migrations/migrationInit"|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from.*['\''"].*migrations/migration-manager['\''"]|from "../services/migrations/migrationManager"|g'

# 5. Marquer la tâche comme terminée
echo "✅ Imports mis à jour avec succès !"
