import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { CardContainer } from './index';
import { AppError, ErrorCategory } from '../../../services/utils/errorHandling';

const meta: Meta<typeof CardContainer> = {
  title: 'Core/CardContainer',
  component: CardContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
    },
    isLoading: { control: 'boolean' },
    isEmpty: { control: 'boolean' },
    showInlineError: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CardContainer>;

// Basic card example
export const Basic: Story = {
  args: {
    title: 'Basic Card',
    children: (
      <div>
        <p className="text-gray-300">This is a basic card with default styling.</p>
        <p className="text-gray-300 mt-3">
          Cards are used throughout the application to contain related content in a consistent, recognizable format.
        </p>
      </div>
    ),
  },
};

// Card with subtitle
export const WithSubtitle: Story = {
  args: {
    title: 'Card with Subtitle',
    subtitle: 'Additional context for the card content',
    children: (
      <div>
        <p className="text-gray-300">
          This card demonstrates the use of a subtitle to provide additional context.
        </p>
      </div>
    ),
  },
};

// Card with actions
export const WithActions: Story = {
  args: {
    title: 'Card with Actions',
    actions: (
      <div className="flex space-x-2">
        <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          Save
        </button>
        <button className="px-3 py-1 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-600">
          Cancel
        </button>
      </div>
    ),
    children: (
      <div>
        <p className="text-gray-300">
          This card includes action buttons in the top-right corner, allowing users to interact with the card content.
        </p>
      </div>
    ),
  },
};

// Card with footer
export const WithFooter: Story = {
  args: {
    title: 'Card with Footer',
    children: (
      <div>
        <p className="text-gray-300">
          This card includes a footer area, which can be used for actions, metadata, or additional context.
        </p>
      </div>
    ),
    footer: (
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">Last updated: Today</div>
        <button className="text-blue-400 hover:text-blue-300 text-sm">
          View more
        </button>
      </div>
    ),
  },
};

// Card with status variations
export const StatusVariations: Story = {
  render: () => (
    <div className="space-y-6">
      <CardContainer
        title="Default Card"
        status="default"
        children={<p className="text-gray-300">Standard card with no status indicator.</p>}
      />
      <CardContainer
        title="Success Card"
        status="success"
        children={<p className="text-gray-300">Indicates a successful operation or positive information.</p>}
      />
      <CardContainer
        title="Warning Card"
        status="warning"
        children={<p className="text-gray-300">Indicates information that requires attention.</p>}
      />
      <CardContainer
        title="Error Card"
        status="error"
        children={<p className="text-gray-300">Indicates an error condition or critical information.</p>}
      />
      <CardContainer
        title="Info Card"
        status="info"
        children={<p className="text-gray-300">Indicates informational content or tips.</p>}
      />
    </div>
  ),
};

// Loading state
export const Loading: Story = {
  args: {
    title: 'Loading State',
    isLoading: true,
    children: <p>This content will not be visible while loading</p>,
  },
};

// Empty state
export const Empty: Story = {
  args: {
    title: 'Empty State',
    isEmpty: true,
    children: <p>This content will not be visible</p>,
  },
};

// Empty with custom message
export const EmptyCustom: Story = {
  args: {
    title: 'Custom Empty State',
    isEmpty: true,
    emptyMessage: 'No items found. Click the button below to add a new item.',
    children: <p>This content will not be visible</p>,
    footer: (
      <div className="flex justify-center">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Add Item
        </button>
      </div>
    ),
  },
};

// Custom empty component
export const EmptyComponent: Story = {
  args: {
    title: 'Custom Empty Component',
    isEmpty: true,
    emptyComponent: (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">No data available</h3>
        <p className="text-sm text-gray-400 mb-4 text-center max-w-xs">
          You haven't added any items yet. Click below to create your first item.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create New Item
        </button>
      </div>
    ),
    children: <p>This content will not be visible</p>,
  },
};

// Error state
export const Error: Story = {
  args: {
    title: 'Error State',
    error: new Error('Failed to load data. Please check your network connection.'),
    onRetry: () => alert('Retry action triggered'),
    children: <p>This content will not be visible</p>,
  },
};

// Different error categories
export const ErrorCategories: Story = {
  render: () => (
    <div className="space-y-6">
      <CardContainer
        title="Network Error"
        error={new AppError('NETWORK_ERROR', {
          message: 'Unable to connect to the server. Please check your network connection.',
          category: ErrorCategory.NETWORK,
        })}
        onRetry={() => alert('Retry network connection')}
        children={<p>This content will not be visible</p>}
      />
      <CardContainer
        title="Authentication Error"
        error={new AppError('AUTH_REQUIRED', {
          message: 'Your session has expired. Please log in again.',
          category: ErrorCategory.AUTHENTICATION,
        })}
        children={<p>This content will not be visible</p>}
      />
      <CardContainer
        title="Validation Error"
        error={new AppError('INVALID_INPUT', {
          message: 'The form contains invalid inputs. Please check the highlighted fields.',
          category: ErrorCategory.VALIDATION,
        })}
        children={<p>This content will not be visible</p>}
      />
    </div>
  ),
};

// Complex example
export const ComplexExample: Story = {
  render: () => (
    <CardContainer
      title={
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
          <span>Business Metrics</span>
        </div>
      }
      subtitle="Monthly performance statistics"
      actions={
        <div className="flex space-x-2">
          <button className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <div className="relative">
            <button className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Revenue</div>
            <div className="text-xl font-bold mt-1">€2,450</div>
            <div className="flex items-center mt-1 text-xs">
              <span className="text-green-400 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +12.5%
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Clients</div>
            <div className="text-xl font-bold mt-1">7</div>
            <div className="flex items-center mt-1 text-xs">
              <span className="text-green-400 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +2
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Projects</div>
            <div className="text-xl font-bold mt-1">4</div>
            <div className="flex items-center mt-1 text-xs">
              <span className="text-red-400 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                -1
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium">Revenue Breakdown</h3>
            <div className="text-xs text-gray-400">Last 30 days</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Development (60%)</span>
                  <span>€1,470</span>
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-full">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Consulting (25%)</span>
                  <span>€612.50</span>
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-full">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Maintenance (15%)</span>
                  <span>€367.50</span>
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-full">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContainer>
  ),
};