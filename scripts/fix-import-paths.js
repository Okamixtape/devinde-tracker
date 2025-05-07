// fix-import-paths.js
// Script pour corriger automatiquement les chemins d'importation dans les fichiers TypeScript
// en remplaçant "../services/interfaces" par "../interfaces" et "../services/utils" par "../utils"

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Motifs de chemins à corriger
const pathPatterns = [
  // Chemins relatifs pour les interfaces
  { 
    find: /from\s+["']\.\.\/services\/interfaces\/([^"']+)["']/g, 
    replace: 'from "../interfaces/$1"' 
  },
  { 
    find: /import\s+{[^}]+}\s+from\s+["']\.\.\/services\/interfaces\/([^"']+)["']/g,
    replace: (match) => match.replace('../services/interfaces/', '../interfaces/')
  },
  
  // Chemins relatifs pour les utils
  { 
    find: /from\s+["']\.\.\/services\/utils\/([^"']+)["']/g, 
    replace: 'from "../utils/$1"' 
  },
  { 
    find: /import\s+{[^}]+}\s+from\s+["']\.\.\/services\/utils\/([^"']+)["']/g,
    replace: (match) => match.replace('../services/utils/', '../utils/')
  },
  
  // Chemins relatifs direct utils (pour les contextes où on est déjà dans services)
  {
    find: /from\s+["']\.\.\/utils\/([^"']+)["']/g,
    replace: 'from "../services/utils/$1"'
  },
  {
    find: /import\s+{[^}]+}\s+from\s+["']\.\.\/utils\/([^"']+)["']/g,
    replace: (match) => match.replace('../utils/', '../services/utils/')
  },
  
  // Chemins absolu avec @/app
  {
    find: /from\s+["']@\/app\/services\/interfaces\/([^"']+)["']/g,
    replace: 'from "@/app/interfaces/$1"'
  },
  {
    find: /import\s+{[^}]+}\s+from\s+["']@\/app\/services\/interfaces\/([^"']+)["']/g,
    replace: (match) => match.replace('@/app/services/interfaces/', '@/app/interfaces/')
  },
  {
    find: /from\s+["']@\/app\/services\/utils\/([^"']+)["']/g,
    replace: 'from "@/app/utils/$1"'
  },
  {
    find: /import\s+{[^}]+}\s+from\s+["']@\/app\/services\/utils\/([^"']+)["']/g,
    replace: (match) => match.replace('@/app/services/utils/', '@/app/utils/')
  }
];

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
  
  // Appliquer toutes les corrections de chemin
  for (const pattern of pathPatterns) {
    content = content.replace(pattern.find, pattern.replace);
  }
  
  // Si le contenu a changé, écrire les modifications dans le fichier
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    filesModified++;
    
    // Compter le nombre de chemins corrigés
    const matches = [...originalContent.matchAll(/\.\.\/services\/(interfaces|utils)/g)];
    pathsFixed += matches.length;
    
    console.log(`Fixed ${matches.length} paths in ${relativeFilePath}`);
  }
});

console.log(`\nSummary:`);
console.log(`Checked ${filesChecked} files`);
console.log(`Modified ${filesModified} files`);
console.log(`Fixed ${pathsFixed} import paths total`);
