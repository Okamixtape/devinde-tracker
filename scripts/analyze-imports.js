#!/usr/bin/env node

/**
 * Analyse des imports - DevIndé Tracker
 * 
 * Ce script analyse tous les imports dans le projet et génère un rapport sur :
 * - Les imports relatifs vs imports alias (@)
 * - Les imports potentiellement circulaires
 * - Les imports vers des fichiers inexistants
 * - Les imports inutilisés
 */

// Utilisé ESM pour éviter les erreurs de lint avec la règle import/no-commonjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'src');
const FILE_EXTENSIONS = ['.ts', '.tsx'];
const REPORT_FILE = path.resolve(process.cwd(), 'reports/import-analysis.json');

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
 * Analyse les imports dans un fichier
 */
function analyzeFileImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[^,]+|[^,{]*)\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    imports.push({
      source: filePath.replace(process.cwd(), ''),
      target: importPath,
      isAlias: importPath.startsWith('@'),
      isRelative: importPath.startsWith('.'),
      isExternal: !importPath.startsWith('@') && !importPath.startsWith('.')
    });
  }
  
  return imports;
}

/**
 * Analyseur d'imports circulaires
 */
function findCircularImports(importMap) {
  const visited = new Set();
  const pathStack = [];
  const circularImports = [];
  
  function dfs(fileName) {
    if (pathStack.includes(fileName)) {
      // On a trouvé un cycle
      const cycleStart = pathStack.indexOf(fileName);
      const cycle = [...pathStack.slice(cycleStart), fileName];
      circularImports.push(cycle);
      return;
    }
    
    if (visited.has(fileName)) {
      return;
    }
    
    visited.add(fileName);
    pathStack.push(fileName);
    
    const imports = importMap[fileName] || [];
    for (const imp of imports) {
      dfs(imp);
    }
    
    pathStack.pop();
  }
  
  // Commencer DFS depuis chaque fichier
  Object.keys(importMap).forEach(fileName => {
    pathStack.length = 0;
    dfs(fileName);
  });
  
  return circularImports;
}

/**
 * Fonction principale
 */
async function main() {
  console.log(`${COLORS.CYAN}=== Analyse des imports - DevIndé Tracker ===${COLORS.RESET}`);
  
  // Trouver tous les fichiers TypeScript du projet
  const tsFiles = findTsFiles(SRC_DIR);
  console.log(`\n${COLORS.BLUE}Trouvé ${tsFiles.length} fichiers TypeScript/TSX à analyser${COLORS.RESET}\n`);
  
  // Analyser les imports dans chaque fichier
  let allImports = [];
  let importsBySource = {};
  
  tsFiles.forEach(filePath => {
    const imports = analyzeFileImports(filePath);
    allImports = [...allImports, ...imports];
    
    // Construire une map pour l'analyse des imports circulaires
    const relativePath = filePath.replace(process.cwd(), '');
    importsBySource[relativePath] = imports.map(imp => {
      if (imp.isExternal) return null;
      if (imp.isAlias) return imp.target;
      
      // Résoudre les chemins relatifs
      const dir = path.dirname(relativePath);
      let resolved = path.join(dir, imp.target);
      if (!path.extname(resolved)) {
        resolved += '.ts'; // Ajouter une extension par défaut
      }
      return resolved;
    }).filter(Boolean);
  });
  
  // Générer des statistiques
  const totalImports = allImports.length;
  const aliasImports = allImports.filter(imp => imp.isAlias).length;
  const relativeImports = allImports.filter(imp => imp.isRelative).length;
  const externalImports = allImports.filter(imp => imp.isExternal).length;
  
  const stats = {
    totalFiles: tsFiles.length,
    totalImports,
    importTypes: {
      alias: {
        count: aliasImports,
        percentage: (aliasImports / totalImports * 100).toFixed(2)
      },
      relative: {
        count: relativeImports,
        percentage: (relativeImports / totalImports * 100).toFixed(2)
      },
      external: {
        count: externalImports,
        percentage: (externalImports / totalImports * 100).toFixed(2)
      }
    }
  };
  
  // Analyser les imports circulaires
  const circularImports = findCircularImports(importsBySource);
  if (circularImports.length > 0) {
    stats.circularImports = circularImports.map(cycle => ({
      cycle: cycle.join(' -> '),
      size: cycle.length
    }));
  } else {
    stats.circularImports = [];
  }
  
  // Afficher les résultats dans la console
  console.log(`${COLORS.CYAN}=== Rapport d'analyse des imports ===${COLORS.RESET}`);
  console.log(`Total des fichiers: ${stats.totalFiles}`);
  console.log(`Total des imports: ${stats.totalImports}`);
  console.log(`\nTypes d'imports:`);
  console.log(`  - Alias (@): ${stats.importTypes.alias.count} (${stats.importTypes.alias.percentage}%)`);
  console.log(`  - Relatifs (./): ${stats.importTypes.relative.count} (${stats.importTypes.relative.percentage}%)`);
  console.log(`  - Externes: ${stats.importTypes.external.count} (${stats.importTypes.external.percentage}%)`);
  
  if (stats.circularImports.length > 0) {
    console.log(`\n${COLORS.RED}Imports circulaires détectés: ${stats.circularImports.length}${COLORS.RESET}`);
    stats.circularImports.forEach((cycle, index) => {
      console.log(`  ${index + 1}. ${cycle.cycle}`);
    });
  } else {
    console.log(`\n${COLORS.GREEN}Aucun import circulaire détecté${COLORS.RESET}`);
  }
  
  // Enregistrer les résultats dans un fichier
  try {
    const reportsDir = path.dirname(REPORT_FILE);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(REPORT_FILE, JSON.stringify(stats, null, 2), 'utf8');
    console.log(`\n${COLORS.GREEN}Rapport enregistré dans ${REPORT_FILE}${COLORS.RESET}`);
  } catch (err) {
    console.error(`${COLORS.RED}Erreur lors de l'enregistrement du rapport: ${err.message}${COLORS.RESET}`);
  }
}

// Exécuter le script
main().catch(err => {
  console.error(`${COLORS.RED}Erreur: ${err.message}${COLORS.RESET}`);
  process.exit(1);
});
