'use client';

import React, { useState } from 'react';
import { ChevronRight, Menu, Home, BarChart2, Target, Users, DollarSign, Briefcase, PieChart, FileText, Settings, X } from 'lucide-react';

/**
 * MainLayout - Layout principal de l'application
 * 
 * Contient la sidebar de navigation, le header et la zone de contenu principale.
 * Gère l'état de la sidebar (étendue/réduite) et s'adapte aux différentes tailles d'écran.
 */
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [expanded, setExpanded] = useState(true);
  const [currentPlan] = useState("AI Développeur Next.JS");
  const [currentSection, setCurrentSection] = useState("tableau-de-bord");
  
  const sections = [
    { id: "tableau-de-bord", name: "Tableau de Bord", icon: <Home size={20} />, progress: 25 },
    { id: "pitch", name: "Pitch", icon: <FileText size={20} />, progress: 80 },
    { id: "services", name: "Services", icon: <Briefcase size={20} />, progress: 60 },
    { id: "modele-economique", name: "Modèle Économique", icon: <DollarSign size={20} />, progress: 40 },
    { id: "analyse-marche", name: "Analyse de Marché", icon: <PieChart size={20} />, progress: 20 },
    { id: "finances", name: "Finances", icon: <BarChart2 size={20} />, progress: 30 },
    { id: "plan-action", name: "Plan d'Action", icon: <Target size={20} />, progress: 10 },
    { id: "projections", name: "Projections", icon: <Users size={20} />, progress: 50 },
  ];

  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`${expanded ? 'w-64' : 'w-20'} bg-gray-800 transition-width duration-300 flex flex-col h-full`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {expanded ? (
            <>
              <h1 className="text-xl font-bold">DevIndé Tracker</h1>
              <button onClick={() => setExpanded(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </>
          ) : (
            <button onClick={() => setExpanded(true)} className="mx-auto text-gray-400 hover:text-white">
              <Menu size={24} />
            </button>
          )}
        </div>
        
        <div className="p-4 border-b border-gray-700">
          {expanded ? (
            <div className="mb-2">
              <p className="text-sm text-gray-400">Plan actuel</p>
              <p className="font-medium truncate">{currentPlan}</p>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                {currentPlan.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {sections.map((section) => (
              <li key={section.id} className="mb-1">
                <button
                  onClick={() => handleSectionChange(section.id)}
                  className={`flex items-center w-full ${currentSection === section.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'} rounded-md ${expanded ? 'px-4' : 'justify-center'} py-3`}
                >
                  <span className="flex-shrink-0">{section.icon}</span>
                  
                  {expanded && (
                    <>
                      <span className="ml-3 flex-1 text-left">{section.name}</span>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-700 text-xs">
                        {section.progress}%
                      </div>
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          {expanded ? (
            <button className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              <Settings size={20} />
              <span className="ml-3">Paramètres</span>
            </button>
          ) : (
            <button className="flex justify-center w-full py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              <Settings size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-gray-800 shadow-md">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center text-sm">
              <a href="#" className="text-gray-400 hover:text-white">Accueil</a>
              <ChevronRight size={16} className="mx-2 text-gray-500" />
              <a href="#" className="text-gray-400 hover:text-white">{currentPlan}</a>
              <ChevronRight size={16} className="mx-2 text-gray-500" />
              <span className="text-white">{sections.find(s => s.id === currentSection)?.name}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
                Enregistrer
              </button>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                DU
              </div>
            </div>
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
