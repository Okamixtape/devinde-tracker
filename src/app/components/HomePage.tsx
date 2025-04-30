"use client";
import React from "react";
import { ArrowRight, Code, Lightbulb, TrendingUp, Users, Calendar, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

const HomePage: React.FC = () => {
  const router = useRouter();

  const features = [
    {
      icon: <Code className="text-blue-500" size={24} />,
      title: "Développez votre activité",
      description: "Structurez votre offre de services, définissez vos tarifs et votre positionnement sur le marché."
    },
    {
      icon: <TrendingUp className="text-green-500" size={24} />,
      title: "Suivez vos finances",
      description: "Gérez vos prévisions financières, objectifs trimestriels et vos investissements initiaux."
    },
    {
      icon: <Users className="text-purple-500" size={24} />,
      title: "Ciblez votre clientèle",
      description: "Identifiez vos clients cibles et analysez vos concurrents pour mieux vous positionner."
    },
    {
      icon: <Calendar className="text-orange-500" size={24} />,
      title: "Planifiez vos actions",
      description: "Définissez des jalons clairs et suivez votre progression étape par étape."
    }
  ];

  const demos = [
    {
      title: "Développeur web freelance",
      description: "Planification d'une activité de développement web orientée vers les PME régionales",
      id: "web-freelance"
    },
    {
      title: "Consultant DevOps",
      description: "Structuration d'une offre de service de conseil en DevOps pour startups",
      id: "devops-consultant"
    },
    {
      title: "Développeur mobile",
      description: "Création d'une activité de développement d'applications mobiles natives",
      id: "mobile-dev"
    }
  ];

  const startDemo = (demoId: string) => {
    // Ici on pourrait charger des données de démo spécifiques
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero section */}
      <div className="container mx-auto pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="text-blue-600 dark:text-blue-400">DevIndé</span> Tracker
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10">
            L'outil tout-en-un pour les développeurs indépendants qui veulent structurer et développer leur activité
          </p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 inline-flex items-center"
          >
            Démarrer maintenant <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </div>
      
      {/* Features */}
      <div className="bg-white dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Comment DevIndé Tracker peut vous aider
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Demo section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full mb-4">
              <Lightbulb size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Découvrez DevIndé Tracker en action
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Explorez nos exemples préconfigurés pour voir comment DevIndé Tracker peut s'adapter à votre activité
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {demos.map((demo) => (
              <div key={demo.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{demo.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{demo.description}</p>
                  <button 
                    onClick={() => startDemo(demo.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300 w-full"
                  >
                    Voir cet exemple
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div className="bg-blue-600 dark:bg-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à structurer votre activité ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            DevIndé Tracker vous accompagne à chaque étape, de la définition de votre offre jusqu'au suivi de votre plan d'action.
          </p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300"
          >
            Commencer gratuitement
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
