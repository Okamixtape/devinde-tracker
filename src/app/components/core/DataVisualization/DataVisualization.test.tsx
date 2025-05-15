import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  SimpleBarChart, 
  SimplePieChart, 
  MetricCard, 
  ProgressBar,
  BarChartDataItem,
  PieChartDataItem,
  MetricData
} from './index';
import { AppError, ErrorCategory } from '../../../services/utils/errorHandling';

describe('DataVisualization Components', () => {
  // SimpleBarChart tests
  describe('SimpleBarChart', () => {
    const sampleData: BarChartDataItem[] = [
      { label: 'Jan', value: 10 },
      { label: 'Feb', value: 20 },
      { label: 'Mar', value: 15 },
      { label: 'Apr', value: 25 },
    ];

    test('renders with title and data', () => {
      render(
        <SimpleBarChart
          title="Sample Bar Chart"
          data={sampleData}
        />
      );
      
      expect(screen.getByText('Sample Bar Chart')).toBeInTheDocument();
      expect(screen.getByText('Jan')).toBeInTheDocument();
      expect(screen.getByText('Feb')).toBeInTheDocument();
      expect(screen.getByText('Mar')).toBeInTheDocument();
      expect(screen.getByText('Apr')).toBeInTheDocument();
    });
    
    test('renders loading state', () => {
      render(
        <SimpleBarChart
          title="Sample Bar Chart"
          data={sampleData}
          isLoading={true}
        />
      );
      
      expect(screen.getByText('Sample Bar Chart')).toBeInTheDocument();
      // Should not render the data when loading
      expect(screen.queryByText('Jan')).not.toBeInTheDocument();
    });
    
    test('renders error state', () => {
      const testError = new Error('Test error');
      
      render(
        <SimpleBarChart
          title="Sample Bar Chart"
          data={sampleData}
          error={testError}
        />
      );
      
      expect(screen.getByText('Sample Bar Chart')).toBeInTheDocument();
      expect(screen.getByText('Impossible de charger le graphique')).toBeInTheDocument();
    });
    
    test('renders empty state', () => {
      render(
        <SimpleBarChart
          title="Sample Bar Chart"
          data={[]}
        />
      );
      
      expect(screen.getByText('Sample Bar Chart')).toBeInTheDocument();
      expect(screen.getByText('Aucune donnée à afficher')).toBeInTheDocument();
    });
    
    test('calls onRetry when retry button is clicked', () => {
      const mockRetry = jest.fn();
      const testError = new Error('Test error');
      
      render(
        <SimpleBarChart
          title="Sample Bar Chart"
          data={sampleData}
          error={testError}
          onRetry={mockRetry}
        />
      );
      
      fireEvent.click(screen.getByText('Réessayer'));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
    
    test('calls onDataPointClick when a bar is clicked', () => {
      const mockClick = jest.fn();
      
      render(
        <SimpleBarChart
          title="Sample Bar Chart"
          data={sampleData}
          onDataPointClick={mockClick}
        />
      );
      
      // Find a bar and click it
      const bars = document.querySelectorAll('.bg-blue-600');
      fireEvent.click(bars[0]);
      
      expect(mockClick).toHaveBeenCalledTimes(1);
      expect(mockClick).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Jan', value: 10 }),
        0
      );
    });
    
    test('renders horizontal bars', () => {
      render(
        <SimpleBarChart
          title="Sample Bar Chart"
          data={sampleData}
          orientation="horizontal"
        />
      );
      
      expect(screen.getByText('Jan')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
    
    test('renders with custom formatValue function', () => {
      render(
        <SimpleBarChart
          title="Sample Bar Chart"
          data={sampleData}
          orientation="horizontal"
          formatValue={(value) => `${value}€`}
        />
      );
      
      expect(screen.getByText('10€')).toBeInTheDocument();
    });
    
    test('renders comparison bars', () => {
      const dataWithComparison: BarChartDataItem[] = [
        { label: 'Jan', value: 10, secondaryValue: 8, secondaryLabel: 'Last Year' },
        { label: 'Feb', value: 20, secondaryValue: 15 },
        { label: 'Mar', value: 15, secondaryValue: 12 },
      ];
      
      render(
        <SimpleBarChart
          title="Comparison Chart"
          data={dataWithComparison}
          showComparison={true}
          showLegend={true}
        />
      );
      
      expect(screen.getByText('Last Year')).toBeInTheDocument();
      expect(screen.getByText('Valeur actuelle')).toBeInTheDocument();
    });
  });

  // SimplePieChart tests
  describe('SimplePieChart', () => {
    const sampleData: PieChartDataItem[] = [
      { label: 'Category A', value: 30 },
      { label: 'Category B', value: 40 },
      { label: 'Category C', value: 20 },
      { label: 'Category D', value: 10 },
    ];

    test('renders with title and data', () => {
      render(
        <SimplePieChart
          title="Sample Pie Chart"
          data={sampleData}
        />
      );
      
      expect(screen.getByText('Sample Pie Chart')).toBeInTheDocument();
      expect(screen.getByText('Category A')).toBeInTheDocument();
      expect(screen.getByText('Category B')).toBeInTheDocument();
      expect(screen.getByText('Category C')).toBeInTheDocument();
      expect(screen.getByText('Category D')).toBeInTheDocument();
    });
    
    test('renders loading state', () => {
      render(
        <SimplePieChart
          title="Sample Pie Chart"
          data={sampleData}
          isLoading={true}
        />
      );
      
      expect(screen.getByText('Sample Pie Chart')).toBeInTheDocument();
      expect(screen.queryByText('Category A')).not.toBeInTheDocument();
    });
    
    test('renders error state', () => {
      const testError = new Error('Test error');
      
      render(
        <SimplePieChart
          title="Sample Pie Chart"
          data={sampleData}
          error={testError}
        />
      );
      
      expect(screen.getByText('Sample Pie Chart')).toBeInTheDocument();
      expect(screen.getByText('Impossible de charger le graphique')).toBeInTheDocument();
    });
    
    test('renders empty state', () => {
      render(
        <SimplePieChart
          title="Sample Pie Chart"
          data={[]}
        />
      );
      
      expect(screen.getByText('Sample Pie Chart')).toBeInTheDocument();
      expect(screen.getByText('Aucune donnée à afficher')).toBeInTheDocument();
    });
    
    test('renders donut chart', () => {
      render(
        <SimplePieChart
          title="Sample Donut Chart"
          data={sampleData}
          donut={true}
        />
      );
      
      // Total value of the donut should be rendered in the center
      expect(screen.getByText('100')).toBeInTheDocument();
    });
    
    test('calls onDataPointClick when a segment is clicked', () => {
      const mockClick = jest.fn();
      
      render(
        <SimplePieChart
          title="Sample Pie Chart"
          data={sampleData}
          onDataPointClick={mockClick}
        />
      );
      
      // Find a pie segment and click it
      const segment = screen.getByTestId('pie-segment-0');
      fireEvent.click(segment);
      
      expect(mockClick).toHaveBeenCalledTimes(1);
    });
    
    test('renders with custom formatLabel function', () => {
      render(
        <SimplePieChart
          title="Sample Pie Chart"
          data={sampleData}
          showDataLabels={true}
          formatLabel={(value, percentage) => `${value}/${percentage}`}
        />
      );
      
      // Can't easily test the SVG text content, but this ensures it doesn't crash
      expect(screen.getByText('Sample Pie Chart')).toBeInTheDocument();
    });
  });

  // MetricCard tests
  describe('MetricCard', () => {
    const sampleData: MetricData = {
      title: 'Revenue',
      value: 12500,
      unit: '€',
      change: {
        value: 15,
        percentage: true,
        direction: 'up',
        label: 'vs last month'
      }
    };

    test('renders with data', () => {
      render(
        <MetricCard
          data={sampleData}
        />
      );
      
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('12500')).toBeInTheDocument();
      expect(screen.getByText('€')).toBeInTheDocument();
      expect(screen.getByText('+15%')).toBeInTheDocument();
      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });
    
    test('renders with title prop overriding data title', () => {
      render(
        <MetricCard
          title="Custom Title"
          data={sampleData}
        />
      );
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.queryByText('Revenue')).not.toBeInTheDocument();
    });
    
    test('renders loading state', () => {
      render(
        <MetricCard
          data={sampleData}
          isLoading={true}
        />
      );
      
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.queryByText('12500')).not.toBeInTheDocument();
    });
    
    test('renders error state', () => {
      const testError = new Error('Test error');
      
      render(
        <MetricCard
          data={sampleData}
          error={testError}
        />
      );
      
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Erreur')).toBeInTheDocument();
    });
    
    test('renders with custom formatValue function', () => {
      render(
        <MetricCard
          data={sampleData}
          formatValue={(value) => `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €`}
        />
      );
      
      expect(screen.getByText('12 500 €')).toBeInTheDocument();
    });
    
    test('renders different sizes', () => {
      const { rerender } = render(
        <MetricCard
          data={sampleData}
          size="sm"
        />
      );
      
      // Small size
      const valueElement = screen.getByText('12500');
      expect(valueElement).toHaveClass('text-lg');
      
      // Medium size (default)
      rerender(
        <MetricCard
          data={sampleData}
          size="md"
        />
      );
      expect(valueElement).toHaveClass('text-2xl');
      
      // Large size
      rerender(
        <MetricCard
          data={sampleData}
          size="lg"
        />
      );
      expect(valueElement).toHaveClass('text-3xl');
    });
    
    test('renders with icon', () => {
      const dataWithIcon: MetricData = {
        ...sampleData,
        icon: <svg data-testid="test-icon" />
      };
      
      render(
        <MetricCard
          data={dataWithIcon}
        />
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });

  // ProgressBar tests
  describe('ProgressBar', () => {
    test('renders with value', () => {
      render(
        <ProgressBar
          title="Completion"
          value={75}
        />
      );
      
      expect(screen.getByText('Completion')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
    
    test('renders loading state', () => {
      render(
        <ProgressBar
          title="Completion"
          value={75}
          isLoading={true}
        />
      );
      
      expect(screen.getByText('Completion')).toBeInTheDocument();
      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });
    
    test('renders error state', () => {
      const testError = new Error('Test error');
      
      render(
        <ProgressBar
          title="Completion"
          value={75}
          error={testError}
        />
      );
      
      expect(screen.getByText('Completion')).toBeInTheDocument();
      expect(screen.getByText('Erreur')).toBeInTheDocument();
    });
    
    test('renders with custom formatLabel function', () => {
      render(
        <ProgressBar
          title="Completion"
          value={75}
          formatLabel={(value) => `${value}/100 completed`}
        />
      );
      
      expect(screen.getByText('75/100 completed')).toBeInTheDocument();
    });
    
    test('renders with target marker', () => {
      render(
        <ProgressBar
          title="Completion"
          value={75}
          target={90}
        />
      );
      
      // Target marker is a div with position absolute and specific inline style
      // We can't easily test its presence, but this ensures it doesn't crash
      expect(screen.getByText('Completion')).toBeInTheDocument();
    });
    
    test('renders different sizes', () => {
      const { rerender } = render(
        <ProgressBar
          title="Completion"
          value={75}
          size="sm"
        />
      );
      
      // Get progress bar elements
      const progressBarWrapper = document.querySelector('.bg-gray-700');
      const progressBar = document.querySelector('.bg-blue-600');
      
      // Small size
      expect(progressBarWrapper).toHaveClass('h-1.5');
      expect(progressBar).toHaveClass('h-1.5');
      
      // Medium size (default)
      rerender(
        <ProgressBar
          title="Completion"
          value={75}
          size="md"
        />
      );
      expect(progressBarWrapper).toHaveClass('h-2.5');
      expect(progressBar).toHaveClass('h-2.5');
      
      // Large size
      rerender(
        <ProgressBar
          title="Completion"
          value={75}
          size="lg"
        />
      );
      expect(progressBarWrapper).toHaveClass('h-4');
      expect(progressBar).toHaveClass('h-4');
    });
    
    test('renders different colors', () => {
      const { rerender } = render(
        <ProgressBar
          title="Completion"
          value={75}
          color="green"
        />
      );
      
      let progressBar = document.querySelector('.bg-green-600');
      expect(progressBar).toBeInTheDocument();
      
      rerender(
        <ProgressBar
          title="Completion"
          value={75}
          color="red"
        />
      );
      
      progressBar = document.querySelector('.bg-red-600');
      expect(progressBar).toBeInTheDocument();
    });
    
    test('clamps value between 0 and 100', () => {
      const { rerender } = render(
        <ProgressBar
          title="Completion"
          value={-10}
        />
      );
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      
      rerender(
        <ProgressBar
          title="Completion"
          value={150}
        />
      );
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });
});