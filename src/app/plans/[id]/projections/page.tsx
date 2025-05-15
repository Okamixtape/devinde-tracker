import React from 'react';
import ProjectionsManager from '../../../components/projections/ProjectionsManager';

interface ProjectionsPageProps {
  params: {
    id: string;
  };
}

export default function ProjectionsPage({ params }: ProjectionsPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Projections Financières</h1>
      
      <div className="bg-white rounded-lg shadow mb-8 p-4">
        <div className="prose max-w-none">
          <p>
            Cette section vous permet de créer et gérer des projections financières pour votre entreprise.
            Vous pouvez établir différents scénarios de revenus, analyser le point mort et générer des états financiers prévisionnels.
          </p>
        </div>
      </div>
      
      <ProjectionsManager planId={params.id} />
    </div>
  );
}