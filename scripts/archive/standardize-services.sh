#!/bin/bash
# Script pour standardiser les noms de fichiers de services et utilitaires
# en passant de kebab-case à camelCase

# Fonction pour convertir kebab-case en camelCase
# Exemple: "error-handling" -> "errorHandling"
function to_camel_case() {
  echo "$1" | sed -E 's/-([a-z])/\U\1/g'
}

# Fonction pour créer un fichier camelCase et un lien symbolique
function create_camel_case_file() {
  local kebab_file=$1
  local dir=$(dirname "$kebab_file")
  local base_name=$(basename "$kebab_file" .ts)
  local camel_name=$(to_camel_case "$base_name")
  local camel_file="$dir/$camel_name.ts"
  
  # Si le fichier camelCase existe déjà, ne rien faire
  if [ -f "$camel_file" ]; then
    echo "Le fichier $camel_file existe déjà."
    return
  fi
  
  # Copier le contenu du fichier kebab-case vers le fichier camelCase
  cp "$kebab_file" "$camel_file"
  echo "Créé: $camel_file"
  
  # Créer un lien symbolique pour maintenir la compatibilité
  # ln -sf $(basename "$camel_file") "$kebab_file"
  # echo "Lien symbolique créé: $kebab_file -> $camel_name.ts"
}

# Traiter tous les fichiers en kebab-case dans le répertoire services
SERVICES_DIR="/Users/loupaubour/CascadeProjects/devinde-tracker/src/app/services"

# Traiter les fichiers dans core/
find "$SERVICES_DIR/core" -name "*-*.ts" | while read file; do
  create_camel_case_file "$file"
done

# Traiter les fichiers dans interfaces/
find "$SERVICES_DIR/interfaces" -name "*-*.ts" | while read file; do
  create_camel_case_file "$file"
done

# Traiter les fichiers dans migrations/
find "$SERVICES_DIR/migrations" -name "*-*.ts" | while read file; do
  create_camel_case_file "$file"
done

# Traiter les fichiers dans utils/
find "$SERVICES_DIR/utils" -name "*-*.ts" | while read file; do
  create_camel_case_file "$file"
done

echo "Standardisation terminée. Vérifiez les résultats avant de mettre à jour les imports."
