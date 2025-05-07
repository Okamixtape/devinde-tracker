# Règles d'architecture pour Task-Master

Ce document définit des règles d'architecture essentielles à vérifier lors de la création et de l'expansion de tâches dans le workflow task-master. Ces règles sont dérivées des leçons apprises pendant le développement et servent à prévenir les erreurs de conception courantes.

## Authentification et gestion des sessions

### 🔒 Règle d'unicité d'authentification
**Description**: Toujours vérifier qu'un seul mécanisme d'authentification est implémenté de manière cohérente.

**Vérifications**:
- [ ] Un seul mécanisme de stockage de token est utilisé (localStorage OU cookies, pas les deux)
- [ ] Le même mécanisme est utilisé cohéremment dans tous les composants concernés
- [ ] La documentation du mécanisme choisi est claire et centralisée

**Erreurs typiques**:
- Middleware Next.js cherchant dans cookies tandis que l'authentification client utilise localStorage
- Différents composants vérifiant l'authentification de manières incompatibles

### 🔄 Règle de vérification des redirections
**Description**: Tester explicitement tous les chemins de redirection, particulièrement après authentification.

**Vérifications**:
- [ ] Les redirections après connexion respectent les paramètres de redirection
- [ ] Les redirections lors de l'accès aux routes protégées sont cohérentes
- [ ] Les boucles de redirection potentielles sont identifiées et prévenues
- [ ] Chaque point de redirection conserve et transmet correctement le chemin cible

**Scénarios de test obligatoires**:
1. Accès direct à une route protégée → login → redirection vers la route initiale
2. Connexion depuis la page de login sans paramètre de redirection
3. Déconnexion et vérification de la redirection vers login
4. Accès à une route protégée avec différents états d'authentification

### 🔌 Règle de synchronisation client-serveur
**Description**: Si un middleware est utilisé, s'assurer que le stockage d'authentification (cookies/localStorage) est accessible à la fois au client et au serveur.

**Vérifications**:
- [ ] Si middleware actif, utiliser des cookies pour le stockage des tokens
- [ ] Si authentification client-side uniquement, désactiver tout middleware d'authentification
- [ ] En cas d'utilisation hybride, synchroniser explicitement les états entre client et serveur
- [ ] Documenter clairement le flux complet d'authentification et les points de vérification

**Solutions recommandées**:
- Utiliser des cookies HTTP-only pour une protection optimale avec middleware
- En cas d'utilisation de localStorage, désactiver les vérifications middleware
- Implémenter un double stockage (localStorage + cookies) si les deux contextes sont nécessaires

## Application de ces règles avec Task-Master

Lors de l'utilisation de `node scripts/dev.js expand` pour créer ou étendre des tâches liées à l'authentification ou aux routes protégées, ajouter explicitement dans la description des tâches:

```
# Règles d'architecture applicables:
- Unicité d'authentification
- Vérification des redirections
- Synchronisation client-serveur (si middleware)

# Tests spécifiques requis:
1. Accès direct à [route protégée]
2. Flux complet d'authentification
3. Vérification des redirections avec paramètres
```

Ces règles doivent être consultées lors de la phase de création de tâches et vérifiées lors de la phase de test du cycle d'amélioration continue.
