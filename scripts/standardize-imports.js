// standardize-imports.js
// Script pour standardiser toutes les importations en utilisant l'alias @

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Motifs de chemins à standardiser
const importPatterns = [
  // Standardiser les chemins relatifs vers les services
  {
    find: /from\s+["']\.\.\/services\/(interfaces|utils|core)\/([^"']+)["']/g,
    replace: 'from "@/app/services/$1/$2"'
  },
  // Standardiser les chemins relatifs vers app/
  {
    find: /from\s+["']\.\.\/([^.][^"'/]+)\/([^"']+)["']/g,
    replace: (match, folder, file) => {
      // Éviter de remplacer les importations relatifs ../utils, ../interfaces, ../components
      if (['utils', 'interfaces', 'core', 'components'].includes(folder)) {
        return match;
      }
      return `from "@/app/${folder}/${file}"`;
    }
  },
  // Standardiser les imports du service des erreurs
  {
    find: /from\s+["']\.\.\/(utils|services\/utils)\/errorHandling["']/g,
    replace: 'from "@/app/services/utils/errorHandling"'
  },
  {
    find: /import\s+{[^}]+}\s+from\s+["']\.\.\/(utils|services\/utils)\/errorHandling["']/g,
    replace: (match) => match.replace(/['"]\.\.\/(utils|services\/utils)\/errorHandling['"]/, '"@/app/services/utils/errorHandling"')
  },
  // Standardiser les imports des composants
  {
    find: /from\s+["']\.\.\/components\/([^"']+)["']/g,
    replace: 'from "@/app/components/$1"'
  },
  {
    find: /import\s+{[^}]+}\s+from\s+["']\.\.\/components\/([^"']+)["']/g,
    replace: (match) => match.replace(/['"]\.\.\/components\/(['"])/g, '"@/app/components/$1')
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
  for (const pattern of importPatterns) {
    content = content.replace(pattern.find, pattern.replace);
  }
  
  // Si le contenu a changé, écrire les modifications dans le fichier
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    filesModified++;
    
    // Compter approximativement le nombre de chemins corrigés
    const matches = [...originalContent.matchAll(/from\s+["'][.][.][/]/g)];
    pathsFixed += matches.length;
    
    console.log(`Fixed imports in ${relativeFilePath}`);
  }
});

console.log(`\nSummary:`);
console.log(`Checked ${filesChecked} files`);
console.log(`Modified ${filesModified} files`);
console.log(`Fixed approximately ${pathsFixed} import paths total`);
