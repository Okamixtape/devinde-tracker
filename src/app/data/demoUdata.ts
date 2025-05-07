// Données de démonstration pour différents profils

import { BusinessPlanData } from "@/app/components/types";

// Développeur web freelance
export const webFreelanceData: BusinessPlanData = {
  pitch: {
    title: "Développement Web pour PME",
    summary: "Création de sites web et d'applications personnalisées pour PME locales, avec une approche centrée sur l'expérience utilisateur et la performance.",
    vision: "Devenir le partenaire privilégié des PME de la région pour leur transformation numérique à travers des solutions web sur mesure.",
    values: [
      "Qualité et excellence technique",
      "Proximité et disponibilité",
      "Transparence et honnêteté",
      "Innovation continue"
    ]
  },
  services: {
    offerings: [
      "Création de site vitrine responsive",
      "Développement d'applications web sur mesure",
      "E-commerce et solutions de paiement",
      "Refonte et optimisation de sites existants"
    ],
    technologies: [
      "React / Next.js / TypeScript",
      "Node.js / Express",
      "WordPress personnalisé",
      "Bases de données SQL et NoSQL"
    ],
    process: [
      "Découverte et analyse des besoins",
      "Prototypage et validation",
      "Développement itératif",
      "Tests et déploiement",
      "Suivi et maintenance"
    ]
  },
  businessModel: {
    hourlyRates: [
      "Développement frontend: 65€/h",
      "Développement backend: 75€/h",
      "Conseil et architecture: 90€/h"
    ],
    packages: [
      "Site vitrine: 3 000€ - 5 000€",
      "E-commerce: 5 000€ - 8 000€",
      "Application web sur mesure: à partir de 8 000€"
    ],
    subscriptions: [
      "Maintenance basique: 150€/mois",
      "Maintenance premium: 350€/mois",
      "Évolutions continues: 500€/mois"
    ]
  },
  marketAnalysis: {
    competitors: [
      "Agences web locales",
      "Freelances généralistes",
      "Plateformes de création de sites",
      "Agences nationales avec offres standardisées"
    ],
    targetClients: [
      "PME du secteur commercial (10-50 employés)",
      "Cabinets de professions libérales",
      "Artisans et commerçants indépendants",
      "Startups en phase de développement"
    ],
    trends: [
      "Demande croissante de présence en ligne post-COVID",
      "Besoin d'intégration des outils numériques",
      "Sensibilité accrue à la performance et au référencement",
      "Intérêt pour les solutions de e-commerce hybrides"
    ]
  },
  financials: {
    initialInvestment: 3000,
    quarterlyGoals: [12000, 15000, 18000, 20000],
    expenses: [
      "Hébergement et outils: 150€/mois",
      "Formation continue: 200€/mois",
      "Marketing et prospection: 300€/mois",
      "Assurance professionnelle: 50€/mois"
    ]
  },
  actionPlan: {
    milestones: [
      "T1: Création de l'identité visuelle et du site personnel",
      "T1: Définition des offres et tarifs",
      "T2: Prospection et acquisition des 3 premiers clients",
      "T2: Mise en place d'un processus de gestion de projet",
      "T3: Développement de templates réutilisables",
      "T3: Création d'un portfolio avec 5 projets clients",
      "T4: Mise en place d'une stratégie de référencement",
      "T4: Objectif de 8 clients réguliers"
    ]
  }
};

