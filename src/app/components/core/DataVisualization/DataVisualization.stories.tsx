import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { 
  SimpleBarChart, 
  SimplePieChart, 
  MetricCard, 
  ProgressBar,
  BarChartDataItem,
  PieChartDataItem,
  MetricData,
  chartColors,
  DataVisualization
} from './index';
import { AppError, ErrorCategory } from '../../../services/utils/errorHandling';

const meta: Meta<typeof DataVisualization> = {
  title: 'Core/DataVisualization',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

// SimpleBarChart stories
export const BarChart: StoryObj<typeof SimpleBarChart> = {
  render: () => {
    const data: BarChartDataItem[] = [
      { label: 'Jan', value: 1200 },
      { label: 'Feb', value: 1900 },
      { label: 'Mar', value: 1500 },
      { label: 'Apr', value: 2200 },
      { label: 'May', value: 2500 },
      { label: 'Jun', value: 2100 },
    ];
    
    return (
      <SimpleBarChart
        title="Monthly Revenue"
        description="Revenue for the first half of 2025"
        data={data}
        showDataLabels={true}
        height={250}
        formatValue={(value) => `${value}€`}
      />
    );
  }
};

export const BarChartComparison: StoryObj<typeof SimpleBarChart> = {
  render: () => {
    const data: BarChartDataItem[] = [
      { label: 'Jan', value: 1200, secondaryValue: 1000, secondaryLabel: 'Last Year' },
      { label: 'Feb', value: 1900, secondaryValue: 1400 },
      { label: 'Mar', value: 1500, secondaryValue: 1300 },
      { label: 'Apr', value: 2200, secondaryValue: 1600 },
      { label: 'May', value: 2500, secondaryValue: 1800 },
      { label: 'Jun', value: 2100, secondaryValue: 1900 },
    ];
    
    return (
      <SimpleBarChart
        title="Revenue Comparison"
        description="This Year vs Last Year"
        data={data}
        showComparison={true}
        height={250}
        formatValue={(value) => `${value}€`}
      />
    );
  }
};

export const HorizontalBarChart: StoryObj<typeof SimpleBarChart> = {
  render: () => {
    const data: BarChartDataItem[] = [
      { label: 'Website Development', value: 45, color: chartColors.blue },
      { label: 'Mobile Apps', value: 28, color: chartColors.green },
      { label: 'Maintenance', value: 15, color: chartColors.purple },
      { label: 'Consulting', value: 12, color: chartColors.yellow },
    ];
    
    return (
      <SimpleBarChart
        title="Revenue by Service"
        data={data}
        orientation="horizontal"
        height={200}
        showDataLabels={true}
        formatValue={(value) => `${value}%`}
      />
    );
  }
};

export const BarChartStates: StoryObj<typeof SimpleBarChart> = {
  render: () => {
    const data: BarChartDataItem[] = [
      { label: 'Jan', value: 1200 },
      { label: 'Feb', value: 1900 },
      { label: 'Mar', value: 1500 },
    ];
    
    return (
      <div className="space-y-6">
        <SimpleBarChart
          title="Loading State"
          data={data}
          isLoading={true}
          height={200}
        />
        
        <SimpleBarChart
          title="Error State"
          data={data}
          error={new Error("Failed to load chart data")}
          onRetry={() => alert('Retry clicked')}
          height={200}
        />
        
        <SimpleBarChart
          title="Empty State"
          data={[]}
          height={200}
        />
      </div>
    );
  }
};

// SimplePieChart stories
export const PieChart: StoryObj<typeof SimplePieChart> = {
  render: () => {
    const data: PieChartDataItem[] = [
      { label: 'Website Development', value: 45, color: chartColors.blue },
      { label: 'Mobile Apps', value: 28, color: chartColors.green },
      { label: 'Maintenance', value: 15, color: chartColors.purple },
      { label: 'Consulting', value: 12, color: chartColors.yellow },
    ];
    
    return (
      <SimplePieChart
        title="Revenue by Service"
        data={data}
        height={300}
      />
    );
  }
};

export const DonutChart: StoryObj<typeof SimplePieChart> = {
  render: () => {
    const data: PieChartDataItem[] = [
      { label: 'SMBs', value: 55, color: chartColors.blue },
      { label: 'Startups', value: 30, color: chartColors.green },
      { label: 'Individuals', value: 15, color: chartColors.yellow },
    ];
    
    return (
      <SimplePieChart
        title="Customers by Segment"
        description="Distribution of customer types"
        data={data}
        height={300}
        donut={true}
        showDataLabels={true}
      />
    );
  }
};

export const PieChartStates: StoryObj<typeof SimplePieChart> = {
  render: () => {
    const data: PieChartDataItem[] = [
      { label: 'Category A', value: 40 },
      { label: 'Category B', value: 30 },
      { label: 'Category C', value: 30 },
    ];
    
    return (
      <div className="space-y-6">
        <SimplePieChart
          title="Loading State"
          data={data}
          isLoading={true}
          height={200}
        />
        
        <SimplePieChart
          title="Error State"
          data={data}
          error={new Error("Failed to load chart data")}
          onRetry={() => alert('Retry clicked')}
          height={200}
        />
        
        <SimplePieChart
          title="Empty State"
          data={[]}
          height={200}
        />
      </div>
    );
  }
};

// MetricCard stories
export const Metrics: StoryObj<typeof MetricCard> = {
  render: () => {
    const revenueData: MetricData = {
      title: 'Monthly Revenue',
      value: 12500,
      unit: '€',
      change: {
        value: 15,
        percentage: true,
        direction: 'up',
        label: 'vs last month'
      },
      status: 'positive'
    };
    
    const clientsData: MetricData = {
      title: 'Active Clients',
      value: 7,
      change: {
        value: 2,
        direction: 'up',
        label: 'new clients'
      }
    };
    
    const projectsData: MetricData = {
      title: 'Projects',
      value: 4,
      change: {
        value: 1,
        direction: 'down',
        label: 'vs last month'
      },
      status: 'negative'
    };
    
    const conversionData: MetricData = {
      title: 'Conversion Rate',
      value: 35,
      unit: '%',
      change: {
        value: 0,
        direction: 'neutral',
        label: 'unchanged'
      },
      status: 'neutral'
    };
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <MetricCard data={revenueData} />
        <MetricCard data={clientsData} />
        <MetricCard data={projectsData} />
        <MetricCard data={conversionData} />
      </div>
    );
  }
};

