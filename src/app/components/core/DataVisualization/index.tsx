import React, { useEffect } from 'react';
import errorService, { ErrorService } from '../../../services/core/errorService';
import { ErrorCategory } from '../../../services/utils/errorHandling';

// Type for bar chart data
export interface BarChartDataItem {
  label: string;
  value: number;
  color?: string; // Optional custom color
  secondaryValue?: number; // Optional for comparison charts
  secondaryLabel?: string; // Label for secondary value
}

// Type for pie/donut chart data
export interface PieChartDataItem {
  label: string;
  value: number;
  color?: string; // Optional custom color
  percentage?: number; // Can be calculated automatically if not provided
}

// Type for line chart data
export interface LineChartDataItem {
  label: string;
  value: number;
  date?: string | Date; // For time-based charts
}

// Type for line chart series
export interface LineChartSeries {
  name: string;
  data: LineChartDataItem[];
  color?: string;
}

// Type for metric card data
export interface MetricData {
  title: string;
  value: number | string;
  unit?: string;
  description?: string;
  change?: {
    value: number;
    percentage?: boolean;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  status?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

// Colors from design system
export const chartColors = {
  blue: '#3b82f6', // blue-500
  green: '#10b981', // green-500
  yellow: '#f59e0b', // yellow-500
  red: '#ef4444', // red-500
  purple: '#8b5cf6', // purple-500
  indigo: '#6366f1', // indigo-500
  cyan: '#06b6d4', // cyan-500
  pink: '#ec4899', // pink-500
  gray: '#6b7280', // gray-500
};

// Props for all chart types
interface BaseChartProps {
  /**
   * Title for the chart
   */
  title?: string;
  
  /**
   * Description or subtitle
   */
  description?: string;
  
  /**
   * Height of the chart (can be number for pixels or string for other units)
   */
  height?: number | string;
  
  /**
   * Width of the chart (can be number for pixels or string for other units)
   */
  width?: number | string;
  
  /**
   * Custom CSS class
   */
  className?: string;
  
  /**
   * Whether to show a loading indicator
   */
  isLoading?: boolean;
  
  /**
   * Error state
   */
  error?: Error | unknown;
  
  /**
   * Optional error service instance for error handling
   */
  errorService?: ErrorService;
  
  /**
   * Called when retry is clicked in error state
   */
  onRetry?: () => void;
  
  /**
   * Whether to show the legend
   */
  showLegend?: boolean;
  
  /**
   * Whether to show data labels on the chart
   */
  showDataLabels?: boolean;
  
  /**
   * Called when a data point is clicked
   */
  onDataPointClick?: (item: any, index: number) => void;
}

// Props for bar chart
export interface BarChartProps extends BaseChartProps {
  /**
   * Data for the bar chart
   */
  data: BarChartDataItem[];
  
  /**
   * Orientation of the bars
   */
  orientation?: 'vertical' | 'horizontal';
  
  /**
   * Show grid lines
   */
  showGrid?: boolean;
  
  /**
   * Whether to show comparison bars (using secondaryValue)
   */
  showComparison?: boolean;
  
  /**
   * Format function for values
   */
  formatValue?: (value: number) => string;
  
  /**
   * Maximum value for the axis (auto-calculated if not provided)
   */
  maxValue?: number;
}

// Props for pie/donut chart
export interface PieChartProps extends BaseChartProps {
  /**
   * Data for the pie chart
   */
  data: PieChartDataItem[];
  
  /**
   * Whether to render as a donut chart
   */
  donut?: boolean;
  
  /**
   * Inner radius ratio for donut charts (0-1)
   */
  innerRadius?: number;
  
  /**
   * Format function for labels
   */
  formatLabel?: (value: number, percentage: number) => string;
}

// Props for line chart
export interface LineChartProps extends BaseChartProps {
  /**
   * Data series for the line chart
   */
  series: LineChartSeries[];
  
  /**
   * Show grid lines
   */
  showGrid?: boolean;
  
  /**
   * Show area under the line
   */
  area?: boolean;
  
  /**
   * Show data points
   */
  showPoints?: boolean;
  
  /**
   * Format function for Y-axis labels
   */
  formatYAxis?: (value: number) => string;
  
  /**
   * Format function for X-axis labels
   */
  formatXAxis?: (value: string) => string;
}

// Props for metric card
export interface MetricCardProps extends Omit<BaseChartProps, 'height' | 'width'> {
  /**
   * Data for the metric card
   */
  data: MetricData;
  
  /**
   * Size of the card
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Format function for the main value
   */
  formatValue?: (value: number | string) => string;
}

// Props for progress bar
export interface ProgressBarProps extends Omit<BaseChartProps, 'height'> {
  /**
   * Value of the progress (0-100)
   */
  value: number;
  
  /**
   * Target value to show as a marker
   */
  target?: number;
  
  /**
   * Color of the progress bar
   */
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  
  /**
   * Size of the progress bar
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether to show the percentage text
   */
  showPercentage?: boolean;
  
  /**
   * Format function for the value label
   */
  formatLabel?: (value: number) => string;
}

/**
 * SimpleBarChart - A simple bar chart implementation
 */
export const SimpleBarChart: React.FC<BarChartProps> = ({
  title,
  description,
  data,
  height = 200,
  width = '100%',
  className = '',
  isLoading = false,
  error,
  errorService: providedErrorService,
  onRetry,
  showLegend = true,
  showDataLabels = false,
  onDataPointClick,
  orientation = 'vertical',
  showGrid = true,
  showComparison = false,
  formatValue = (value) => value.toString(),
  maxValue: providedMaxValue
}) => {
  // Use the provided errorService or the default instance
  const errService = providedErrorService || errorService;
  
  // Process error if one is provided
  useEffect(() => {
    if (error) {
      errService.handleError(error, {
        context: { component: 'SimpleBarChart', data }
      });
    }
  }, [error, errService, data]);
  
  // Handle click on a bar
  const handleBarClick = (item: BarChartDataItem, index: number) => {
    if (onDataPointClick) {
      onDataPointClick(item, index);
    }
  };
  
  // Calculate maximum value for the chart
  const maxValue = providedMaxValue || Math.max(
    ...data.map(item => Math.max(
      item.value, 
      item.secondaryValue || 0
    ))
  ) * 1.1; // Add 10% padding
  
  // Render a loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`} style={{ width, height }}>
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <div className="animate-pulse space-y-3 mt-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }
  
  // Render an error state
  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`} style={{ width, height }}>
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <div className="flex flex-col items-center justify-center h-full text-center">
          <svg className="w-8 h-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-gray-400 mb-3">Impossible de charger le graphique</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Render an empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`} style={{ width, height }}>
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <div className="flex flex-col items-center justify-center h-full text-center">
          <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm text-gray-400">Aucune donnée à afficher</p>
        </div>
      </div>
    );
  }
  
  // Render the chart
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`} style={{ width }}>
      {/* Chart header */}
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
      )}
      
      {/* Chart content */}
      <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        {orientation === 'vertical' ? (
          // Vertical bar chart
          <div className="flex items-end h-full space-x-2 relative pt-6">
            {/* Grid lines */}
            {showGrid && (
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center w-full">
                    <div className="w-12 text-xs text-gray-500 pr-2 text-right">
                      {formatValue(maxValue * (4 - i) / 4)}
                    </div>
                    <div className="flex-1 border-t border-gray-700"></div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Bars */}
            <div className="flex-1 flex items-end justify-around h-full z-10 pt-6">
              {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative flex items-end justify-center">
                    {/* Primary bar */}
                    <div
                      className={`w-8 ${item.color || 'bg-blue-600'} rounded-t-sm cursor-pointer transition-all hover:opacity-80`}
                      style={{ height: `${(item.value / maxValue) * 100}%` }}
                      onClick={() => handleBarClick(item, index)}
                    >
                      {showDataLabels && (
                        <div className="absolute -top-6 left-0 right-0 text-center text-xs">
                          {formatValue(item.value)}
                        </div>
                      )}
                    </div>
                    
                    {/* Secondary bar for comparison */}
                    {showComparison && item.secondaryValue !== undefined && (
                      <div
                        className="w-4 bg-gray-500 rounded-t-sm ml-1 cursor-pointer transition-all hover:opacity-80"
                        style={{ height: `${(item.secondaryValue / maxValue) * 100}%` }}
                        onClick={() => handleBarClick({ ...item, value: item.secondaryValue || 0 }, index)}
                      >
                        {showDataLabels && (
                          <div className="absolute -top-6 left-0 right-0 text-center text-xs">
                            {formatValue(item.secondaryValue)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* X-axis label */}
                  <div className="mt-2 text-xs text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis" style={{ maxWidth: '80px' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Horizontal bar chart
          <div className="space-y-4 h-full">
            {data.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-xs text-gray-400 truncate pr-2">{item.label}</div>
                <div className="flex-1 h-8 bg-gray-700 rounded-sm">
                  <div
                    className={`h-full ${item.color || 'bg-blue-600'} rounded-sm cursor-pointer transition-all hover:opacity-80 flex items-center px-2`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                    onClick={() => handleBarClick(item, index)}
                  >
                    {showDataLabels && (
                      <span className="text-xs text-white">{formatValue(item.value)}</span>
                    )}
                  </div>
                </div>
                <div className="w-16 text-xs text-right pl-2">{formatValue(item.value)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Legend */}
      {showLegend && showComparison && (
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-sm mr-2"></div>
            <span className="text-xs text-gray-400">Valeur actuelle</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-sm mr-2"></div>
            <span className="text-xs text-gray-400">{data[0]?.secondaryLabel || 'Comparaison'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * SimplePieChart - A simple pie/donut chart implementation
 */
export const SimplePieChart: React.FC<PieChartProps> = ({
  title,
  description,
  data,
  height = 200,
  width = '100%',
  className = '',
  isLoading = false,
  error,
  errorService: providedErrorService,
  onRetry,
  showLegend = true,
  showDataLabels = false,
  onDataPointClick,
  donut = false,
  innerRadius = 0.6,
  formatLabel = (value, percentage) => `${percentage}%`
}) => {
  // Use the provided errorService or the default instance
  const errService = providedErrorService || errorService;
  
  // Process error if one is provided
  useEffect(() => {
    if (error) {
      errService.handleError(error, {
        context: { component: 'SimplePieChart', data }
      });
    }
  }, [error, errService, data]);
  
  // Calculate total value for percentages
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;
  
  // Calculate percentages if not provided
  const dataWithPercentages = data?.map(item => ({
    ...item,
    percentage: item.percentage !== undefined 
      ? item.percentage 
      : Math.round((item.value / total) * 100)
  }));
  
  // Default color set if not provided
  const defaultColors = [
    chartColors.blue,
    chartColors.green,
    chartColors.yellow,
    chartColors.purple,
    chartColors.red,
    chartColors.indigo,
    chartColors.cyan,
    chartColors.pink,
  ];
  
  // Handle click on a segment
  const handleSegmentClick = (item: PieChartDataItem, index: number) => {
    if (onDataPointClick) {
      onDataPointClick(item, index);
    }
  };
  
  // Render a loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`} style={{ width, height }}>
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <div className="animate-pulse flex justify-center items-center" style={{ height: '80%' }}>
          <div className="rounded-full bg-gray-700 h-32 w-32"></div>
        </div>
      </div>
    );
  }
  
  // Render an error state
  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`} style={{ width, height }}>
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <div className="flex flex-col items-center justify-center h-full text-center">
          <svg className="w-8 h-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-gray-400 mb-3">Impossible de charger le graphique</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Render an empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`} style={{ width, height }}>
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <div className="flex flex-col items-center justify-center h-full text-center">
          <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p className="text-sm text-gray-400">Aucune donnée à afficher</p>
        </div>
      </div>
    );
  }
  
  // This is a simple SVG-based pie chart
  // For a production app, you might want to use a library like D3 or Chart.js
  
  // Calculate SVG dimensions
  const size = Math.min(Number(height) || 200, 300);
  const center = size / 2;
  const radius = center * 0.8;
  const innerRadiusValue = donut ? radius * innerRadius : 0;
  
  // Calculate pie segments
  let currentAngle = 0;
  const segments = dataWithPercentages.map((item, index) => {
    const angle = (item.percentage || 0) * 3.6; // Convert percentage to degrees
    const startAngle = currentAngle;
    currentAngle += angle;
    const endAngle = currentAngle;
    
    // SVG arc parameters
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    
    const innerX1 = center + innerRadiusValue * Math.cos(startRad);
    const innerY1 = center + innerRadiusValue * Math.sin(startRad);
    const innerX2 = center + innerRadiusValue * Math.cos(endRad);
    const innerY2 = center + innerRadiusValue * Math.sin(endRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Calculate label position (middle of the arc)
    const labelRad = (startRad + endRad) / 2;
    const labelRadius = (radius + innerRadiusValue) / 2;
    const labelX = center + labelRadius * Math.cos(labelRad);
    const labelY = center + labelRadius * Math.sin(labelRad);
    
    // SVG path for the arc
    let path;
    
    if (donut) {
      path = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${innerX2} ${innerY2}
        A ${innerRadiusValue} ${innerRadiusValue} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}
        Z
      `;
    } else {
      path = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;
    }
    
    return {
      ...item,
      path,
      labelX,
      labelY,
      color: item.color || defaultColors[index % defaultColors.length]
    };
  });
  
  // Render the chart
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`} style={{ width }}>
      {/* Chart header */}
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row items-center">
        {/* SVG chart */}
        <div className="relative" style={{ height: size, width: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            {segments.map((segment, index) => (
              <g key={index}>
                <path
                  d={segment.path}
                  fill={segment.color}
                  stroke="#111827" // bg-gray-900
                  strokeWidth="1"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onClick={() => handleSegmentClick(segment, index)}
                  data-testid={`pie-segment-${index}`}
                />
                {showDataLabels && segment.percentage > 5 && (
                  <text
                    x={segment.labelX}
                    y={segment.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize="10"
                    className="pointer-events-none"
                  >
                    {formatLabel(segment.value, segment.percentage || 0)}
                  </text>
                )}
              </g>
            ))}
            
            {/* Center text for donut chart */}
            {donut && (
              <text
                x={center}
                y={center}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium fill-current text-white"
              >
                {total}
              </text>
            )}
          </svg>
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className={`mt-4 md:mt-0 ${donut ? 'md:ml-6' : 'md:ml-6'} space-y-2 flex-grow`}>
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-sm mr-2"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <span className="text-xs">{segment.label}</span>
                </div>
                <div className="flex space-x-3">
                  <span className="text-xs font-medium">{segment.value}</span>
                  <span className="text-xs text-gray-400">{segment.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * MetricCard - A simple card for displaying a key metric
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  data,
  className = '',
  isLoading = false,
  error,
  errorService: providedErrorService,
  onRetry,
  size = 'md',
  formatValue = (value) => String(value)
}) => {
  // Use the provided errorService or the default instance
  const errService = providedErrorService || errorService;
  
  // Process error if one is provided
  useEffect(() => {
    if (error) {
      errService.handleError(error, {
        context: { component: 'MetricCard', data }
      });
    }
  }, [error, errService, data]);
  
  // Get size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return { container: 'p-3', title: 'text-xs', value: 'text-lg', change: 'text-xs' };
      case 'lg': return { container: 'p-5', title: 'text-sm', value: 'text-3xl', change: 'text-sm' };
      default: return { container: 'p-4', title: 'text-sm', value: 'text-2xl', change: 'text-xs' }; // md
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  // Get status color classes
  const getStatusColorClasses = () => {
    switch (data?.status) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return '';
    }
  };
  
  // Render a loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg ${sizeClasses.container} ${className}`}>
        {title && <div className={`${sizeClasses.title} text-gray-400 mb-1`}>{title}</div>}
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-gray-700 rounded w-2/3"></div>
          <div className="h-3 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }
  
  // Render an error state
  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg ${sizeClasses.container} ${className}`}>
        {title && <div className={`${sizeClasses.title} text-gray-400 mb-1`}>{title}</div>}
        <div className="flex items-center text-red-400">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-xs">Erreur</span>
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }
  
  // Render an empty state if no data
  if (!data) {
    return (
      <div className={`bg-gray-800 rounded-lg ${sizeClasses.container} ${className}`}>
        {title && <div className={`${sizeClasses.title} text-gray-400 mb-1`}>{title}</div>}
        <div className="text-gray-500 text-xs">Aucune donnée</div>
      </div>
    );
  }
  
  // Render the metric card
  return (
    <div className={`bg-gray-800 rounded-lg ${sizeClasses.container} ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          {title || data.title ? (
            <div className={`${sizeClasses.title} text-gray-400 mb-1`}>{title || data.title}</div>
          ) : null}
          <div className={`${sizeClasses.value} font-bold ${getStatusColorClasses()}`}>
            {formatValue(data.value)}
            {data.unit && <span className="text-gray-400 ml-1 text-sm">{data.unit}</span>}
          </div>
          
          {data.change && (
            <div className={`flex items-center mt-1 ${sizeClasses.change}`}>
              <span className={`flex items-center ${
                data.change.direction === 'up' ? 'text-green-400' :
                data.change.direction === 'down' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {data.change.direction === 'up' && (
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {data.change.direction === 'down' && (
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {data.change.value > 0 && '+'}
                {data.change.value}{data.change.percentage ? '%' : ''}
              </span>
              {data.change.label && (
                <span className="text-gray-400 ml-2">{data.change.label}</span>
              )}
            </div>
          )}
          
          {data.description && (
            <div className="text-xs text-gray-400 mt-1">{data.description}</div>
          )}
        </div>
        
        {data.icon && (
          <div className="p-2 rounded-lg bg-gray-700 bg-opacity-50">
            {data.icon}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ProgressBar - A simple progress bar component
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  title,
  description,
  value,
  target,
  width = '100%',
  className = '',
  isLoading = false,
  error,
  errorService: providedErrorService,
  onRetry,
  color = 'blue',
  size = 'md',
  showPercentage = true,
  formatLabel = (value) => `${value}%`
}) => {
  // Use the provided errorService or the default instance
  const errService = providedErrorService || errorService;
  
  // Process error if one is provided
  useEffect(() => {
    if (error) {
      errService.handleError(error, {
        context: { component: 'ProgressBar', value }
      });
    }
  }, [error, errService, value]);
  
  // Get color classes
  const getColorClasses = () => {
    switch (color) {
      case 'green': return 'bg-green-600';
      case 'yellow': return 'bg-yellow-600';
      case 'red': return 'bg-red-600';
      case 'purple': return 'bg-purple-600';
      case 'gray': return 'bg-gray-600';
      default: return 'bg-blue-600';
    }
  };
  
  // Get size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-1.5';
      case 'lg': return 'h-4';
      default: return 'h-2.5'; // md
    }
  };
  
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(0, value), 100);
  
  // Render a loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`} style={{ width }}>
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <div className="animate-pulse space-y-2">
          <div className="h-2 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  // Render an error state
  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`} style={{ width }}>
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <div className="flex items-center text-red-400">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-xs">Erreur</span>
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }
  
  // Render the progress bar
  return (
    <div className={`${className}`} style={{ width }}>
      {/* Header */}
      {(title || description || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          <div>
            {title && <h3 className="text-sm font-medium">{title}</h3>}
            {description && <p className="text-xs text-gray-400">{description}</p>}
          </div>
          {showPercentage && (
            <div className="text-sm font-medium">{formatLabel(clampedValue)}</div>
          )}
        </div>
      )}
      
      {/* Progress bar */}
      <div className={`w-full bg-gray-700 rounded-full ${getSizeClasses()} relative`}>
        <div
          className={`${getSizeClasses()} ${getColorClasses()} rounded-full`}
          style={{ width: `${clampedValue}%` }}
        ></div>
        
        {/* Target marker */}
        {target !== undefined && target >= 0 && target <= 100 && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white"
            style={{ left: `${target}%` }}
          ></div>
        )}
      </div>
    </div>
  );
};

/**
 * DataVisualization - A component that wraps all visualization components
 * and provides a consistent interface for displaying data visualizations.
 * 
 * This is the main export from this module and should be used for all
 * data visualization needs in the application.
 */
export const DataVisualization = {
  BarChart: SimpleBarChart,
  PieChart: SimplePieChart,
  MetricCard,
  ProgressBar,
};

export default DataVisualization;