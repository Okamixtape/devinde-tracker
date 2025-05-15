/**
 * Interfaces de compatibilité pour la migration vers les interfaces standardisées
 * 
 * Ce fichier fournit des adaptateurs et des utilitaires pour faciliter la transition
 * entre les anciennes interfaces et les nouvelles interfaces standardisées.
 * 
 * @version 1.0
 * @standardized true
 */

import { MarketAnalysisData, TargetClient, Competitor } from '../../services/interfaces/dataModels';
import { 
  ServiceCustomerSegment,
  ServiceCompetitor,
  ServiceMarketOpportunity,
  ServiceMarketTrend
} from '../market-analysis/market-analysis';

/**
 * Convertit un ServiceCustomerSegment vers le format TargetClient existant
 */
export function toTargetClient(segment: ServiceCustomerSegment): TargetClient {
  return {
    id: segment.id,
    segment: segment.name, // Mappage du nom vers le segment
    needs: segment.needs,
    description: segment.description
  };
}

/**
 * Convertit un ServiceCompetitor vers le format Competitor existant
 */
export function toCompetitor(competitor: ServiceCompetitor): Competitor {
  return {
    id: competitor.id,
    name: competitor.name,
    strengths: competitor.strengths,
    weaknesses: competitor.weaknesses,
    url: competitor.website
  };
}

/**
 * Convertit un tableau de tendances vers le format de chaînes simples
 */
export function toTrendStrings(trends: ServiceMarketTrend[]): string[] {
  return trends.map(trend => `${trend.title}: ${trend.description}`);
}

/**
 * Adapte les données standardisées au format MarketAnalysisData existant
 */
export function adaptToMarketAnalysisData(
  targetClients: ServiceCustomerSegment[],
  competitors: ServiceCompetitor[],
  opportunities: ServiceMarketOpportunity[],
  trends: ServiceMarketTrend[]
): MarketAnalysisData {
  return {
    targetClients: targetClients.map(toTargetClient),
    competitors: competitors.map(toCompetitor),
    trends: toTrendStrings(trends)
  } as MarketAnalysisData;
}
