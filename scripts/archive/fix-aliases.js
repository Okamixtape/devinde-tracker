// fix-aliases.js
// Script pour corriger les chemins d'importation qui utilisent des alias incorrects

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Motifs de correction pour les chemins d'alias incorrects
const aliasCorrections = [
  // Corriger les chemins qui pointent vers @/app/interfaces/
  {
    find: /from\s+["']@\/app\/interfaces\/([^"']+)["']/g,
    replace: 'from "@/app/services/interfaces/$1"'
  },
  {
    find: /import\s+{[^}]+}\s+from\s+["']@\/app\/interfaces\/([^"']+)["']/g,
    replace: (match) => match.replace('@/app/interfaces/', '@/app/services/interfaces/')
  },
  // Corriger les chemins qui pointent vers @/app/utils/
  {
    find: /from\s+["']@\/app\/utils\/([^"']+)["']/g,
    replace: 'from "@/app/services/utils/$1"'
  },
  {
    find: /import\s+{[^}]+}\s+from\s+["']@\/app\/utils\/([^"']+)["']/g,
    replace: (match) => match.replace('@/app/utils/', '@/app/services/utils/')
  },
  // Corriger les exports dans services/index.ts
  {
    find: /export \* from ["']\.\.\/interfaces\/([^"']+)["']/g,
    replace: 'export * from "./interfaces/$1"'
  },
  // Corriger les chemins pour migrations/index
  {
    find: /from\s+["']@\/app\/migrations\/index["']/g,
    replace: 'from "@/app/services/migrations/index"'
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
  
  // Appliquer toutes les corrections
  for (const pattern of aliasCorrections) {
    content = content.replace(pattern.find, pattern.replace);
  }
  
  // Si le contenu a changé, écrire les modifications dans le fichier
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    filesModified++;
    
    // Compter approximativement le nombre de chemins corrigés
    const count = originalContent.split('@/app/interfaces/').length - 1 + 
                 originalContent.split('@/app/utils/').length - 1;
    pathsFixed += count;
    
    console.log(`Fixed aliases in ${relativeFilePath}`);
  }
});

console.log(`\nSummary:`);
console.log(`Checked ${filesChecked} files`);
console.log(`Modified ${filesModified} files`);
console.log(`Fixed approximately ${pathsFixed} import alias paths total`);
