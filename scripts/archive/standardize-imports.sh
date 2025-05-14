#!/bin/bash

# Script pour standardiser les imports en utilisant l'alias @
# Remplace les imports relatifs (../../) par des imports avec alias (@/app)

echo "Standardisation des imports..."

# 1. Rechercher et remplacer les imports de services avec chemin relatif
find src -type f -name "*.ts*" -exec sed -i '' 's|from "\.\./\.\./services|from "@/app/services|g' {} \;
find src -type f -name "*.ts*" -exec sed -i '' "s|from '\.\./\.\./services|from '@/app/services|g" {} \;

# 2. Rechercher et remplacer les imports de components avec chemin relatif
find src -type f -name "*.ts*" -exec sed -i '' 's|from "\.\./\.\./components|from "@/app/components|g' {} \;
find src -type f -name "*.ts*" -exec sed -i '' "s|from '\.\./\.\./components|from '@/app/components|g" {} \;

# 3. Rechercher et remplacer les imports de hooks avec chemin relatif
find src -type f -name "*.ts*" -exec sed -i '' 's|from "\.\./\.\./hooks|from "@/app/hooks|g' {} \;
find src -type f -name "*.ts*" -exec sed -i '' "s|from '\.\./\.\./hooks|from '@/app/hooks|g" {} \;

# 4. Rechercher et remplacer les imports de contexts avec chemin relatif
find src -type f -name "*.ts*" -exec sed -i '' 's|from "\.\./\.\./contexts|from "@/app/contexts|g' {} \;
find src -type f -name "*.ts*" -exec sed -i '' "s|from '\.\./\.\./contexts|from '@/app/contexts|g" {} \;

# 5. Rechercher et remplacer les imports de utils avec chemin relatif
find src -type f -name "*.ts*" -exec sed -i '' 's|from "\.\./\.\./utils|from "@/app/utils|g' {} \;
find src -type f -name "*.ts*" -exec sed -i '' "s|from '\.\./\.\./utils|from '@/app/utils|g" {} \;

# 6. Rechercher et remplacer les imports généraux avec chemin relatif triple (../../..)
find src -type f -name "*.ts*" -exec sed -i '' 's|from "\.\./\.\./\.\./|from "@/app/|g' {} \;
find src -type f -name "*.ts*" -exec sed -i '' "s|from '\.\./\.\./\.\./|from '@/app/|g" {} \;

echo "Standardisation des imports terminée !"