// Consultant DevOps
export const devopsConsultantData: BusinessPlanData = {
  pitch: {
    title: "Conseil DevOps pour Startups",
    summary: "Accompagnement des startups dans la mise en place de pratiques DevOps modernes pour accélérer leur développement et améliorer leur qualité logicielle.",
    vision: "Démocratiser les pratiques DevOps auprès des petites structures tech pour leur permettre de déployer plus rapidement et plus souvent.",
    values: [
      "Automatisation et efficacité",
      "Amélioration continue",
      "Partage de connaissances",
      "Fiabilité et résilience"
    ]
  },
  services: {
    offerings: [
      "Audit et recommandations DevOps",
      "Mise en place de CI/CD",
      "Configuration d'infrastructures cloud",
      "Formation des équipes aux pratiques DevOps"
    ],
    technologies: [
      "Docker / Kubernetes",
      "AWS / Google Cloud / Azure",
      "GitHub Actions / GitLab CI",
      "Terraform / Ansible",
      "Prometheus / Grafana"
    ],
    process: [
      "Audit de l'existant",
      "Définition d'une roadmap",
      "Implémentation progressive",
      "Transfert de compétences",
      "Suivi et optimisation"
    ]
  },
  businessModel: {
    hourlyRates: [
      "Conseil stratégique: 120€/h",
      "Implémentation technique: 95€/h",
      "Formation: 850€/jour"
    ],
    packages: [
      "Audit DevOps: 2 500€",
      "Mise en place CI/CD: 4 000€ - 8 000€",
      "Infrastructure as Code: 5 000€ - 10 000€"
    ],
    subscriptions: [
      "Support mensuel: 500€/mois",
      "Supervision proactive: 800€/mois",
      "DevOps as a Service: 2 000€/mois"
    ]
  },
  marketAnalysis: {
    competitors: [
      "Consultants indépendants spécialisés",
      "ESN avec offres DevOps",
      "Services professionnels des cloud providers",
      "Plateformes DevOps en SaaS"
    ],
    targetClients: [
      "Startups tech en phase de croissance",
      "Éditeurs de logiciels (10-50 personnes)",
      "Équipes produit avec dette technique",
      "Entreprises en transformation numérique"
    ],
    trends: [
      "Adoption croissante de Kubernetes",
      "Focus sur la sécurité (DevSecOps)",
      "GitOps et Infrastructure as Code",
      "FinOps et optimisation des coûts cloud"
    ]
  },
  financials: {
    initialInvestment: 5000,
    quarterlyGoals: [20000, 25000, 30000, 35000],
    expenses: [
      "Licences logicielles: 200€/mois",
      "Infrastructure cloud démo: 300€/mois",
      "Formation continue: 500€/mois",
      "Déplacements clients: 400€/mois"
    ]
  },
  actionPlan: {
    milestones: [
      "T1: Création des offres et méthodologies",
      "T1: Mise en place d'environnements de démonstration",
      "T2: Acquisition des 2 premiers clients",
      "T2: Création de modèles et scripts réutilisables",
      "T3: Publication d'articles techniques spécialisés",
      "T3: Partenariats avec des plateformes cloud",
      "T4: Premier atelier DevOps public",
      "T4: Développement d'une offre SRE complète"
    ]
  }
};

// Développeur mobile
export const mobileDeveloperData: BusinessPlanData = {
  pitch: {
    title: "Applications Mobiles Natives",
    summary: "Conception et développement d'applications mobiles natives pour iOS et Android, centrées sur l'expérience utilisateur et la performance.",
    vision: "Créer des applications mobiles qui transforment les idées innovantes en produits concrets et accessibles à tous.",
    values: [
      "Excellence technique",
      "Design centré utilisateur",
      "Innovation constante",
      "Qualité et performance"
    ]
  },
  services: {
    offerings: [
      "Applications iOS natives (Swift/SwiftUI)",
      "Applications Android natives (Kotlin)",
      "Applications multiplateformes (React Native/Flutter)",
      "Maintenance et évolution d'apps existantes"
    ],
    technologies: [
      "Swift/SwiftUI pour iOS",
      "Kotlin pour Android",
      "React Native",
      "Flutter",
      "Firebase/AWS Amplify"
    ],
    process: [
      "Design UX/UI",
      "Développement natif",
      "Tests utilisateurs",
      "Publication sur les stores",
      "Analytics et optimisation"
    ]
  },
  businessModel: {
    hourlyRates: [
      "Développement iOS: 85€/h",
      "Développement Android: 85€/h",
      "Design UI/UX: 75€/h"
    ],
    packages: [
      "MVP mobile: 8 000€ - 15 000€",
      "Application complète: 15 000€ - 30 000€",
      "Version iOS + Android: 20 000€ - 40 000€"
    ],
    subscriptions: [
      "Maintenance basique: 350€/mois",
      "Support et évolutions: 800€/mois",
      "Monitoring avancé: 500€/mois"
    ]
  },
  marketAnalysis: {
    competitors: [
      "Agences de développement mobile",
      "Freelances généralistes",
      "Plateformes no-code/low-code",
      "Studios de développement offshore"
    ],
    targetClients: [
      "Startups avec besoins mobiles",
      "Entreprises en digitalisation",
      "Créateurs d'applications innovantes",
      "PME avec services clients mobiles"
    ],
    trends: [
      "Apps économes en énergie",
      "Intégration IA et ML",
      "AR/VR dans les applications mobiles",
      "Personnalisation avancée"
    ]
  },
  financials: {
    initialInvestment: 6000,
    quarterlyGoals: [18000, 22000, 28000, 32000],
    expenses: [
      "Licences Apple Developer: 85€/an",
      "Compte Google Play: 25€/an",
      "Matériel de test: 200€/mois",
      "Outils de design: 100€/mois",
      "Formation continue: 300€/mois"
    ]
  },
  actionPlan: {
    milestones: [
      "T1: Acquisition du matériel de développement/test",
      "T1: Création d'applications démo pour portfolio",
      "T2: Premier client projet complet",
      "T2: Mise en place d'une CI/CD mobile",
      "T3: Développement d'une bibliothèque de composants",
      "T3: Acquisition de 3 clients réguliers",
      "T4: Création d'un framework propriétaire",
      "T4: Publication d'une app template sur GitHub"
    ]
  }
};

// Map des données de démonstration
export const demoDataMap = {
  "web-freelance": webFreelanceData,
  "devops-consultant": devopsConsultantData,
  "mobile-dev": mobileDeveloperData
};
