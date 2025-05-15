import React, { useState } from 'react';
import { ChevronDown, Edit, Eye, FileText, GanttChartSquare, Info, LayoutGrid, Lightbulb, Link, PieChart, Plus, Search, Tag, Trash, TrendingUp, Users } from 'lucide-react';

const MarketAnalysisComponent = () => {
  const [activeTab, setActiveTab] = useState('segments');
  const [expandedOpportunity, setExpandedOpportunity] = useState(null);
  
  // Données simulées pour les segments de clientèle
  const [customerSegments, setCustomerSegments] = useState([
    {
      id: 1,
      name: "PME",
      description: "Petites et Moyennes Entreprises souhaitant moderniser leur présence en ligne",
      needs: ["Sites vitrines modernes", "Expérience utilisateur optimisée", "Design adaptatif"],
      potentialSize: "Élevé",
      profitability: "Moyenne",
      acquisition: "Réseaux professionnels, recommandations"
    },
    {
      id: 2,
      name: "Startups Tech",
      description: "Jeunes entreprises technologiques ayant besoin d'applications web performantes",
      needs: ["Applications React/Next.js", "Interfaces administrateur", "Intégration API"],
      potentialSize: "Moyen",
      profitability: "Élevée",
      acquisition: "Événements tech, LinkedIn"
    },
    {
      id: 3,
      name: "Indépendants",
      description: "Professionnels freelance nécessitant un site personnel/portfolio",
      needs: ["Portfolio en ligne", "Tarifs accessibles", "Design unique"],
      potentialSize: "Faible",
      profitability: "Faible",
      acquisition: "Réseaux sociaux, bouche à oreille"
    }
  ]);
  
  // Données simulées pour les concurrents
  const [competitors, setCompetitors] = useState([
    {
      id: 1,
      name: "Agence Web Premium",
      website: "https://example-agency.com",
      strengths: ["Réputation établie", "Équipe importante", "Portefeuille prestigieux"],
      weaknesses: ["Tarifs élevés", "Délais longs", "Peu de personnalisation"],
      targetMarket: "Grandes entreprises et PME",
      priceRange: "3000-15000€"
    },
    {
      id: 2,
      name: "FreelanceDev",
      website: "https://freelancedev.example.com",
      strengths: ["Prix compétitifs", "Réactivité", "Relation client directe"],
      weaknesses: ["Capacité limitée", "Moins d'expertise diversifiée", "Support irrégulier"],
      targetMarket: "Startups et TPE",
      priceRange: "1000-5000€"
    },
    {
      id: 3,
      name: "TemplateGenius",
      website: "https://templategenius.example.com",
      strengths: ["Solutions clé en main", "Prix très bas", "Livraison rapide"],
      weaknesses: ["Solutions générique", "Peu de support", "Manque d'originalité"],
      targetMarket: "Indépendants et micro-entreprises",
      priceRange: "300-1500€"
    }
  ]);
  
  // Données simulées pour les tendances du marché
  const [marketTrends, setMarketTrends] = useState([
    {
      id: 1,
      name: "Applications Single-Page",
      description: "Croissance des sites à page unique avec frameworks modernes (React, Vue, etc.)",
      impact: "Élevé",
      timeframe: "Actuel",
      relevance: "Directe"
    },
    {
      id: 2,
      name: "Progressive Web Apps",
      description: "Augmentation de la demande pour des applications web fonctionnant comme des applications natives",
      impact: "Moyen",
      timeframe: "Court terme",
      relevance: "Directe"
    },
    {
      id: 3,
      name: "Jamstack Architecture",
      description: "Evolution vers des architectures découplées avec backends headless et frontends statiques",
      impact: "Élevé",
      timeframe: "Moyen terme",
      relevance: "Directe"
    },
    {
      id: 4,
      name: "IA et automatisation",
      description: "Intégration de l'IA dans le développement web et la génération de contenu",
      impact: "Très élevé",
      timeframe: "En cours/Futur",
      relevance: "Indirecte"
    }
  ]);
  
  // Données simulées pour les opportunités
  const [opportunities, setOpportunities] = useState([
    {
      id: 1,
      title: "Spécialisation React/Next.js pour startups",
      description: "Les startups recherchent des solutions modernes basées sur React et Next.js, mais trouvent peu de spécialistes disponibles.",
      segment: "Startups Tech",
      trend: "Applications Single-Page",
      competitiveAdvantage: "Expertise technique spécifique",
      potentialRevenue: "Élevé",
      difficulty: "Moyenne",
      timeframe: "Immédiat",
      steps: [
        "Développer un portfolio ciblé de projets React/Next.js",
        "Créer des contenus techniques sur ces technologies",
        "Participer aux événements tech pour startups"
      ]
    },
    {
      id: 2,
      title: "Forfaits PWA pour PME",
      description: "Les PME veulent moderniser leur présence web mais ne comprennent pas les aspects techniques. Une offre packagée de PWA serait attractive.",
      segment: "PME",
      trend: "Progressive Web Apps",
      competitiveAdvantage: "Forfaits clairs et accessibles",
      potentialRevenue: "Moyen",
      difficulty: "Faible",
      timeframe: "3-6 mois",
      steps: [
        "Créer des packages pré-définis avec prix transparents",
        "Développer des démos de PWA pour différents secteurs",
        "Créer du contenu explicatif non-technique"
      ]
    },
    {
      id: 3,
      title: "Solutions Jamstack pour créateurs de contenu",
      description: "Les créateurs de contenu indépendants ont besoin de sites performants pour leur SEO, ce que Jamstack peut offrir à prix modéré.",
      segment: "Indépendants",
      trend: "Jamstack Architecture",
      competitiveAdvantage: "Niche inexploitée",
      potentialRevenue: "Faible au début, croissant",
      difficulty: "Moyenne",
      timeframe: "6-12 mois",
      steps: [
        "Développer des templates Jamstack pour créateurs",
        "Écrire des guides sur les avantages SEO de Jamstack",
        "Offrir des formations aux indépendants"
      ]
    }
  ]);
  
  // État du formulaire pour ajouter/éditer des segments
  const [formVisible, setFormVisible] = useState(false);
  const [formType, setFormType] = useState('segment'); // segment, competitor, trend, opportunity
  const [editId, setEditId] = useState(null);
  
  // Valeurs du formulaire pour les segments
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    needs: '',
    potentialSize: 'Moyen',
    profitability: 'Moyenne',
    acquisition: ''
  });
  
  // Valeurs du formulaire pour les concurrents
  const [competitorForm, setCompetitorForm] = useState({
    name: '',
    website: '',
    strengths: '',
    weaknesses: '',
    targetMarket: '',
    priceRange: ''
  });
  
  // Valeurs du formulaire pour les tendances
  const [trendForm, setTrendForm] = useState({
    name: '',
    description: '',
    impact: 'Moyen',
    timeframe: 'Court terme',
    relevance: 'Directe'
  });

  // Fonctions pour afficher le formulaire d'ajout
  const showAddForm = (type) => {
    setFormType(type);
    setEditId(null);
    
    // Réinitialiser le formulaire selon le type
    switch (type) {
      case 'segment':
        setSegmentForm({
          name: '',
          description: '',
          needs: '',
          potentialSize: 'Moyen',
          profitability: 'Moyenne',
          acquisition: ''
        });
        break;
      case 'competitor':
        setCompetitorForm({
          name: '',
          website: '',
          strengths: '',
          weaknesses: '',
          targetMarket: '',
          priceRange: ''
        });
        break;
      case 'trend':
        setTrendForm({
          name: '',
          description: '',
          impact: 'Moyen',
          timeframe: 'Court terme',
          relevance: 'Directe'
        });
        break;
      default:
        break;
    }
    
    setFormVisible(true);
  };
  
  // Fonctions pour afficher le formulaire d'édition
  const showEditForm = (type, id) => {
    setFormType(type);
    setEditId(id);
    
    // Remplir le formulaire avec les données existantes
    switch (type) {
      case 'segment':
        const segment = customerSegments.find(s => s.id === id);
        if (segment) {
          setSegmentForm({
            name: segment.name,
            description: segment.description,
            needs: segment.needs.join(', '),
            potentialSize: segment.potentialSize,
            profitability: segment.profitability,
            acquisition: segment.acquisition
          });
        }
        break;
      case 'competitor':
        const competitor = competitors.find(c => c.id === id);
        if (competitor) {
          setCompetitorForm({
            name: competitor.name,
            website: competitor.website,
            strengths: competitor.strengths.join(', '),
            weaknesses: competitor.weaknesses.join(', '),
            targetMarket: competitor.targetMarket,
            priceRange: competitor.priceRange
          });
        }
        break;
      case 'trend':
        const trend = marketTrends.find(t => t.id === id);
        if (trend) {
          setTrendForm({
            name: trend.name,
            description: trend.description,
            impact: trend.impact,
            timeframe: trend.timeframe,
            relevance: trend.relevance
          });
        }
        break;
      default:
        break;
    }
    
    setFormVisible(true);
  };
  
  // Fonction pour enregistrer les données du formulaire
  const handleSaveForm = () => {
    // Cette fonction serait réellement implémentée pour sauvegarder les données
    console.log('Sauvegarde du formulaire:', formType, editId);
    
    // Simuler la sauvegarde
    switch (formType) {
      case 'segment':
        // Traitement du formulaire de segment
        const segmentData = {
          name: segmentForm.name,
          description: segmentForm.description,
          needs: segmentForm.needs.split(',').map(n => n.trim()).filter(n => n),
          potentialSize: segmentForm.potentialSize,
          profitability: segmentForm.profitability,
          acquisition: segmentForm.acquisition
        };
        
        if (editId) {
          // Mise à jour d'un segment existant
          setCustomerSegments(customerSegments.map(s => 
            s.id === editId ? { ...segmentData, id: editId } : s
          ));
        } else {
          // Ajout d'un nouveau segment
          const newId = Math.max(0, ...customerSegments.map(s => s.id)) + 1;
          setCustomerSegments([...customerSegments, { ...segmentData, id: newId }]);
        }
        break;
        
      case 'competitor':
        // Traitement du formulaire de concurrent
        const competitorData = {
          name: competitorForm.name,
          website: competitorForm.website,
          strengths: competitorForm.strengths.split(',').map(s => s.trim()).filter(s => s),
          weaknesses: competitorForm.weaknesses.split(',').map(w => w.trim()).filter(w => w),
          targetMarket: competitorForm.targetMarket,
          priceRange: competitorForm.priceRange
        };
        
        if (editId) {
          // Mise à jour d'un concurrent existant
          setCompetitors(competitors.map(c => 
            c.id === editId ? { ...competitorData, id: editId } : c
          ));
        } else {
          // Ajout d'un nouveau concurrent
          const newId = Math.max(0, ...competitors.map(c => c.id)) + 1;
          setCompetitors([...competitors, { ...competitorData, id: newId }]);
        }
        break;
        
      case 'trend':
        // Traitement du formulaire de tendance
        const trendData = {
          name: trendForm.name,
          description: trendForm.description,
          impact: trendForm.impact,
          timeframe: trendForm.timeframe,
          relevance: trendForm.relevance
        };
        
        if (editId) {
          // Mise à jour d'une tendance existante
          setMarketTrends(marketTrends.map(t => 
            t.id === editId ? { ...trendData, id: editId } : t
          ));
        } else {
          // Ajout d'une nouvelle tendance
          const newId = Math.max(0, ...marketTrends.map(t => t.id)) + 1;
          setMarketTrends([...marketTrends, { ...trendData, id: newId }]);
        }
        break;
        
      default:
        break;
    }
    
    setFormVisible(false);
  };

  // Générer les opportunités basées sur les données actuelles
  const generateOpportunities = () => {
    // Dans une implémentation réelle, un algorithme analyserait les données
    // pour générer des opportunités basées sur les segments, concurrents et tendances
    
    // Pour la démonstration, simplement afficher un message
    alert('Analyse en cours... De nouvelles opportunités ont été identifiées !');
  };

  // Calculer le statut des opportunités
  const calculateOpportunityStatus = (opportunity) => {
    // Calcul fictif pour la démonstration
    const scores = {
      'Élevé': 3,
      'Moyen': 2,
      'Faible': 1,
      'Très élevé': 4,
      'Immédiat': 3,
      '3-6 mois': 2,
      '6-12 mois': 1
    };
    
    const revenueScore = scores[opportunity.potentialRevenue] || 2;
    const difficultyScore = scores[opportunity.difficulty] ? 4 - scores[opportunity.difficulty] : 2;
    const timeframeScore = scores[opportunity.timeframe] || 2;
    
    const totalScore = revenueScore + difficultyScore + timeframeScore;
    
    if (totalScore >= 8) return { label: 'Prioritaire', color: 'bg-green-500' };
    if (totalScore >= 6) return { label: 'Importante', color: 'bg-blue-500' };
    if (totalScore >= 4) return { label: 'À considérer', color: 'bg-yellow-500' };
    return { label: 'Secondaire', color: 'bg-gray-500' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analyse de Marché</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md flex items-center text-sm">
              <Plus size={16} className="mr-2" />
              <span>Ajouter</span>
              <ChevronDown size={14} className="ml-2" />
            </button>
            
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 border border-gray-700">
              <div className="py-1">
                <button
                  onClick={() => {
                    showAddForm('segment');
                    setActiveTab('segments');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700"
                >
                  <Users size={14} className="mr-2 text-blue-400" />
                  Segment de clientèle
                </button>
                <button
                  onClick={() => {
                    showAddForm('competitor');
                    setActiveTab('competitors');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700"
                >
                  <GanttChartSquare size={14} className="mr-2 text-green-400" />
                  Concurrent
                </button>
                <button
                  onClick={() => {
                    showAddForm('trend');
                    setActiveTab('trends');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700"
                >
                  <TrendingUp size={14} className="mr-2 text-purple-400" />
                  Tendance du marché
                </button>
              </div>
            </div>
          </div>
          
          <button 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center text-sm"
            onClick={generateOpportunities}
          >
            <Lightbulb size={16} className="mr-2" />
            <span>Générer des Opportunités</span>
          </button>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('segments')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'segments' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            <div className="flex items-center">
              <Users size={16} className="mr-2" />
              Segments Cibles
            </div>
          </button>
          <button
            onClick={() => setActiveTab('competitors')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'competitors' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            <div className="flex items-center">
              <GanttChartSquare size={16} className="mr-2" />
              Concurrents
            </div>
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trends' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            <div className="flex items-center">
              <TrendingUp size={16} className="mr-2" />
              Tendances du Marché
            </div>
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'opportunities' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            <div className="flex items-center">
              <Lightbulb size={16} className="mr-2" />
              Opportunités
            </div>
          </button>
        </nav>
      </div>

      {/* Formulaire d'ajout/édition */}
      {formVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editId ? `Modifier ${formType === 'segment' ? 'le segment' : formType === 'competitor' ? 'le concurrent' : 'la tendance'}` : 
                         `Ajouter ${formType === 'segment' ? 'un segment' : formType === 'competitor' ? 'un concurrent' : 'une tendance'}`}
              </h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setFormVisible(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Formulaire pour les segments */}
            {formType === 'segment' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nom du segment *</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={segmentForm.name}
                    onChange={(e) => setSegmentForm({...segmentForm, name: e.target.value})}
                    placeholder="ex: PME du secteur santé"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                    value={segmentForm.description}
                    onChange={(e) => setSegmentForm({...segmentForm, description: e.target.value})}
                    placeholder="Description détaillée du segment de clientèle"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Besoins (séparés par des virgules) *</label>
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={segmentForm.needs}
                    onChange={(e) => setSegmentForm({...segmentForm, needs: e.target.value})}
                    placeholder="ex: Site vitrine responsive, Expérience utilisateur intuitive"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Taille potentielle du marché</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={segmentForm.potentialSize}
                      onChange={(e) => setSegmentForm({...segmentForm, potentialSize: e.target.value})}
                    >
                      <option value="Faible">Faible</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Élevé">Élevé</option>
                      <option value="Très élevé">Très élevé</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Rentabilité</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={segmentForm.profitability}
                      onChange={(e) => setSegmentForm({...segmentForm, profitability: e.target.value})}
                    >
                      <option value="Faible">Faible</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Élevée">Élevée</option>
                      <option value="Très élevée">Très élevée</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Canaux d'acquisition</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={segmentForm.acquisition}
                    onChange={(e) => setSegmentForm({...segmentForm, acquisition: e.target.value})}
                    placeholder="ex: LinkedIn, Événements professionnels, Partenariats"
                  />
                </div>
              </div>
            )}
            
            {/* Formulaire pour les concurrents */}
            {formType === 'competitor' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nom du concurrent *</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={competitorForm.name}
                    onChange={(e) => setCompetitorForm({...competitorForm, name: e.target.value})}
                    placeholder="ex: AgenceWeb Pro"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Site web</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={competitorForm.website}
                    onChange={(e) => setCompetitorForm({...competitorForm, website: e.target.value})}
                    placeholder="ex: https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Forces (séparées par des virgules) *</label>
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={competitorForm.strengths}
                    onChange={(e) => setCompetitorForm({...competitorForm, strengths: e.target.value})}
                    placeholder="ex: Notoriété, Grande équipe, Portfolio impressionnant"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Faiblesses (séparées par des virgules) *</label>
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={competitorForm.weaknesses}
                    onChange={(e) => setCompetitorForm({...competitorForm, weaknesses: e.target.value})}
                    placeholder="ex: Prix élevés, Longs délais, Support limité"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Marché cible</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={competitorForm.targetMarket}
                      onChange={(e) => setCompetitorForm({...competitorForm, targetMarket: e.target.value})}
                      placeholder="ex: Grandes entreprises et PME"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Fourchette de prix</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={competitorForm.priceRange}
                      onChange={(e) => setCompetitorForm({...competitorForm, priceRange: e.target.value})}
                      placeholder="ex: 3000-15000€"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Formulaire pour les tendances */}
            {formType === 'trend' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nom de la tendance *</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={trendForm.name}
                    onChange={(e) => setTrendForm({...trendForm, name: e.target.value})}
                    placeholder="ex: Progressive Web Apps"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                    value={trendForm.description}
                    onChange={(e) => setTrendForm({...trendForm, description: e.target.value})}
                    placeholder="Description détaillée de la tendance de marché"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Impact</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={trendForm.impact}
                      onChange={(e) => setTrendForm({...trendForm, impact: e.target.value})}
                    >
                      <option value="Faible">Faible</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Élevé">Élevé</option>
                      <option value="Très élevé">Très élevé</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Horizon temporel</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={trendForm.timeframe}
                      onChange={(e) => setTrendForm({...trendForm, timeframe: e.target.value})}
                    >
                      <option value="Actuel">Actuel</option>
                      <option value="Court terme">Court terme</option>
                      <option value="Moyen terme">Moyen terme</option>
                      <option value="Long terme">Long terme</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Pertinence</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={trendForm.relevance}
                      onChange={(e) => setTrendForm({...trendForm, relevance: e.target.value})}
                    >
                      <option value="Directe">Directe</option>
                      <option value="Indirecte">Indirecte</option>
                      <option value="Périphérique">Périphérique</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                className="px-4 py-2 border border-gray-600 rounded-md text-sm hover:bg-gray-700"
                onClick={() => setFormVisible(false)}
              >
                Annuler
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
                onClick={handleSaveForm}
              >
                {editId ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vue des segments cibles */}
      {activeTab === 'segments' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-lg font-medium">Segments de Clientèle Cible</h2>
              <div className="ml-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                {customerSegments.length}
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <div className="flex items-center w-64 bg-gray-700 rounded-md pl-3 pr-8 py-2">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Rechercher un segment..."
                    className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm flex items-center"
                onClick={() => showAddForm('segment')}
              >
                <Plus size={16} className="mr-2" />
                Ajouter un segment
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerSegments.map((segment) => (
              <div key={segment.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">{segment.name}</h3>
                    <div className="flex space-x-1">
                      <button 
                        className="text-gray-400 hover:text-blue-400 p-1"
                        onClick={() => showEditForm('segment', segment.id)}
                      >
                        <Edit size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-red-400 p-1">
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{segment.description}</p>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Besoins</h4>
                    <div className="flex flex-wrap gap-2">
                      {segment.needs.map((need, index) => (
                        <span key={index} className="bg-gray-700 px-2 py-1 rounded-md text-xs">
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 bg-opacity-50 p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Taille potentielle</p>
                      <p className="font-medium">{segment.potentialSize}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Rentabilité</p>
                      <p className="font-medium">{segment.profitability}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Acquisition</p>
                      <p className="font-medium truncate" title={segment.acquisition}>
                        {segment.acquisition.length > 15 
                          ? segment.acquisition.substring(0, 15) + '...' 
                          : segment.acquisition}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Carte "Ajouter un segment" */}
            <div 
              className="bg-gray-800 rounded-lg shadow-md border-2 border-dashed border-gray-700 flex items-center justify-center p-6 cursor-pointer hover:border-blue-500 hover:bg-gray-700 transition-colors"
              onClick={() => showAddForm('segment')}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3">
                  <Plus size={24} className="text-blue-400" />
                </div>
                <p className="text-gray-400">Ajouter un segment de clientèle</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue des concurrents */}
      {activeTab === 'competitors' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-lg font-medium">Analyse de la Concurrence</h2>
              <div className="ml-2 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                {competitors.length}
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <div className="flex items-center w-64 bg-gray-700 rounded-md pl-3 pr-8 py-2">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Rechercher un concurrent..."
                    className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <button
                className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-sm flex items-center"
                onClick={() => showAddForm('competitor')}
              >
                <Plus size={16} className="mr-2" />
                Ajouter un concurrent
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {competitors.map((competitor) => (
              <div key={competitor.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{competitor.name}</h3>
                      {competitor.website && (
                        <a 
                          href={competitor.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-1"
                        >
                          <Link size={14} className="mr-1" />
                          {competitor.website}
                        </a>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        className="text-gray-400 hover:text-blue-400 p-1"
                        onClick={() => showEditForm('competitor', competitor.id)}
                      >
                        <Edit size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-red-400 p-1">
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-green-400">Forces</h4>
                      <ul className="space-y-1">
                        {competitor.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="text-green-500 mr-2">+</div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-red-400">Faiblesses</h4>
                      <ul className="space-y-1">
                        {competitor.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="text-red-500 mr-2">-</div>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 bg-opacity-50 p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Marché cible</p>
                      <p className="font-medium">{competitor.targetMarket}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Fourchette de prix</p>
                      <p className="font-medium">{competitor.priceRange}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Carte "Ajouter un concurrent" */}
            <div 
              className="bg-gray-800 rounded-lg shadow-md border-2 border-dashed border-gray-700 flex items-center justify-center p-6 cursor-pointer hover:border-green-500 hover:bg-gray-700 transition-colors"
              onClick={() => showAddForm('competitor')}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3">
                  <Plus size={24} className="text-green-400" />
                </div>
                <p className="text-gray-400">Ajouter un concurrent</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue des tendances du marché */}
      {activeTab === 'trends' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-lg font-medium">Tendances du Marché</h2>
              <div className="ml-2 bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                {marketTrends.length}
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <div className="flex items-center w-64 bg-gray-700 rounded-md pl-3 pr-8 py-2">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Rechercher une tendance..."
                    className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <button
                className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md text-sm flex items-center"
                onClick={() => showAddForm('trend')}
              >
                <Plus size={16} className="mr-2" />
                Ajouter une tendance
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketTrends.map((trend) => (
              <div key={trend.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">{trend.name}</h3>
                    <div className="flex space-x-1">
                      <button 
                        className="text-gray-400 hover:text-blue-400 p-1"
                        onClick={() => showEditForm('trend', trend.id)}
                      >
                        <Edit size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-red-400 p-1">
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{trend.description}</p>
                </div>
                
                <div className="bg-gray-700 bg-opacity-50 p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Impact</p>
                      <p className="font-medium">{trend.impact}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Horizon</p>
                      <p className="font-medium">{trend.timeframe}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Pertinence</p>
                      <p className="font-medium">{trend.relevance}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Carte "Ajouter une tendance" */}
            <div 
              className="bg-gray-800 rounded-lg shadow-md border-2 border-dashed border-gray-700 flex items-center justify-center p-6 cursor-pointer hover:border-purple-500 hover:bg-gray-700 transition-colors"
              onClick={() => showAddForm('trend')}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3">
                  <Plus size={24} className="text-purple-400" />
                </div>
                <p className="text-gray-400">Ajouter une tendance du marché</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue des opportunités */}
      {activeTab === 'opportunities' && (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h2 className="text-lg font-medium">Opportunités Identifiées</h2>
                <div className="ml-2 bg-yellow-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {opportunities.length}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <div className="relative">
                  <select className="bg-gray-700 border border-gray-600 rounded-md pl-3 pr-8 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="all">Toutes les opportunités</option>
                    <option value="priority">Prioritaires</option>
                    <option value="important">Importantes</option>
                    <option value="consider">À considérer</option>
                    <option value="secondary">Secondaires</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                <button 
                  className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-md text-sm flex items-center"
                  onClick={generateOpportunities}
                >
                  <Lightbulb size={16} className="mr-2" />
                  Analyser Opportunités
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-900 bg-opacity-50 flex items-center justify-center">
                  <Lightbulb size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Opportunités Prioritaires</p>
                  <p className="text-xl font-semibold">1</p>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-900 bg-opacity-50 flex items-center justify-center">
                  <Lightbulb size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Opportunités Importantes</p>
                  <p className="text-xl font-semibold">2</p>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-yellow-900 bg-opacity-50 flex items-center justify-center">
                  <Lightbulb size={20} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Opportunités À considérer</p>
                  <p className="text-xl font-semibold">0</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {opportunities.map((opportunity) => {
              const status = calculateOpportunityStatus(opportunity);
              const isExpanded = expandedOpportunity === opportunity.id;
              
              return (
                <div 
                  key={opportunity.id} 
                  className={`bg-gray-800 rounded-lg shadow-md overflow-hidden border-l-4 ${status.color}`}
                >
                  <div 
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedOpportunity(isExpanded ? null : opportunity.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium">{opportunity.title}</h3>
                          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${status.color.replace('bg-', 'bg-opacity-20 text-')}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{opportunity.description}</p>
                      </div>
                      <div className="flex space-x-1 ml-4">
                        <button className="text-gray-400 hover:text-yellow-400 p-1">
                          <Eye size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="flex items-center text-xs bg-gray-700 px-2 py-1 rounded-md">
                        <Users size={12} className="mr-1 text-blue-400" />
                        Segment: {opportunity.segment}
                      </div>
                      <div className="flex items-center text-xs bg-gray-700 px-2 py-1 rounded-md">
                        <TrendingUp size={12} className="mr-1 text-purple-400" />
                        Tendance: {opportunity.trend}
                      </div>
                      <div className="flex items-center text-xs bg-gray-700 px-2 py-1 rounded-md">
                        <Tag size={12} className="mr-1 text-green-400" />
                        Avantage: {opportunity.competitiveAdvantage}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-5 bg-gray-700 bg-opacity-30">
                      <div className="grid grid-cols-3 gap-6 mb-6">
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <DollarSign size={14} className="mr-1 text-green-400" />
                            Revenu Potentiel
                          </h4>
                          <p className="text-sm">{opportunity.potentialRevenue}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <GanttChartSquare size={14} className="mr-1 text-yellow-400" />
                            Difficulté de Mise en Œuvre
                          </h4>
                          <p className="text-sm">{opportunity.difficulty}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Calendar size={14} className="mr-1 text-blue-400" />
                            Horizon Temporel
                          </h4>
                          <p className="text-sm">{opportunity.timeframe}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <LayoutGrid size={14} className="mr-1 text-purple-400" />
                          Étapes de Mise en Œuvre
                        </h4>
                        <ol className="space-y-2 pl-6 text-sm list-decimal">
                          {opportunity.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
                        <button className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm flex items-center">
                          <FileText size={14} className="mr-2" />
                          Créer un plan d'action
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {opportunities.length === 0 && (
              <div className="bg-gray-800 p-8 rounded-lg shadow-md text-center">
                <div className="text-gray-400 mb-3">
                  <Lightbulb size={40} className="mx-auto mb-3 opacity-50" />
                  <p>Aucune opportunité n'a encore été identifiée.</p>
                  <p className="text-sm mt-2">
                    Ajoutez des segments de clientèle, des concurrents et des tendances, 
                    puis analysez les opportunités potentielles.
                  </p>
                </div>
                <button 
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-md text-sm mt-4"
                  onClick={generateOpportunities}
                >
                  Analyser les Opportunités
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informations contextuelles */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 border-opacity-50 rounded-lg p-4 mt-8">
        <div className="flex items-start">
          <div className="bg-blue-900 rounded-full p-2 mr-4 mt-1">
            <Info size={20} className="text-blue-300" />
          </div>
          <div>
            <h3 className="font-medium mb-1">Analyse de marché et développement commercial</h3>
            <p className="text-sm text-gray-300">
              Une analyse de marché complète vous aide à identifier les opportunités, comprendre vos clients et vous démarquer de la concurrence. 
              Utilisez cet outil pour structurer votre réflexion et développer une stratégie commerciale efficace.
            </p>
            <p className="text-sm text-gray-300 mt-2">
              Pensez à mettre à jour régulièrement votre analyse pour rester aligné avec les évolutions du marché.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysisComponent;