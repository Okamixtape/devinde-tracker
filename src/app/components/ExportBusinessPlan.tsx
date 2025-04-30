import React, { useState } from "react";
import { FileText, Download, CheckCircle, X } from "lucide-react";
import type { BusinessPlanData } from "./types";

type ExportBusinessPlanProps = {
  data: BusinessPlanData;
  onClose: () => void;
};

const ExportBusinessPlan: React.FC<ExportBusinessPlanProps> = ({ data, onClose }) => {
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includeCompetitors, setIncludeCompetitors] = useState(true);
  const [includeProjections, setIncludeProjections] = useState(true);
  const [exportFormat, setExportFormat] = useState<"pdf" | "html" | "md">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Fonction de génération du PDF (simulée)
  const generateExport = () => {
    setIsExporting(true);
    
    // Simuler le délai d'exportation
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      
      // Simuler le téléchargement
      // Dans une vraie implémentation, vous utiliseriez jsPDF ou une API similaire
      setTimeout(() => {
        console.log("Exportation terminée avec paramètres:", {
          includeFinancials,
          includeCompetitors,
          includeProjections,
          exportFormat
        });
        
        // Créer une chaîne JSON de démonstration
        const jsonString = JSON.stringify(data, null, 2);
        
        // Créer un objet Blob
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Créer un URL pour le Blob
        const url = URL.createObjectURL(blob);
        
        // Créer un élément d'ancrage pour déclencher le téléchargement
        const a = document.createElement('a');
        a.href = url;
        a.download = `business-plan-${new Date().toISOString().slice(0, 10)}.json`;
        
        // Ajouter au document et cliquer
        document.body.appendChild(a);
        a.click();
        
        // Nettoyer
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 500);
    }, 2000);
  };

  // Calculer le pourcentage de complétion pour les différentes sections
  const calculateCompletionPercentage = (section: Record<string, unknown>): number => {
    let totalFields = 0;
    let completedFields = 0;

    for (const key in section) {
      totalFields++;
      
      if (Array.isArray(section[key])) {
        if (section[key].length > 0) completedFields++;
      } else if (typeof section[key] === 'string') {
        if (section[key].trim().length > 0) completedFields++;
      } else if (typeof section[key] === 'number') {
        if (section[key] > 0) completedFields++;
      }
    }
    
    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  // Calcule la complétion de chaque section
  const completionBySection = {
    pitch: calculateCompletionPercentage(data.pitch),
    services: calculateCompletionPercentage(data.services),
    businessModel: calculateCompletionPercentage(data.businessModel),
    marketAnalysis: calculateCompletionPercentage(data.marketAnalysis),
    financials: calculateCompletionPercentage(data.financials),
    actionPlan: calculateCompletionPercentage(data.actionPlan),
  };

  // Complétion globale
  const globalCompletionPercentage = Math.round(
    Object.values(completionBySection).reduce((a, b) => a + b, 0) / Object.values(completionBySection).length
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        {/* En-tête */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="mr-2" size={20} />
            <h2 className="text-lg font-semibold">Exporter votre Business Plan</h2>
          </div>
          <button 
            className="text-white hover:bg-blue-700 rounded-full p-1"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Contenu */}
        <div className="p-6">
          {exportComplete ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Exportation réussie !</h3>
              <p className="text-gray-600 mb-6">Votre business plan a été exporté avec succès.</p>
              <div className="space-x-3">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    setExportComplete(false);
                    setIsExporting(false);
                  }}
                >
                  Nouvelle exportation
                </button>
                <button 
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  onClick={onClose}
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Aperçu de la complétion</h3>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Complétion globale</span>
                    <span className="text-sm font-medium">{globalCompletionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        globalCompletionPercentage < 50 ? 'bg-red-500' : 
                        globalCompletionPercentage < 80 ? 'bg-yellow-400' : 'bg-green-500'
                      }`} 
                      style={{ width: `${globalCompletionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(completionBySection).map(([key, value]) => (
                    <div key={key} className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs">{
                          key === 'businessModel' ? 'Modèle économique' :
                          key === 'marketAnalysis' ? 'Analyse de marché' :
                          key === 'actionPlan' ? 'Plan d\'action' :
                          key.charAt(0).toUpperCase() + key.slice(1)
                        }</span>
                        <span className="text-xs">{value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            value < 50 ? 'bg-red-500' : 
                            value < 80 ? 'bg-yellow-400' : 'bg-green-500'
                          }`} 
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">Options d&apos;exportation</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Format d&apos;exportation</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="exportFormat"
                        checked={exportFormat === "pdf"}
                        onChange={() => setExportFormat("pdf")}
                        className="mr-2"
                      />
                      PDF
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="exportFormat"
                        checked={exportFormat === "html"}
                        onChange={() => setExportFormat("html")}
                        className="mr-2"
                      />
                      HTML
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="exportFormat"
                        checked={exportFormat === "md"}
                        onChange={() => setExportFormat("md")}
                        className="mr-2"
                      />
                      Markdown
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Contenu à inclure</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeFinancials}
                        onChange={() => setIncludeFinancials(!includeFinancials)}
                        className="mr-2"
                      />
                      Informations financières détaillées
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeCompetitors}
                        onChange={() => setIncludeCompetitors(!includeCompetitors)}
                        className="mr-2"
                      />
                      Analyse des concurrents
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeProjections}
                        onChange={() => setIncludeProjections(!includeProjections)}
                        className="mr-2"
                      />
                      Projections sur 3 ans
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  onClick={onClose}
                >
                  Annuler
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  onClick={generateExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Exportation...
                    </>
                  ) : (
                    <>
                      <Download size={18} className="mr-2" />
                      Exporter
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportBusinessPlan;