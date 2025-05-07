import { useState, useEffect, useMemo } from "react";
import { Home, Edit, Users, PieChart, TrendingUp, FileText, Calendar } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import type { ExtendedSectionKey, NavSection } from "@/app/components/Sidebar";

/**
 * Type du résultat retourné par le hook useSectionsData
 */
export interface SectionsDataResult {
  sections: NavSection[];
  activeSection: ExtendedSectionKey;
  setActiveSection: (section: ExtendedSectionKey) => void;
  toggleTheme: () => void;
}

/**
 * Type pour représenter un icône sans utiliser JSX
 */
export interface IconConfig {
  component: typeof Home | typeof Edit | typeof Users | typeof PieChart | 
              typeof TrendingUp | typeof FileText | typeof Calendar;
  size: number;
}

/**
 * Hook personnalisé pour gérer les données des sections et la navigation
 * @param initialActiveSection - La section active initiale
 * @returns Objet contenant les sections, la section active, et les fonctions de navigation
 */
export function useSectionsData(initialActiveSection: ExtendedSectionKey): SectionsDataResult {
  const [activeSection, setActiveSection] = useState<ExtendedSectionKey>(initialActiveSection);
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme } = useTheme();

  // Mettre à jour l'URL lorsque la section active change
  useEffect(() => {
    if (activeSection && activeSection !== "dashboard") {
      router.push(`/${activeSection}`);
    } else if (activeSection === "dashboard" && pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  }, [activeSection, router, pathname]);

  // Construction des sections pour la barre latérale
  const sections = useMemo<NavSection[]>(() => {
    // Mapping des clés de section aux libellés affichés (déplacé à l'intérieur du useMemo)
    const SECTION_LABELS: Record<string, string> = {
      dashboard: "Tableau de bord",
      businessModel: "Modèle économique",
      marketAnalysis: "Analyse de marché",
      actionPlan: "Plan d'action",
      financials: "Finances",
      pitch: "Pitch",
      services: "Services"
    };
    
    return [
      { 
        key: "dashboard", 
        label: SECTION_LABELS.dashboard, 
        iconConfig: { component: Home, size: 18 }
      },
      { 
        key: "pitch", 
        label: SECTION_LABELS.pitch, 
        iconConfig: { component: Edit, size: 18 }
      },
      { 
        key: "services", 
        label: SECTION_LABELS.services, 
        iconConfig: { component: Users, size: 18 }
      },
      { 
        key: "businessModel", 
        label: SECTION_LABELS.businessModel, 
        iconConfig: { component: PieChart, size: 18 }
      },
      { 
        key: "marketAnalysis", 
        label: SECTION_LABELS.marketAnalysis, 
        iconConfig: { component: TrendingUp, size: 18 }
      },
      { 
        key: "financials", 
        label: SECTION_LABELS.financials, 
        iconConfig: { component: FileText, size: 18 }
      },
      { 
        key: "actionPlan", 
        label: SECTION_LABELS.actionPlan, 
        iconConfig: { component: Calendar, size: 18 }
      }
    ];
  }, []);

  // Gestionnaire pour changer de section
  const handleSectionChange = (section: ExtendedSectionKey) => {
    setActiveSection(section);
  };

  return {
    sections,
    activeSection,
    setActiveSection: handleSectionChange,
    toggleTheme
  };
}
