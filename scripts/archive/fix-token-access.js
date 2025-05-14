// fix-token-access.js
// Script pour corriger automatiquement les problèmes d'accès aux propriétés du token décodé
// et autres erreurs de typage dans le projet

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel (équivalent à __dirname en CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier authService.ts
const authServicePath = path.join(
  __dirname, 
  '../src/app/services/core/authService.ts'
);

// Lire le contenu du fichier
let content = fs.readFileSync(authServicePath, 'utf8');

// 1. Corriger les accès directs à decodedToken.sub
content = content.replace(
  /decodedToken\.sub/g, 
  'decodedToken.payload?.sub as string'
);

// 2. Corriger les accès directs à decodedToken.email
content = content.replace(
  /decodedToken\.email/g, 
  'decodedToken.payload?.email as string'
);

// 3. Corriger les accès directs à decodedToken.role
content = content.replace(
  /decodedToken\.role/g, 
  'decodedToken.payload?.role as UserRole'
);

// 4. Désactiver la règle no-unused-vars pour la destructuration spécifique 
// dans la fonction removePasswordFromUser
content = content.replace(
  /removePasswordFromUser\(user: User\): UserData {[\s\n]*const { password, failedLoginAttempts, lockedUntil, ...userData } = user;/g,
  'removePasswordFromUser(user: User): UserData {\n    // eslint-disable-next-line @typescript-eslint/no-unused-vars\n    const { password, failedLoginAttempts, lockedUntil, ...userData } = user;'
);

// Écrire les modifications dans le fichier
fs.writeFileSync(authServicePath, content);

console.log('Corrections terminées dans authService.ts');
