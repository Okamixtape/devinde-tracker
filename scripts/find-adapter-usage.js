/**
 * Script d'analyse de l'utilisation des adaptateurs dans les hooks
 * 
 * Ce script parcourt les fichiers de hooks pour identifier l'utilisation des méthodes d'adaptateur
 * et notamment repérer l'utilisation de méthodes dépréciées qui doivent être migrées.
 * 
 * Usage: node scripts/find-adapter-usage.js
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// Chemins
const HOOKS_DIR = path.join(__dirname, '../src/app/hooks');
const COMPONENTS_DIR = path.join(__dirname, '../src/app/components');

// Fonctions dépréciées à rechercher
const DEPRECATED_FUNCTIONS = [
  'transformToDetailedMilestones',
  'transformToDetailedTasks',
  'buildTaskHierarchy',
  'transformToCustomerSegments', 
  'transformToCompetitors',
  'transformToBusinessModel',
  'transformToClientOffers'
];

// Adaptateurs standardisés et leurs méthodes
const STANDARDIZED_ADAPTERS = [
  { name: 'ActionPlanAdapter', methods: ['toUI', 'toService', 'updateServiceWithUIChanges', 'toDetailedMilestones', 'toDetailedTasks', 'buildTaskHierarchy'] },
  { name: 'MarketAnalysisAdapter', methods: ['toUI', 'toService', 'updateServiceWithUIChanges', 'toCustomerSegments', 'toCompetitors', 'toMarketTrends'] },
  { name: 'BusinessModelAdapter', methods: ['toUI', 'toService', 'updateServiceWithUIChanges'] }
];

// Configuration de couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Analyse l'utilisation des adaptateurs dans un fichier
 */
function analyzeFile(filePath) {
  try {
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return {
        file: path.basename(filePath),
        exists: false,
        deprecated: [],
        standardized: []
      };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Rechercher les fonctions dépréciées
    const deprecated = [];
    DEPRECATED_FUNCTIONS.forEach(func => {
      const regex = new RegExp(`\\b${func}\\s*\\(`, 'g');
      const matches = content.match(regex);
      
      if (matches) {
        deprecated.push({
          function: func,
          count: matches.length,
          lines: findLineNumbers(content, func)
        });
      }
    });
    
    // Rechercher les adaptateurs standardisés
    const standardized = [];
    STANDARDIZED_ADAPTERS.forEach(adapter => {
      // Vérifier si l'adaptateur est importé
      const importRegex = new RegExp(`import\\s+.*\\{?\\s*${adapter.name}\\s*\\}?\\s+from`, 'g');
      const adapterImported = importRegex.test(content);
      
      if (adapterImported) {
        const methods = [];
        adapter.methods.forEach(method => {
          const methodRegex = new RegExp(`${adapter.name}\\.${method}\\s*\\(`, 'g');
          const matches = content.match(methodRegex);
          
          if (matches) {
            methods.push({
              method,
              count: matches.length,
              lines: findLineNumbers(content, `${adapter.name}.${method}`)
            });
          }
        });
        
        if (methods.length > 0) {
          standardized.push({
            adapter: adapter.name,
            methods
          });
        }
      }
    });
    
    return {
      file: fileName,
      exists: true,
      deprecated,
      standardized
    };
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error);
    return {
      file: path.basename(filePath),
      exists: true,
      error: error.message,
      deprecated: [],
      standardized: []
    };
  }
}

/**
 * Trouve les numéros de ligne où apparaît un pattern
 */
function findLineNumbers(content, pattern) {
  const lines = content.split('\n');
  const lineNumbers = [];
  
  lines.forEach((line, index) => {
    if (line.includes(pattern)) {
      lineNumbers.push(index + 1);
    }
  });
  
  return lineNumbers;
}

/**
 * Analyse tous les fichiers dans un répertoire
 */
function analyzeDirectory(dir, extension = '.ts') {
  // Vérifier si le répertoire existe
  if (!fs.existsSync(dir)) {
    console.error(`Le répertoire ${dir} n'existe pas!`);
    return [];
  }

  const files = fs.readdirSync(dir)
    .filter(file => file.endsWith(extension) || file.endsWith('.tsx'))
    .map(file => path.join(dir, file));
  
  const results = [];
  
  files.forEach(file => {
    const result = analyzeFile(file);
    
    // Ajouter uniquement les fichiers avec des résultats intéressants
    if (result.deprecated.length > 0 || result.standardized.length > 0 || result.error) {
      results.push(result);
    }
  });
  
  return results;
}

/**
 * Analyse récursivement un répertoire et ses sous-répertoires
 */
