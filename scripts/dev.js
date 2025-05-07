#!/usr/bin/env node

/**
 * DevIndé Tracker - Task Management Script
 * 
 * Ce script permet de gérer les tâches du projet en suivant 
 * le cycle d'amélioration continue:
 * 1. Phase de test - Identification des problèmes
 * 2. Création/Mise à jour de tâches - Définition claire des corrections
 * 3. Implémentation - Résolution des problèmes
 * 4. Vérification - Validation et nouvelle phase de test
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Chemin vers le fichier des tâches
const TASKS_FILE = path.join(__dirname, '..', 'tasks', 'tasks.json');
const TASKS_DIR = path.join(__dirname, '..', 'tasks');

// Créer le dossier tasks s'il n'existe pas
if (!fs.existsSync(TASKS_DIR)) {
  fs.mkdirSync(TASKS_DIR, { recursive: true });
}

// Créer le fichier tasks.json s'il n'existe pas
if (!fs.existsSync(TASKS_FILE)) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify({ tasks: [] }, null, 2));
}

// Lecture des arguments de la ligne de commande
const args = process.argv.slice(2);
const command = args[0];

// Extraction des options à partir des arguments
function getOptions(args) {
  const options = {};
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value === undefined ? true : value;
    }
  });
  return options;
}

// Lecture du fichier tasks.json
function readTasks() {
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier tasks.json:', error);
    return { tasks: [] };
  }
}

// Écriture dans le fichier tasks.json
function writeTasks(tasksData) {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasksData, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'écriture dans le fichier tasks.json:', error);
    return false;
  }
}

// Création d'un ID unique pour une nouvelle tâche
function generateTaskId(tasks) {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(task => task.id)) + 1;
}

// Affichage de la liste des tâches
function listTasks(options) {
  const tasksData = readTasks();
  const tasks = tasksData.tasks || [];
  
  if (tasks.length === 0) {
    console.log('Aucune tâche trouvée.');
    return;
  }
  
  console.log('\n=== Liste des tâches ===\n');
  tasks.forEach(task => {
    const status = task.status === 'done' ? '✅' : task.status === 'pending' ? '⏳' : '❓';
    console.log(`[${status}] #${task.id}: ${task.title} (Priorité: ${task.priority})`);
    if (options.detailed) {
      console.log(`    Description: ${task.description}`);
      console.log(`    Dépendances: ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'Aucune'}`);
      console.log(`    Détails: ${task.details ? task.details.substring(0, 100) + '...' : 'Aucun'}\n`);
    }
  });
}

// Affichage des détails d'une tâche
function showTask(id) {
  const tasksData = readTasks();
  const task = tasksData.tasks.find(t => t.id === parseInt(id));
  
  if (!task) {
    console.error(`Tâche #${id} non trouvée.`);
    return;
  }
  
  console.log(`\n=== Tâche #${task.id}: ${task.title} ===\n`);
  console.log(`Status: ${task.status}`);
  console.log(`Priorité: ${task.priority}`);
  console.log(`Description: ${task.description}`);
  console.log(`Dépendances: ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'Aucune'}`);
  console.log('\nDétails:');
  console.log(task.details || 'Aucun détail');
  console.log('\nStratégie de test:');
  console.log(task.testStrategy || 'Aucune stratégie de test définie');
}

// Modification du statut d'une tâche
function setTaskStatus(id, status) {
  const tasksData = readTasks();
  const taskIndex = tasksData.tasks.findIndex(t => t.id === parseInt(id));
  
  if (taskIndex === -1) {
    console.error(`Tâche #${id} non trouvée.`);
    return;
  }
  
  tasksData.tasks[taskIndex].status = status;
  if (writeTasks(tasksData)) {
    console.log(`Status de la tâche #${id} mis à jour: ${status}`);
  }
}

// Expansion d'une tâche en sous-tâches
function expandTask(options) {
  const id = parseInt(options.id);
  const subtasks = parseInt(options.subtasks) || 3;
  const prompt = options.prompt || '';
  
  const tasksData = readTasks();
  const taskIndex = tasksData.tasks.findIndex(t => t.id === id);
  
  if (id === 0) {
    // Cas spécial: création d'une nouvelle tâche racine
    const newId = generateTaskId(tasksData.tasks);
    const lines = prompt.split('\n');
    const title = lines[0].replace('Task: ', '');
    const description = lines.slice(2).join('\n');
    
    const newTask = {
      id: newId,
      title,
      description,
      status: 'pending',
      dependencies: [],
      priority: 'high',
      details: description,
      testStrategy: 'Test manuel des fonctionnalités concernées.',
      subtasks: []
    };
    
    tasksData.tasks.push(newTask);
    
    // Création du fichier de tâche
    const taskFilePath = path.join(TASKS_DIR, `task-${newId}.md`);
    const taskFileContent = `# Task ID: ${newId}
# Title: ${title}
# Status: pending
# Dependencies: 
# Priority: high
# Description: 
${description}

# Details:
${description}

# Test Strategy:
Test manuel des fonctionnalités concernées.
`;
    
    fs.writeFileSync(taskFilePath, taskFileContent);
    
    if (writeTasks(tasksData)) {
      console.log(`Nouvelle tâche #${newId} créée: ${title}`);
    }
    
    return;
  }
  
  if (taskIndex === -1) {
    console.error(`Tâche #${id} non trouvée.`);
    return;
  }
  
  console.log(`Expansion de la tâche #${id} en ${subtasks} sous-tâches...`);
  
  // Ici vous pourriez implémenter l'expansion automatique des sous-tâches
  // Pour cet exemple simple, nous créons des sous-tâches génériques
  
  const task = tasksData.tasks[taskIndex];
  task.subtasks = task.subtasks || [];
  
  for (let i = 1; i <= subtasks; i++) {
    const subtaskId = generateTaskId(tasksData.tasks);
    const subtask = {
      id: subtaskId,
      title: `${task.title} - Partie ${i}`,
      description: `Sous-tâche ${i} pour la tâche principale #${id}`,
      status: 'pending',
      dependencies: [id],
      priority: task.priority,
      details: prompt ? `${prompt}\n\nPartie ${i}` : `Partie ${i} de la tâche principale`,
      testStrategy: 'Test manuel des fonctionnalités concernées.'
    };
    
    tasksData.tasks.push(subtask);
    task.subtasks.push(subtaskId);
    
    // Création du fichier de sous-tâche
    const taskFilePath = path.join(TASKS_DIR, `task-${subtaskId}.md`);
    const taskFileContent = `# Task ID: ${subtaskId}
# Title: ${subtask.title}
# Status: pending
# Dependencies: ${id}
# Priority: ${subtask.priority}
# Description: 
${subtask.description}

# Details:
${subtask.details}

# Test Strategy:
${subtask.testStrategy}
`;
    
    fs.writeFileSync(taskFilePath, taskFileContent);
  }
  
  if (writeTasks(tasksData)) {
    console.log(`Tâche #${id} étendue en ${subtasks} sous-tâches.`);
  }
}

// Génération des fichiers de tâches
function generateTaskFiles() {
  const tasksData = readTasks();
  
  tasksData.tasks.forEach(task => {
    const taskFilePath = path.join(TASKS_DIR, `task-${task.id}.md`);
    const dependencies = task.dependencies.join(', ');
    
    const taskFileContent = `# Task ID: ${task.id}
# Title: ${task.title}
# Status: ${task.status}
# Dependencies: ${dependencies}
# Priority: ${task.priority}
# Description: 
${task.description}

# Details:
${task.details || task.description}

# Test Strategy:
${task.testStrategy || 'Test manuel des fonctionnalités concernées.'}
`;
    
    fs.writeFileSync(taskFilePath, taskFileContent);
  });
  
  console.log(`Fichiers de tâches générés dans le dossier: ${TASKS_DIR}`);
}

// Correction des dépendances
function fixDependencies() {
  const tasksData = readTasks();
  let fixed = 0;
  
  tasksData.tasks.forEach(task => {
    const validDependencies = task.dependencies.filter(depId => 
      tasksData.tasks.some(t => t.id === depId && t.id !== task.id)
    );
    
    if (validDependencies.length !== task.dependencies.length) {
      fixed++;
      task.dependencies = validDependencies;
    }
  });
  
  if (writeTasks(tasksData)) {
    console.log(`${fixed} dépendances corrigées.`);
  }
}

// Exécution de la commande
switch (command) {
  case 'list':
    listTasks(getOptions(args));
    break;
  case 'show':
    showTask(args[1]);
    break;
  case 'set-status':
    const statusOptions = getOptions(args);
    setTaskStatus(statusOptions.id, statusOptions.status);
    break;
  case 'expand':
    expandTask(getOptions(args));
    break;
  case 'generate':
    generateTaskFiles();
    break;
  case 'fix-dependencies':
    fixDependencies();
    break;
  default:
    console.log(`
Usage: node scripts/dev.js <command> [options]

Commands:
  list [--detailed]      : Liste toutes les tâches
  show <id>             : Affiche les détails d'une tâche
  set-status --id=<id> --status=<status> : Modifie le statut d'une tâche
  expand --id=<id> --subtasks=<number> [--prompt="<text>"] : Étend une tâche en sous-tâches
  generate              : Génère des fichiers MD pour toutes les tâches
  fix-dependencies      : Corrige les dépendances invalides

Exemples:
  node scripts/dev.js list --detailed
  node scripts/dev.js show 5
  node scripts/dev.js set-status --id=3 --status=done
  node scripts/dev.js expand --id=4 --subtasks=3 --prompt="Description détaillée des sous-tâches"
  node scripts/dev.js generate
  `);
}
