#!/bin/bash
# Script pour nettoyer les fichiers incorrects et vérifier d'autres problèmes

echo "Nettoyage des fichiers incorrects avec 'U'..."

# Supprimer tous les fichiers avec "U" dans le nom qui ont été mal générés
find src -name "*U*.ts" -exec rm {} \;

# Vérifier et créer tous les fichiers camelCase à partir des kebab-case si nécessaire
echo "Création des versions camelCase correctes pour tous les fichiers en kebab-case..."

# Utilitaires
for file in $(find src -name "*-*.ts"); do
  base=$(basename "$file")
  dir=$(dirname "$file")
  camel=$(echo "$base" | sed 's/-\([a-z]\)/\U\1/g')
  # Créer le fichier camelCase s'il n'existe pas déjà
  if [ ! -f "$dir/$camel" ]; then
    echo "Création de $dir/$camel à partir de $file"
    cp "$file" "$dir/$camel"
  fi
done

# Mettre à jour les imports error-handling vers errorHandling
echo "Mise à jour des imports restants..."
find src -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "error-handling" | xargs sed -i '' 's|error-handling|errorHandling|g'

echo "✅ Nettoyage terminé ! L'application devrait maintenant fonctionner."