function analyzeDirectoryRecursive(dir, extension = '.ts') {
  let results = [];
  
  // Vérifier si le répertoire existe
  if (!fs.existsSync(dir)) {
    console.error(`Le répertoire ${dir} n'existe pas!`);
    return results;
  }
  
  // Analyser les fichiers du répertoire courant
  results = results.concat(analyzeDirectory(dir, extension));
  
  // Analyser récursivement les sous-répertoires
  const subDirs = fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(dir, dirent.name));
  
  subDirs.forEach(subDir => {
    results = results.concat(analyzeDirectoryRecursive(subDir, extension));
  });
  
  return results;
}

/**
 * Affiche le rapport d'analyse
 */
function displayReport(results) {
  console.log('\n=== RAPPORT D\'ANALYSE DES HOOKS ET COMPOSANTS ===\n');
  
  // Statistiques globales
  const totalFiles = results.length;
  const filesWithDeprecated = results.filter(r => r.deprecated.length > 0).length;
  const filesWithStandardized = results.filter(r => r.standardized.length > 0).length;
  
  console.log(`${colors.blue}Fichiers analysés : ${colors.reset}${totalFiles}`);
  console.log(`${colors.yellow}Fichiers utilisant des méthodes dépréciées : ${colors.reset}${filesWithDeprecated}`);
  console.log(`${colors.green}Fichiers utilisant des adaptateurs standardisés : ${colors.reset}${filesWithStandardized}`);
  
  // Tri des résultats par nombre de méthodes dépréciées (priorité de migration)
  results.sort((a, b) => {
    const aDeprecatedCount = a.deprecated.reduce((sum, d) => sum + d.count, 0);
    const bDeprecatedCount = b.deprecated.reduce((sum, d) => sum + d.count, 0);
    return bDeprecatedCount - aDeprecatedCount;
  });
  
  // Afficher les détails pour chaque fichier
  results.forEach(result => {
    if (result.deprecated.length > 0 || result.standardized.length > 0) {
      console.log(`\n${colors.cyan}${result.file}${colors.reset}`);
      
      if (result.deprecated.length > 0) {
        console.log(`  ${colors.yellow}Méthodes dépréciées :${colors.reset}`);
        result.deprecated.forEach(d => {
          console.log(`    - ${d.function} : ${d.count} utilisation(s) (lignes: ${d.lines.join(', ')})`);
        });
      }
      
      if (result.standardized.length > 0) {
        console.log(`  ${colors.green}Adaptateurs standardisés :${colors.reset}`);
        result.standardized.forEach(s => {
          console.log(`    - ${s.adapter}`);
          s.methods.forEach(m => {
            console.log(`      - ${m.method} : ${m.count} utilisation(s)`);
          });
        });
      }
    }
  });
  
  // Génération des recommandations de migration
  console.log('\n=== RECOMMANDATIONS DE MIGRATION ===\n');
  
  const highPriorityFiles = results
    .filter(r => r.deprecated.length > 0)
    .sort((a, b) => {
      const aCount = a.deprecated.reduce((sum, d) => sum + d.count, 0);
      const bCount = b.deprecated.reduce((sum, d) => sum + d.count, 0);
      return bCount - aCount;
    })
    .slice(0, 5); // Top 5
  
  if (highPriorityFiles.length > 0) {
    console.log(`${colors.magenta}Fichiers prioritaires à migrer :${colors.reset}`);
    highPriorityFiles.forEach((file, index) => {
      const deprecatedCount = file.deprecated.reduce((sum, d) => sum + d.count, 0);
      console.log(`  ${index + 1}. ${file.file} (${deprecatedCount} utilisations de méthodes dépréciées)`);
    });
  } else {
    console.log(`${colors.green}Aucun fichier prioritaire à migrer.${colors.reset}`);
  }
  
  // Génération d'un rapport détaillé au format MD
  generateMigrationReport(results);
}

/**
 * Génère un rapport de migration au format Markdown
 */
