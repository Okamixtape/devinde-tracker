// fix-common-imports.js
// Script pour corriger les importations des composants communs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Motif de correction pour les chemins des composants communs
const commonComponentsFix = {
  find: /from\s+["']@\/app\/common\/([^"']+)["']/g,
  replace: 'from "@/app/components/common/$1"'
};

// Trouver tous les fichiers TypeScript/TSX dans le projet
const tsFiles = globSync('src/app/**/*.{ts,tsx}', { cwd: projectRoot });

// Compteurs pour le rapport
let filesChecked = 0;
let filesModified = 0;
let pathsFixed = 0;

console.log(`Found ${tsFiles.length} files to check...`);

// Traiter chaque fichier
tsFiles.forEach(relativeFilePath => {
  const filePath = path.join(projectRoot, relativeFilePath);
  filesChecked++;
  
  // Lire le contenu du fichier
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Appliquer la correction
  content = content.replace(commonComponentsFix.find, commonComponentsFix.replace);
  
  // Si le contenu a changé, écrire les modifications dans le fichier
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    filesModified++;
    
    // Compter approximativement le nombre de chemins corrigés
    const count = originalContent.split('@/app/common/').length - 1;
    pathsFixed += count;
    
    console.log(`Fixed common imports in ${relativeFilePath}`);
  }
});

console.log(`\nSummary:`);
console.log(`Checked ${filesChecked} files`);
console.log(`Modified ${filesModified} files`);
console.log(`Fixed approximately ${pathsFixed} common component import paths`);
