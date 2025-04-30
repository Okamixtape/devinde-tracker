import React, { useState } from "react";
import { Save, Trash2, Plus, Edit, X } from "lucide-react";
import type { BusinessPlanData } from "./types";

// Types pour les éléments de tarification
type PricingItem = {
  id: string;
  name: string;
  hourlyRate: number;
  dailyRate?: number;
  description?: string;
};

type PackageItem = {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  timeframe: string;
  description?: string;
};

type SubscriptionItem = {
  id: string;
  name: string;
  price: number;
  included: string[];
  description?: string;
};

// Props du composant
type Props = {
  data: BusinessPlanData["businessModel"];
  updateData: (section: keyof BusinessPlanData, field: string, value: string[] | number) => void;
};

const PricingSection: React.FC<Props> = ({ data, updateData }) => {
  // État local pour les formulaires d'édition
  const [showHourlyForm, setShowHourlyForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  
  // État local pour les éléments en cours d'édition
  const [editingHourly, setEditingHourly] = useState<PricingItem | null>(null);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionItem | null>(null);

  // Conversion des chaînes en objets structurés pour les taux horaires
  const parseHourlyRates = (): PricingItem[] => {
    return data.hourlyRates.map((item, index) => {
      const parts = item.split(':');
      const name = parts[0].trim();
      
      // Extraction du taux horaire (ex: "35-45€/h")
      const rateMatch = parts[1]?.match(/(\d+)[-–]?(\d+)?€\/h/);
      const hourlyRate = rateMatch ? parseInt(rateMatch[1]) : 0;
      
      return {
        id: `hourly-${index}`,
        name,
        hourlyRate,
        dailyRate: hourlyRate * 8,
      };
    });
  };

  // Conversion des chaînes en objets structurés pour les forfaits
  const parsePackages = (): PackageItem[] => {
    return data.packages.map((item, index) => {
      const parts = item.split(':');
      const name = parts[0].trim();
      
      // Extraction de la fourchette de prix (ex: "1200-2500€")
      const priceMatch = parts[1]?.match(/(\d+)[-–](\d+)€/);
      const minPrice = priceMatch ? parseInt(priceMatch[1]) : 0;
      const maxPrice = priceMatch ? parseInt(priceMatch[2]) : 0;
      
      // Extraction du délai estimé s'il est présent
      const timeframeMatch = parts[1]?.match(/(\d+[-–]\d+\s+semaines)/);
      const timeframe = timeframeMatch ? timeframeMatch[1] : "";
      
      return {
        id: `package-${index}`,
        name,
        minPrice,
        maxPrice,
        timeframe,
      };
    });
  };

  // Conversion des chaînes en objets structurés pour les abonnements
  const parseSubscriptions = (): SubscriptionItem[] => {
    return data.subscriptions.map((item, index) => {
      const parts = item.split(':');
      const name = parts[0].trim();
      
      // Extraction du prix mensuel (ex: "400€/mois")
      const priceMatch = parts[1]?.match(/(\d+)€\/mois/);
      const price = priceMatch ? parseInt(priceMatch[1]) : 0;
      
      // Services inclus (si spécifiés)
      const includedServices = parts[1]?.includes('(') 
        ? parts[1].match(/\((.*?)\)/)?.[1].split(',').map(s => s.trim()) || []
        : [];
      
      return {
        id: `subscription-${index}`,
        name,
        price,
        included: includedServices,
      };
    });
  };

  // Sauvegarde d'un nouveau taux horaire
  const saveHourlyRate = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const nameInput = form.elements.namedItem('hourlyName') as HTMLInputElement;
    const rateInput = form.elements.namedItem('hourlyRate') as HTMLInputElement;
    
    if (nameInput.value && rateInput.value) {
      const newHourlyRate = `${nameInput.value}: ${rateInput.value}€/h`;
      const newRates = [...data.hourlyRates];
      
      if (editingHourly) {
        // Update existing
        const index = data.hourlyRates.findIndex(r => r.includes(editingHourly.name));
        if (index !== -1) {
          newRates[index] = newHourlyRate;
        }
      } else {
        // Add new
        newRates.push(newHourlyRate);
      }
      
      updateData("businessModel", "hourlyRates", newRates);
      setShowHourlyForm(false);
      setEditingHourly(null);
      form.reset();
    }
  };

  // Sauvegarde d'un nouveau forfait
  const savePackage = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const nameInput = form.elements.namedItem('packageName') as HTMLInputElement;
    const minInput = form.elements.namedItem('minPrice') as HTMLInputElement;
    const maxInput = form.elements.namedItem('maxPrice') as HTMLInputElement;
    const timeInput = form.elements.namedItem('timeframe') as HTMLInputElement;
    
    if (nameInput.value && minInput.value && maxInput.value) {
      const newPackage = `${nameInput.value}: ${minInput.value}-${maxInput.value}€${timeInput.value ? ` (${timeInput.value})` : ''}`;
      const newPackages = [...data.packages];
      
      if (editingPackage) {
        // Update existing
        const index = data.packages.findIndex(p => p.includes(editingPackage.name));
        if (index !== -1) {
          newPackages[index] = newPackage;
        }
      } else {
        // Add new
        newPackages.push(newPackage);
      }
      
      updateData("businessModel", "packages", newPackages);
      setShowPackageForm(false);
      setEditingPackage(null);
      form.reset();
    }
  };

  // Sauvegarde d'un nouvel abonnement
  const saveSubscription = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const nameInput = form.elements.namedItem('subscriptionName') as HTMLInputElement;
    const priceInput = form.elements.namedItem('subscriptionPrice') as HTMLInputElement;
    const includedInput = form.elements.namedItem('included') as HTMLInputElement;
    
    if (nameInput.value && priceInput.value) {
      const includedText = includedInput.value ? ` (${includedInput.value})` : '';
      const newSubscription = `${nameInput.value}: ${priceInput.value}€/mois${includedText}`;
      const newSubscriptions = [...data.subscriptions];
      
      if (editingSubscription) {
        // Update existing
        const index = data.subscriptions.findIndex(s => s.includes(editingSubscription.name));
        if (index !== -1) {
          newSubscriptions[index] = newSubscription;
        }
      } else {
        // Add new
        newSubscriptions.push(newSubscription);
      }
      
      updateData("businessModel", "subscriptions", newSubscriptions);
      setShowSubscriptionForm(false);
      setEditingSubscription(null);
      form.reset();
    }
  };

  // Suppression d'un taux horaire
  const deleteHourlyRate = (index: number) => {
    const newRates = data.hourlyRates.filter((_, i) => i !== index);
    updateData("businessModel", "hourlyRates", newRates);
  };

  // Suppression d'un forfait
  const deletePackage = (index: number) => {
    const newPackages = data.packages.filter((_, i) => i !== index);
    updateData("businessModel", "packages", newPackages);
  };

  // Suppression d'un abonnement
  const deleteSubscription = (index: number) => {
    const newSubscriptions = data.subscriptions.filter((_, i) => i !== index);
    updateData("businessModel", "subscriptions", newSubscriptions);
  };

  // Édition d'un taux horaire
  const editHourlyRate = (hourly: PricingItem) => {
    setEditingHourly(hourly);
    setShowHourlyForm(true);
  };

  // Édition d'un forfait
  const editPackage = (pkg: PackageItem) => {
    setEditingPackage(pkg);
    setShowPackageForm(true);
  };

  // Édition d'un abonnement
  const editSubscription = (subscription: SubscriptionItem) => {
    setEditingSubscription(subscription);
    setShowSubscriptionForm(true);
  };

  // Parsage des données
  const hourlyRates = parseHourlyRates();
  const packages = parsePackages();
  const subscriptions = parseSubscriptions();

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold mb-6">Politique de tarification</h2>
      
      {/* Section Tarifs horaires */}
      <div className="bg-white p-5 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tarifs horaires</h3>
          <button 
            className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center text-sm" 
            onClick={() => {
              setEditingHourly(null);
              setShowHourlyForm(!showHourlyForm);
            }}
          >
            {showHourlyForm ? <X size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
            {showHourlyForm ? "Annuler" : "Ajouter"}
          </button>
        </div>
        
        {showHourlyForm && (
          <form onSubmit={saveHourlyRate} className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Service</label>
                <input 
                  type="text" 
                  name="hourlyName" 
                  className="w-full p-2 border rounded" 
                  placeholder="Ex: Développement Front-end" 
                  defaultValue={editingHourly?.name || ""}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Taux horaire (€/h)</label>
                <input 
                  type="number" 
                  name="hourlyRate" 
                  className="w-full p-2 border rounded" 
                  placeholder="Ex: 40" 
                  defaultValue={editingHourly?.hourlyRate || ""}
                  required 
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                onClick={() => {
                  setShowHourlyForm(false);
                  setEditingHourly(null);
                }}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm flex items-center"
              >
                <Save size={16} className="mr-1" />
                Enregistrer
              </button>
            </div>
          </form>
        )}
        
        {hourlyRates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Service</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Taux horaire</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Équivalent jour</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hourlyRates.map((rate, index) => (
                  <tr key={rate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{rate.name}</td>
                    <td className="px-4 py-3 text-sm">{rate.hourlyRate}€/h</td>
                    <td className="px-4 py-3 text-sm">{rate.dailyRate}€/jour</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button 
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => editHourlyRate(rate)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteHourlyRate(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Aucun tarif horaire défini. Cliquez sur &quot;Ajouter&quot; pour commencer.
          </div>
        )}
      </div>
      
      {/* Section Forfaits par projet */}
      <div className="bg-white p-5 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Forfaits par projet</h3>
          <button 
            className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center text-sm" 
            onClick={() => {
              setEditingPackage(null);
              setShowPackageForm(!showPackageForm);
            }}
          >
            {showPackageForm ? <X size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
            {showPackageForm ? "Annuler" : "Ajouter"}
          </button>
        </div>
        
        {showPackageForm && (
          <form onSubmit={savePackage} className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Type de projet</label>
                <input 
                  type="text" 
                  name="packageName" 
                  className="w-full p-2 border rounded" 
                  placeholder="Ex: Site vitrine" 
                  defaultValue={editingPackage?.name || ""}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prix minimum (€)</label>
                <input 
                  type="number" 
                  name="minPrice" 
                  className="w-full p-2 border rounded" 
                  placeholder="Ex: 1200" 
                  defaultValue={editingPackage?.minPrice || ""}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prix maximum (€)</label>
                <input 
                  type="number" 
                  name="maxPrice" 
                  className="w-full p-2 border rounded" 
                  placeholder="Ex: 2500" 
                  defaultValue={editingPackage?.maxPrice || ""}
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Délai estimé</label>
                <input 
                  type="text" 
                  name="timeframe" 
                  className="w-full p-2 border rounded" 
                  placeholder="Ex: 2-3 semaines" 
                  defaultValue={editingPackage?.timeframe || ""}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                onClick={() => {
                  setShowPackageForm(false);
                  setEditingPackage(null);
                }}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm flex items-center"
              >
                <Save size={16} className="mr-1" />
                Enregistrer
              </button>
            </div>
          </form>
        )}
        
        {packages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type de projet</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fourchette de prix</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Délai estimé</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {packages.map((pkg, index) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{pkg.name}</td>
                    <td className="px-4 py-3 text-sm">{pkg.minPrice} - {pkg.maxPrice}€</td>
                    <td className="px-4 py-3 text-sm">{pkg.timeframe || "-"}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button 
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => editPackage(pkg)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deletePackage(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Aucun forfait défini. Cliquez sur &quot;Ajouter&quot; pour commencer.
          </div>
        )}
      </div>
      
      {/* Section Abonnements */}
      <div className="bg-white p-5 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Abonnements mensuels</h3>
          <button 
            className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center text-sm" 
            onClick={() => {
              setEditingSubscription(null);
              setShowSubscriptionForm(!showSubscriptionForm);
            }}
          >
            {showSubscriptionForm ? <X size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
            {showSubscriptionForm ? "Annuler" : "Ajouter"}
          </button>
        </div>
        
        {showSubscriptionForm && (
          <form onSubmit={saveSubscription} className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la formule</label>
                <input 
                  type="text" 
                  name="subscriptionName" 
                  className="w-full p-2 border rounded" 
                  placeholder="Ex: Support basique" 
                  defaultValue={editingSubscription?.name || ""}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prix mensuel (€)</label>
                <input 
                  type="number" 
                  name="subscriptionPrice" 
                  className="w-full p-2 border rounded" 
                  placeholder="Ex: 400" 
                  defaultValue={editingSubscription?.price || ""}
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Services inclus</label>
                <input 
                  type="text" 
                  name="included" 
                  className="w-full p-2 border rounded" 
                  placeholder="Ex: Maintenance, corrections de bugs (jusqu'à 10h)" 
                  defaultValue={editingSubscription?.included.join(', ') || ""}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                onClick={() => {
                  setShowSubscriptionForm(false);
                  setEditingSubscription(null);
                }}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm flex items-center"
              >
                <Save size={16} className="mr-1" />
                Enregistrer
              </button>
            </div>
          </form>
        )}
        
        {subscriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Formule</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Prix mensuel</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Services inclus</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((sub, index) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{sub.name}</td>
                    <td className="px-4 py-3 text-sm">{sub.price}€/mois</td>
                    <td className="px-4 py-3 text-sm">{sub.included.length > 0 ? sub.included.join(', ') : '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button 
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => editSubscription(sub)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteSubscription(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Aucun abonnement défini. Cliquez sur &quot;Ajouter&quot; pour commencer.
          </div>
        )}
      </div>
      
      {/* Calculateur de revenus */}
      <div className="bg-white p-5 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Simulateur de revenus</h3>
        <p className="text-sm text-gray-600 mb-3">
          Basé sur votre tarification actuelle, vous pouvez simuler différents scénarios de revenus.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Revenus mensuels (temps partiel)</h4>
            <p className="text-sm text-gray-600 mb-2">20h/semaine au taux horaire moyen</p>
            <div className="text-2xl font-bold text-blue-600">
              {hourlyRates.length > 0
                ? Math.round(
                    (hourlyRates.reduce((sum, rate) => sum + rate.hourlyRate, 0) / hourlyRates.length) * 20 * 4
                  )
                : 0}€
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Revenus mensuels (temps plein)</h4>
            <p className="text-sm text-gray-600 mb-2">35h/semaine au taux horaire moyen</p>
            <div className="text-2xl font-bold text-blue-600">
              {hourlyRates.length > 0
                ? Math.round(
                    (hourlyRates.reduce((sum, rate) => sum + rate.hourlyRate, 0) / hourlyRates.length) * 35 * 4
                  )
                : 0}€
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Revenus mensuels (projets)</h4>
            <p className="text-sm text-gray-600 mb-2">1 projet moyen par mois</p>
            <div className="text-2xl font-bold text-blue-600">
              {packages.length > 0
                ? Math.round(
                    packages.reduce((sum, pkg) => sum + (pkg.minPrice + pkg.maxPrice) / 2, 0) / packages.length
                  )
                : 0}€
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;