export const MetricSizes: StoryObj<typeof MetricCard> = {
  render: () => {
    const data: MetricData = {
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
    
    return (
      <div className="space-y-4">
        <MetricCard
          data={data}
          size="sm"
        />
        
        <MetricCard
          data={data}
          size="md"
        />
        
        <MetricCard
          data={data}
          size="lg"
        />
      </div>
    );
  }
};

export const MetricWithIcon: StoryObj<typeof MetricCard> = {
  render: () => {
    const data: MetricData = {
      title: 'Revenue',
      value: 12500,
      unit: '€',
      change: {
        value: 15,
        percentage: true,
        direction: 'up',
        label: 'vs last month'
      },
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    };
    
    return (
      <MetricCard data={data} />
    );
  }
};

export const MetricStates: StoryObj<typeof MetricCard> = {
  render: () => {
    const data: MetricData = {
      title: 'Revenue',
      value: 12500,
      unit: '€'
    };
    
    return (
      <div className="space-y-4">
        <MetricCard
          data={data}
          isLoading={true}
        />
        
        <MetricCard
          data={data}
          error={new Error("Failed to load metric data")}
          onRetry={() => alert('Retry clicked')}
        />
      </div>
    );
  }
};

// ProgressBar stories
export const Progress: StoryObj<typeof ProgressBar> = {
  render: () => {
    return (
      <div className="space-y-6">
        <ProgressBar
          title="Business Plan Completion"
          value={65}
          target={80}
        />
        
        <ProgressBar
          title="Project Timeline"
          description="Expected to complete in 3 weeks"
          value={35}
          color="yellow"
        />
        
        <ProgressBar
          title="Revenue Goal"
          description="Monthly target: €10,000"
          value={90}
          color="green"
          formatLabel={(value) => `${value}% of goal`}
        />
        
        <ProgressBar
          title="Task Completion"
          value={10}
          color="red"
        />
      </div>
    );
  }
};

export const ProgressSizes: StoryObj<typeof ProgressBar> = {
  render: () => {
    return (
      <div className="space-y-6">
        <ProgressBar
          title="Small Progress Bar"
          value={65}
          size="sm"
        />
        
        <ProgressBar
          title="Medium Progress Bar"
          value={65}
          size="md"
        />
        
        <ProgressBar
          title="Large Progress Bar"
          value={65}
          size="lg"
        />
      </div>
    );
  }
};

export const ProgressStates: StoryObj<typeof ProgressBar> = {
  render: () => {
    return (
      <div className="space-y-6">
        <ProgressBar
          title="Loading State"
          value={65}
          isLoading={true}
        />
        
        <ProgressBar
          title="Error State"
          value={65}
          error={new Error("Failed to load progress data")}
          onRetry={() => alert('Retry clicked')}
        />
      </div>
    );
  }
};

// Dashboard example combining all components
export const DashboardExample: StoryObj = {
  render: () => {
    // Bar chart data
    const revenueData: BarChartDataItem[] = [
      { label: 'Jan', value: 1200, secondaryValue: 1000 },
      { label: 'Feb', value: 1900, secondaryValue: 1400 },
      { label: 'Mar', value: 1500, secondaryValue: 1300 },
      { label: 'Apr', value: 2200, secondaryValue: 1600 },
    ];
    
    // Pie chart data
    const revenueSourcesData: PieChartDataItem[] = [
      { label: 'Development', value: 45, color: chartColors.blue },
      { label: 'Consulting', value: 25, color: chartColors.green },
      { label: 'Maintenance', value: 20, color: chartColors.purple },
      { label: 'Training', value: 10, color: chartColors.yellow },
    ];
    
    // Metrics data
    const revenueMetric: MetricData = {
      title: 'Monthly Revenue',
      value: 6800,
      unit: '€',
      change: {
        value: 15.5,
        percentage: true,
        direction: 'up',
        label: 'vs last month'
      }
    };
    
    const clientsMetric: MetricData = {
      title: 'Active Clients',
      value: 7,
      change: {
        value: 2,
        direction: 'up',
        label: 'new clients'
      }
    };
    
    return (
      <div className="space-y-6 bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold">Financial Dashboard</h2>
        
        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard data={revenueMetric} />
          <MetricCard data={clientsMetric} />
        </div>
        
        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">
          <SimpleBarChart
            title="Revenue Trend"
            description="Current vs Previous Period"
            data={revenueData}
            showComparison={true}
            height={200}
            formatValue={(value) => `${value}€`}
          />
          
          <SimplePieChart
            title="Revenue Sources"
            data={revenueSourcesData}
            height={200}
            donut={true}
          />
        </div>
        
        {/* Progress section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Goals Progress</h3>
          
          <ProgressBar
            title="Revenue Goal"
            description="Monthly target: €10,000"
            value={68}
            color="blue"
            target={83}
          />
          
          <ProgressBar
            title="New Clients"
            description="Quarterly target: 12 clients"
            value={58}
            color="green"
          />
          
          <ProgressBar
            title="Project Completion"
            description="Active projects: 4"
            value={35}
            color="yellow"
          />
        </div>
      </div>
    );
  }
};