function generateMigrationReport(results) {
  const reportPath = path.join(__dirname, 'adapter-migration-report.md');
  
  let reportContent = '# Rapport de Migration des Adaptateurs\n\n';
  reportContent += `Date de génération: ${new Date().toLocaleString()}\n\n`;
  
  // Statistiques globales
  const totalFiles = results.length;
  const filesWithDeprecated = results.filter(r => r.deprecated.length > 0).length;
  const filesWithStandardized = results.filter(r => r.standardized.length > 0).length;
  
  reportContent += '## Résumé\n\n';
  reportContent += `- **Fichiers analysés**: ${totalFiles}\n`;
  reportContent += `- **Fichiers utilisant des méthodes dépréciées**: ${filesWithDeprecated}\n`;
  reportContent += `- **Fichiers utilisant des adaptateurs standardisés**: ${filesWithStandardized}\n\n`;
  
  // Plan de Migration
  reportContent += '## Plan de Migration\n\n';
  
  // Tri par priorité (nombre d'utilisations de méthodes dépréciées)
  const prioritizedFiles = [...results]
    .filter(r => r.deprecated.length > 0)
    .sort((a, b) => {
      const aCount = a.deprecated.reduce((sum, d) => sum + d.count, 0);
      const bCount = b.deprecated.reduce((sum, d) => sum + d.count, 0);
      return bCount - aCount;
    });
  
  reportContent += '### Fichiers à Migrer en Priorité\n\n';
  reportContent += '| Fichier | Méthodes Dépréciées | Nombre Total d\'Utilisations |\n';
  reportContent += '|---------|---------------------|-----------------------------|\n';
  
  prioritizedFiles.forEach(file => {
    const deprecatedMethods = file.deprecated.map(d => d.function).join(', ');
    const totalUsages = file.deprecated.reduce((sum, d) => sum + d.count, 0);
    reportContent += `| ${file.file} | ${deprecatedMethods} | ${totalUsages} |\n`;
  });
  
  // Détails par fichier
  reportContent += '\n## Détails par Fichier\n\n';
  
  results.forEach(result => {
    if (result.deprecated.length > 0 || result.standardized.length > 0) {
      reportContent += `### ${result.file}\n\n`;
      
      if (result.deprecated.length > 0) {
        reportContent += '#### Méthodes Dépréciées\n\n';
        reportContent += '| Méthode | Nombre d\'Utilisations | Lignes |\n';
        reportContent += '|---------|------------------------|--------|\n';
        
        result.deprecated.forEach(d => {
          reportContent += `| ${d.function} | ${d.count} | ${d.lines.join(', ')} |\n`;
        });
        
        reportContent += '\n';
      }
      
      if (result.standardized.length > 0) {
        reportContent += '#### Adaptateurs Standardisés\n\n';
        
        result.standardized.forEach(s => {
          reportContent += `**${s.adapter}**\n\n`;
          reportContent += '| Méthode | Nombre d\'Utilisations |\n';
          reportContent += '|---------|------------------------|\n';
          
          s.methods.forEach(m => {
            reportContent += `| ${m.method} | ${m.count} |\n`;
          });
          
          reportContent += '\n';
        });
      }
    }
  });
  
  // Guide de Migration
  reportContent += '## Guide de Migration\n\n';
  reportContent += 'Pour chaque méthode dépréciée, utilisez le tableau de correspondance suivant :\n\n';
  
  reportContent += '| Méthode Dépréciée | Méthode Standardisée Recommandée |\n';
  reportContent += '|-------------------|----------------------------------|\n';
  reportContent += '| `transformToDetailedMilestones` | `ActionPlanAdapter.toDetailedMilestones` |\n';
  reportContent += '| `transformToDetailedTasks` | `ActionPlanAdapter.toDetailedTasks` |\n';
  reportContent += '| `buildTaskHierarchy` | `ActionPlanAdapter.buildTaskHierarchy` |\n';
  reportContent += '| `transformToCustomerSegments` | `MarketAnalysisAdapter.toCustomerSegments` |\n';
  reportContent += '| `transformToCompetitors` | `MarketAnalysisAdapter.toCompetitors` |\n';
  reportContent += '| `transformToBusinessModel` | `BusinessModelAdapter.toUI` |\n';
  reportContent += '| `transformToClientOffers` | `BusinessModelAdapter.toClientOffers` |\n\n';
  
  reportContent += '### Exemple de Migration\n\n';
  reportContent += '```typescript\n';
  reportContent += '// Avant\n';
  reportContent += 'import { transformToDetailedMilestones } from \'../adapters/ActionPlanAdapter\';\n';
  reportContent += 'const milestones = transformToDetailedMilestones(businessPlanData);\n\n';
  reportContent += '// Après\n';
  reportContent += 'import { ActionPlanAdapter } from \'../adapters/ActionPlanAdapter\';\n';
  reportContent += 'const milestones = ActionPlanAdapter.toDetailedMilestones(businessPlanData);\n';
  reportContent += '```\n';
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n${colors.green}Rapport de migration détaillé généré à : ${colors.reset}${reportPath}`);
}

// Exécution principale
console.log(`${colors.cyan}Analyse de l'utilisation des adaptateurs...${colors.reset}`);

// Analyser les hooks
console.log(`\n${colors.blue}Analyse des hooks...${colors.reset}`);
const hooksResults = analyzeDirectoryRecursive(HOOKS_DIR);

// Analyser les composants
console.log(`\n${colors.blue}Analyse des composants...${colors.reset}`);
const componentsResults = analyzeDirectoryRecursive(COMPONENTS_DIR);

// Afficher les résultats combinés
const allResults = [...hooksResults, ...componentsResults];
displayReport(allResults);
