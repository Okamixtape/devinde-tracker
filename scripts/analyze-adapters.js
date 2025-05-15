/**
 * Script d'analyse des adaptateurs pour DevIndé Tracker
 * 
 * Ce script analyse tous les fichiers adaptateurs dans src/app/adapters
 * et vérifie leur conformité aux standards définis.
 * 
 * Usage: node scripts/analyze-adapters.js
 */

const fs = require('fs');
const path = require('path');

const ADAPTERS_DIR = path.join(__dirname, '../src/app/adapters');

// Critères de standardisation à vérifier
const STANDARD_CRITERIA = [
  { name: 'Class Definition', pattern: /export\s+class\s+\w+Adapter/, description: 'Doit être défini comme une classe nommée *Adapter' },
  { name: 'Static toUI Method', pattern: /static\s+toUI\s*\(/, description: 'Doit avoir une méthode statique toUI()' },
  { name: 'Static toService Method', pattern: /static\s+toService\s*\(/, description: 'Doit avoir une méthode statique toService()' },
  { name: 'Static updateServiceWithUIChanges', pattern: /static\s+updateServiceWithUIChanges\s*\(/, description: 'Doit avoir une méthode updateServiceWithUIChanges()' },
  { name: '@standardized tag', pattern: /@standardized\s+true/, description: 'Doit inclure un tag @standardized true dans la JSDoc' },
  { name: '@version tag', pattern: /@version\s+[0-9.]+/, description: 'Doit inclure un tag @version dans la JSDoc' },
  { name: 'Null/Undefined Handling', pattern: /if\s+\(\!.*\)\s+(\{.*return|return)/, description: 'Doit gérer les cas null/undefined' },
  { name: 'Type Annotations', pattern: /\):\s*\{|\):\s*[A-Z]\w+(\[\])?/, description: 'Doit utiliser des annotations de type retour' },
  { name: 'Private Methods', pattern: /private\s+static/, description: 'Doit utiliser des méthodes privées pour les fonctions utilitaires' },
  { name: 'Default Export', pattern: /export\s+default\s+\w+Adapter/, description: 'Doit avoir un export par défaut' }
];

// Analyse un fichier adaptateur
function analyzeAdapter(filePath) {
  console.log(`\nAnalyzing ${path.basename(filePath)}`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  let conformityScore = 0;
  const missingCriteria = [];
  const passedCriteria = [];
  
  STANDARD_CRITERIA.forEach(criterion => {
    if (criterion.pattern.test(fileContent)) {
      conformityScore++;
      passedCriteria.push(criterion.name);
      console.log(`✅ ${criterion.name}`);
    } else {
      missingCriteria.push(criterion);
      console.log(`❌ ${criterion.name}: ${criterion.description}`);
    }
  });
  
  const percentage = Math.round((conformityScore / STANDARD_CRITERIA.length) * 100);
  console.log(`\nConformity Score: ${percentage}% (${conformityScore}/${STANDARD_CRITERIA.length})`);
  
  // Classification basée sur le score
  let status = 'Non standardisé';
  if (percentage === 100) {
    status = 'Entièrement standardisé';
  } else if (percentage >= 80) {
    status = 'Partiellement standardisé';
  } else if (percentage >= 50) {
    status = 'Standardisation en cours';
  }
  console.log(`Status: ${status}`);
  
  return {
    name: path.basename(filePath),
    status,
    score: percentage,
    missingCriteria,
    passedCriteria
  };
}

// Analyse tous les adaptateurs du répertoire
function analyzeAllAdapters() {
  // Vérifier si le répertoire existe
  if (!fs.existsSync(ADAPTERS_DIR)) {
    console.error(`Le répertoire ${ADAPTERS_DIR} n'existe pas!`);
    return;
  }

  const files = fs.readdirSync(ADAPTERS_DIR)
    .filter(file => file.includes('Adapter.ts'))
    .map(file => path.join(ADAPTERS_DIR, file));
  
  const results = [];
  console.log(`Found ${files.length} adapter files to analyze`);
  
  files.forEach(file => {
    const result = analyzeAdapter(file);
    results.push(result);
  });
  
  // Trier les résultats par score
  results.sort((a, b) => b.score - a.score);
  
  // Génération d'un rapport de synthèse
  console.log('\n=== SUMMARY REPORT ===');
  console.log('Adapter Standardization Status:');
  results.forEach(r => {
    const symbol = r.score === 100 ? '🟢' : r.score >= 80 ? '🟡' : r.score >= 50 ? '🟠' : '🔴';
    console.log(`${symbol} ${r.name}: ${r.score}% (${r.status})`);
  });
  
  // Calcul des statistiques globales
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const fullyStandardized = results.filter(r => r.score === 100).length;
  const needsWork = results.filter(r => r.score < 80).length;
  
  console.log(`\nAverage conformity score: ${Math.round(averageScore)}%`);
  console.log(`Fully standardized adapters: ${fullyStandardized}/${results.length}`);
  console.log(`Adapters needing significant work: ${needsWork}/${results.length}`);
  
  // Génération d'un rapport détaillé dans un fichier
  generateDetailedReport(results);
}

// Génère un rapport détaillé au format Markdown
function generateDetailedReport(results) {
  const reportPath = path.join(__dirname, 'adapter-standardization-report.md');
  
  let reportContent = '# Rapport de standardisation des adaptateurs\n\n';
  reportContent += `Date de génération: ${new Date().toLocaleString()}\n\n`;
  
  reportContent += '## Résumé\n\n';
  reportContent += `- ${results.length} adaptateurs analysés\n`;
  reportContent += `- ${results.filter(r => r.score === 100).length} entièrement standardisés\n`;
  reportContent += `- ${results.filter(r => r.score >= 80 && r.score < 100).length} partiellement standardisés\n`;
  reportContent += `- ${results.filter(r => r.score < 80).length} nécessitant d'importantes modifications\n\n`;
  
  reportContent += '## Critères de standardisation\n\n';
  STANDARD_CRITERIA.forEach(criterion => {
    reportContent += `- **${criterion.name}**: ${criterion.description}\n`;
  });
  
  reportContent += '\n## Résultats détaillés\n\n';
  results.forEach(result => {
    reportContent += `### ${result.name}\n\n`;
    reportContent += `- **Score**: ${result.score}%\n`;
    reportContent += `- **Status**: ${result.status}\n\n`;
    
    if (result.missingCriteria.length > 0) {
      reportContent += '#### Critères manquants\n\n';
      result.missingCriteria.forEach(criterion => {
        reportContent += `- **${criterion.name}**: ${criterion.description}\n`;
      });
      reportContent += '\n';
    }
    
    reportContent += '#### Critères validés\n\n';
    result.passedCriteria.forEach(criterion => {
      reportContent += `- ${criterion}\n`;
    });
    reportContent += '\n';
  });
  
  reportContent += '## Recommandations\n\n';
  reportContent += 'Les adaptateurs suivants devraient être standardisés en priorité:\n\n';
  
  const priorityAdapters = results
    .filter(r => r.score < 80)
    .sort((a, b) => a.score - b.score);
  
  if (priorityAdapters.length > 0) {
    priorityAdapters.forEach(adapter => {
      reportContent += `- **${adapter.name}** (${adapter.score}%)\n`;
    });
  } else {
    reportContent += '- Tous les adaptateurs sont suffisamment standardisés (>=80%).\n';
  }
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\nDetailed report generated at: ${reportPath}`);
}

// Exécution de l'analyse
analyzeAllAdapters();
