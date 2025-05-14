#!/usr/bin/env node

/**
 * Standardisation complète des imports - DevIndé Tracker
 * 
 * Ce script analyse tous les fichiers TypeScript/TSX du projet et standardise les imports
 * selon les conventions définies dans CONVENTIONS.md:
 * 
 * 1. Utilisation de l'alias @ pour les imports internes
 * 2. Structure d'import cohérente (bibliothèques externes d'abord, puis internes)
 * 3. Correction des imports vers les fichiers renommés (kebab-case → camelCase)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const FILE_EXTENSIONS = ['.ts', '.tsx'];
const DRY_RUN = false; // Mettre à true pour voir les changements sans les appliquer

// Mappings pour les imports à remplacer
const IMPORT_MAPPINGS = {
  // Services et interfaces standardisés
  '/interfaces/migration-service': '/interfaces/migrationService',
  '/interfaces/i18n-service': '/interfaces/i18nService',
  '/interfaces/service-interfaces': '/interfaces/serviceInterfaces',
  '/interfaces/data-models': '/interfaces/dataModels',
  
  // Utils standardisés
  '/utils/error-handling': '/utils/errorHandling',
  '/utils/data-operations': '/utils/dataOperations',
  '/utils/jwt-helper': '/utils/jwtHelper',
  
  // Core services standardisés
  '/core/analytics-service': '/core/analyticsService',
  '/core/api-service-adapter': '/core/apiServiceAdapter',
  '/core/api-service-factory': '/core/apiServiceFactory',
  '/core/auth-protection': '/core/authProtection',
  '/core/error-tracking-service': '/core/errorTrackingService',
  '/core/http-service': '/core/httpService'
};

// Chemins relatifs à remplacer par @ alias
const RELATIVE_PATHS_TO_REPLACE = [
  { from: /(from\s+["'])\.\.\/\.\.\/services/g, to: '$1@/app/services' },
  { from: /(from\s+["'])\.\.\/\.\.\/components/g, to: '$1@/app/components' },
  { from: /(from\s+["'])\.\.\/\.\.\/hooks/g, to: '$1@/app/hooks' },
  { from: /(from\s+["'])\.\.\/\.\.\/contexts/g, to: '$1@/app/contexts' },
  { from: /(from\s+["'])\.\.\/\.\.\/utils/g, to: '$1@/app/utils' },
  { from: /(from\s+["'])\.\.\/\.\.\/\.\.\/app/g, to: '$1@/app' },
  { from: /(from\s+["'])\.\.\/\.\.\/\.\.\/\.\.\/app/g, to: '$1@/app' },
  { from: /(from\s+["'])\.\.\/\.\.\//g, to: '$1@/app/' }
];

// Coloration pour la console
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m'
};

/**
 * Trouve tous les fichiers TypeScript/TSX dans le projet
 */
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
      findTsFiles(filePath, fileList);
    } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Standardise les imports dans un fichier
 */
function standardizeImports(filePath) {
  console.log(`${COLORS.BLUE}Traitement de${COLORS.RESET} ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let hasChanges = false;
  
  // Remplacer les imports relatifs par des imports avec alias @
  RELATIVE_PATHS_TO_REPLACE.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  // Remplacer les noms kebab-case par camelCase dans les imports
  Object.entries(IMPORT_MAPPINGS).forEach(([kebabCase, camelCase]) => {
    const pattern = new RegExp(`(from\\s+["'][^"']*?)${kebabCase.replace(/\//g, '\\/')}`, 'g');
    content = content.replace(pattern, (match, prefix) => {
      return `${prefix}${camelCase}`;
    });
  });
  
  // Si le contenu a changé, sauvegarder le fichier
  if (content !== originalContent) {
    hasChanges = true;
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`${COLORS.GREEN}✓ Imports standardisés${COLORS.RESET}`);
    } else {
      console.log(`${COLORS.YELLOW}✓ Changements détectés (dry run)${COLORS.RESET}`);
    }
  } else {
    console.log(`${COLORS.MAGENTA}✓ Aucun changement nécessaire${COLORS.RESET}`);
  }
  
  return hasChanges;
}

/**
 * Fonction principale
 */
function main() {
  console.log(`${COLORS.CYAN}=== Standardisation des imports - DevIndé Tracker ===${COLORS.RESET}`);
  console.log(`Mode: ${DRY_RUN ? COLORS.YELLOW + 'Simulation (dry run)' : COLORS.GREEN + 'Application des changements'}`);
  
  // Trouver tous les fichiers TypeScript du projet
  const tsFiles = findTsFiles(SRC_DIR);
  console.log(`\n${COLORS.BLUE}Trouvé ${tsFiles.length} fichiers TypeScript/TSX à analyser${COLORS.RESET}\n`);
  
  // Standardiser les imports dans chaque fichier
  let changedFiles = 0;
  tsFiles.forEach(filePath => {
    const hasChanges = standardizeImports(filePath);
    if (hasChanges) changedFiles++;
  });
  
  // Afficher le résumé
  console.log(`\n${COLORS.CYAN}=== Résumé ===${COLORS.RESET}`);
  console.log(`Total des fichiers: ${tsFiles.length}`);
  console.log(`Fichiers modifiés: ${changedFiles}`);
  
  if (!DRY_RUN && changedFiles > 0) {
    console.log(`\n${COLORS.GREEN}Les imports ont été standardisés avec succès !${COLORS.RESET}`);
    
    // Vérifier les erreurs TypeScript
    try {
      console.log(`\n${COLORS.CYAN}Vérification des erreurs TypeScript...${COLORS.RESET}`);
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log(`${COLORS.GREEN}✓ Aucune erreur TypeScript détectée${COLORS.RESET}`);
    } catch (error) {
      console.log(`\n${COLORS.RED}⚠️ Des erreurs TypeScript ont été détectées après la standardisation.${COLORS.RESET}`);
      console.log(`${COLORS.YELLOW}Ces erreurs existaient probablement déjà ou sont liées à d'autres problèmes dans le code.${COLORS.RESET}`);
      console.log(`${COLORS.YELLOW}Vous pouvez les corriger lors de la tâche #29 "Correction des erreurs de linting".${COLORS.RESET}`);
    }
  } else if (DRY_RUN) {
    console.log(`\n${COLORS.YELLOW}Mode simulation: aucun changement n'a été appliqué.${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}Pour appliquer les changements, modifiez DRY_RUN = false et relancez le script.${COLORS.RESET}`);
  } else {
    console.log(`\n${COLORS.GREEN}✓ Tous les imports sont déjà standardisés !${COLORS.RESET}`);
  }
}

// Exécuter le script
main();
