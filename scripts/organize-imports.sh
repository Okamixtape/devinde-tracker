#!/bin/bash

# Script pour organiser les imports dans le projet DevIndé Tracker

echo "Début de l'organisation des imports..."

# 1. Nettoyer les imports inutilisés (simple, ne couvre pas tous les cas)
find src -type f -name "*.ts*" -exec sed -i '' 's/^import {.*} from.*\/\/.*$//' {} \;

# 2. Convertir les imports relatifs en imports avec alias @
# Remplacer les imports qui commencent par ../.. par des imports avec @/app
find src -type f -name "*.ts*" -exec sed -i '' 's|"../../|"@/app/|g' {} \;
find src -type f -name "*.ts*" -exec sed -i '' "s|'../../|'@/app/|g" {} \;

# 3. Remplacer les imports qui commencent par ../../../ par des imports avec @/
find src -type f -name "*.ts*" -exec sed -i '' 's|"../../../|"@/|g' {} \;
find src -type f -name "*.ts*" -exec sed -i '' "s|'../../../|'@/|g" {} \;

echo "Organisation des imports terminée!"
echo "Note: Les imports ont été standardisés pour utiliser l'alias @ au lieu des chemins relatifs."
echo "Pour une organisation plus complète et le nettoyage des imports non utilisés, envisagez d'utiliser un outil dédié comme 'import-sort' ou 'prettier'."
