import React, { useState, useEffect } from 'react';
import { CardContainer } from '../../core/CardContainer';
import errorService from '../../../services/core/errorService';
import { AppError } from '../../../services/utils/errorHandling';

interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
}

interface BusinessMetricsCardProps {
  title: string;
  businessPlanId: string;
  timeframe?: 'day' | 'week' | 'month' | 'year';
  onRefresh?: () => void;
}

/**
 * BusinessMetricsCard - Displays key business metrics in a card format
 * 
 * This component demonstrates how to use the CardContainer with business logic,
 * loading states, error handling, and data formatting.
 */
export const BusinessMetricsCard: React.FC<BusinessMetricsCardProps> = ({
  title,
  businessPlanId,
  timeframe = 'month',
  onRefresh
}) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Simulated fetch function for metrics data
  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // using the business plan ID and timeframe
      
      // Simulating an API response
      setTimeout(() => {
        // Occasionally simulate an error for demonstration
        if (Math.random() < 0.2) {
          throw new AppError('NETWORK_ERROR', {
            message: 'Failed to fetch business metrics. Please check your connection.'
          });
        }
        
        const demoMetrics: Metric[] = [
          {
            id: 'm1',
            name: 'Revenue',
            value: 2450,
            unit: '€',
            change: {
              value: 12.5,
              direction: 'up'
            }
          },
          {
            id: 'm2',
            name: 'Active Clients',
            value: 7,
            unit: '',
            change: {
              value: 2,
              direction: 'up'
            }
          },
          {
            id: 'm3',
            name: 'Projects',
            value: 4,
            unit: '',
            change: {
              value: 1,
              direction: 'down'
            }
          }
        ];
        
        setMetrics(demoMetrics);
        setIsLoading(false);
      }, 1500); // Simulate network delay
      
    } catch (err) {
      errorService.handleError(err, {
        context: { businessPlanId, timeframe }
      });
      setError(err as Error);
      setIsLoading(false);
    }
  };

  // Fetch metrics on mount and when dependencies change
  useEffect(() => {
    fetchMetrics();
  }, [businessPlanId, timeframe]);

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Render metric card content
  const renderMetrics = () => (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map(metric => (
        <div key={metric.id} className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">{metric.name}</div>
          <div className="text-xl font-bold mt-1">
            {metric.unit === '€' 
              ? formatCurrency(metric.value) 
              : `${metric.value}${metric.unit}`}
          </div>
          {metric.change && (
            <div className="flex items-center mt-1 text-xs">
              <span className={`flex items-center ${
                metric.change.direction === 'up' ? 'text-green-400' :
                metric.change.direction === 'down' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {metric.change.direction === 'up' && (
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {metric.change.direction === 'down' && (
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {metric.change.value > 0 && '+'}
                {metric.change.value}
                {metric.unit === '€' ? '%' : ''}
              </span>
              <span className="text-gray-500 ml-2">vs last {timeframe}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Card actions with refresh button
  const cardActions = (
    <button 
      className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300"
      onClick={() => {
        fetchMetrics();
        if (onRefresh) onRefresh();
      }}
      aria-label="Refresh metrics"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  );

  // Card subtitle based on timeframe
  const getSubtitle = () => {
    switch (timeframe) {
      case 'day': return 'Daily metrics';
      case 'week': return 'Weekly metrics';
      case 'month': return 'Monthly metrics';
      case 'year': return 'Yearly metrics';
      default: return 'Business metrics';
    }
  };

  return (
    <CardContainer
      title={title}
      subtitle={getSubtitle()}
      actions={cardActions}
      isLoading={isLoading}
      error={error}
      isEmpty={metrics.length === 0}
      emptyMessage="No metrics available for the selected timeframe."
      onRetry={fetchMetrics}
      status="default"
    >
      {renderMetrics()}
    </CardContainer>
  );
};

export default BusinessMetricsCard;