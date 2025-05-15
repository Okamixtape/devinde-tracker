/**
 * Script d'analyse des interfaces TypeScript
 * 
 * Ce script analyse les fichiers d'interfaces pour vérifier leur conformité
 * aux conventions établies dans le projet DevIndé Tracker.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const INTERFACES_DIR = path.join(__dirname, '..', 'src', 'app', 'interfaces');
const REPORT_FILE = path.join(__dirname, 'interface-standardization-report.md');

// Critères de conformité
const CONFORMITY_CRITERIA = [
  { name: 'Base Extension', check: (content) => /extends (BaseModel|ServiceModel|UIModel)/.test(content) },
  { name: 'JSDoc Documentation', check: (content) => /\/\*\*[\s\S]*?\*\/\s*export interface/.test(content) },
  { name: 'Type Annotations', check: (content) => !/(:\s*any\b|\[\](?!\s*:))/.test(content) },
  { name: 'Enum Usage', check: (content) => /export enum/.test(content) },
  { name: 'Naming Convention', check: (content) => /export interface (UI|Service)[A-Z][a-zA-Z]*Model\b/.test(content) },
  { name: 'Optional Properties', check: (content) => /\w+\?:\s*/.test(content) },
  { name: 'Model Organization', check: (filePath) => {
    const relativePath = path.relative(INTERFACES_DIR, filePath);
    return relativePath.includes(path.sep); // Vérifie si le fichier est dans un sous-dossier
  }},
  { name: 'Index Exports', check: (content, filePath) => {
    if (path.basename(filePath) === 'index.ts') {
      return /export \* from/.test(content);
    }
    return true; // Non applicable pour les fichiers non-index
  }}
];

/**
 * Analyse un fichier d'interface et retourne un score de conformité
 */
function analyzeInterfaceFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  console.log(`\nAnalyzing ${fileName}`);
  
  let conformityScore = 0;
  let details = [];
  
  CONFORMITY_CRITERIA.forEach(criterion => {
    const passes = criterion.check(content, filePath);
    if (passes) {
      conformityScore += 1;
      console.log(chalk.green(`✅ ${criterion.name}`));
      details.push(`✅ ${criterion.name}`);
    } else {
      console.log(chalk.red(`❌ ${criterion.name}`));
      details.push(`❌ ${criterion.name}: Non conforme aux standards`);
    }
  });
  
  const percentage = Math.round((conformityScore / CONFORMITY_CRITERIA.length) * 100);
  let status;
  
  if (percentage === 100) {
    status = 'Entièrement standardisé';
  } else if (percentage >= 80) {
    status = 'Partiellement standardisé';
  } else {
    status = 'Non standardisé';
  }
  
  console.log(`\nConformity Score: ${percentage}% (${conformityScore}/${CONFORMITY_CRITERIA.length})`);
  console.log(`Status: ${status}`);
  
  return {
    file: fileName,
    score: percentage,
    status,
    details,
    rawScore: conformityScore,
    maxScore: CONFORMITY_CRITERIA.length
  };
}

/**
 * Génère un rapport de conformité au format Markdown
 */
function generateReport(results) {
  let reportContent = '# Rapport de Standardisation des Interfaces\n\n';
  
  reportContent += '## Résumé\n\n';
  
  // Calcul des statistiques
  const totalFiles = results.length;
  const fullStandardized = results.filter(r => r.score === 100).length;
  const partiallyStandardized = results.filter(r => r.score >= 80 && r.score < 100).length;
  const nonStandardized = results.filter(r => r.score < 80).length;
  
  const averageScore = Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalFiles);
  
  reportContent += `- Nombre total de fichiers d'interfaces: ${totalFiles}\n`;
  reportContent += `- Score moyen de conformité: ${averageScore}%\n`;
  reportContent += `- Interfaces entièrement standardisées: ${fullStandardized}/${totalFiles}\n`;
  reportContent += `- Interfaces partiellement standardisées: ${partiallyStandardized}/${totalFiles}\n`;
  reportContent += `- Interfaces non standardisées: ${nonStandardized}/${totalFiles}\n\n`;
  
  reportContent += '## Détails par Fichier\n\n';
  
  results.forEach(result => {
    const emoji = result.score === 100 ? '🟢' : result.score >= 80 ? '🟡' : '🔴';
    
    reportContent += `### ${emoji} ${result.file}: ${result.score}%\n\n`;
    reportContent += `**Status**: ${result.status}\n\n`;
    reportContent += '**Critères**:\n';
    result.details.forEach(detail => {
      reportContent += `- ${detail}\n`;
    });
    reportContent += '\n';
  });
  
  reportContent += '## Recommandations\n\n';
  
  if (nonStandardized > 0) {
    reportContent += '### Priorité Haute\n\n';
    reportContent += 'Ces fichiers nécessitent une standardisation complète:\n\n';
    results.filter(r => r.score < 80)
      .sort((a, b) => a.score - b.score)
      .forEach(r => {
        reportContent += `- ${r.file} (${r.score}%)\n`;
      });
    reportContent += '\n';
  }
  
  if (partiallyStandardized > 0) {
    reportContent += '### Priorité Moyenne\n\n';
    reportContent += 'Ces fichiers sont partiellement standardisés et nécessitent quelques ajustements:\n\n';
    results.filter(r => r.score >= 80 && r.score < 100)
      .sort((a, b) => a.score - b.score)
      .forEach(r => {
        reportContent += `- ${r.file} (${r.score}%)\n`;
      });
    reportContent += '\n';
  }
  
  reportContent += '## Prochaines Étapes\n\n';
  reportContent += '1. Standardiser les interfaces prioritaires\n';
  reportContent += '2. Mettre à jour les adaptateurs pour utiliser les nouvelles interfaces\n';
  reportContent += '3. Créer des tests unitaires pour valider la conformité\n';
  reportContent += '4. Documenter les conventions d\'interfaces dans CONVENTIONS.md\n';
  
  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`\nRapport détaillé généré: ${REPORT_FILE}`);
}

/**
 * Fonction principale
 */
function main() {
  // Trouver tous les fichiers d'interfaces TypeScript
  const interfaceFiles = glob.sync(`${INTERFACES_DIR}/**/*.ts`);
  
  if (interfaceFiles.length === 0) {
    console.log(chalk.yellow('Aucun fichier d\'interface trouvé. Vérifiez le chemin du dossier.'));
    return;
  }
  
  console.log(`Found ${interfaceFiles.length} interface files to analyze`);
  
  const results = interfaceFiles.map(analyzeInterfaceFile);
  
  // Résumé global
  console.log('\n=== SUMMARY REPORT ===');
  console.log('Interface Standardization Status:');
  
  results.forEach(result => {
    const emoji = result.score === 100 ? '🟢' : result.score >= 80 ? '🟡' : '🔴';
    console.log(`${emoji} ${result.file}: ${result.score}% (${result.status})`);
  });
  
  const averageScore = Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);
  const fullStandardized = results.filter(r => r.score === 100).length;
  const needsWork = results.filter(r => r.score < 80).length;
  
  console.log(`\nAverage conformity score: ${averageScore}%`);
  console.log(`Fully standardized interfaces: ${fullStandardized}/${results.length}`);
  console.log(`Interfaces needing significant work: ${needsWork}/${results.length}`);
  
  // Générer le rapport détaillé
  generateReport(results);
}

// Exécution du script
main();
