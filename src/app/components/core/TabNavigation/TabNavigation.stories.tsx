import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { TabNavigation, TabItem } from './index';
import { AppError, ErrorCategory } from '../../../services/utils/errorHandling';

const meta: Meta<typeof TabNavigation> = {
  title: 'Core/TabNavigation',
  component: TabNavigation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['underline', 'filled', 'minimal'],
    },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
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
type Story = StoryObj<typeof TabNavigation>;

// Basic tabs
const basicTabs: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'pricing', label: 'Pricing' },
];

// Tabs with icons
const iconTabs: TabItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    )
  },
  { 
    id: 'profile', 
    label: 'Profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    )
  },
  { 
    id: 'settings', 
    label: 'Settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    )
  },
];

// Tabs with badges
const badgeTabs: TabItem[] = [
  { id: 'inbox', label: 'Inbox', badge: 4, badgeColor: 'red' },
  { id: 'sent', label: 'Sent' },
  { id: 'drafts', label: 'Drafts', badge: 2, badgeColor: 'yellow' },
  { id: 'trash', label: 'Trash', badge: 'New', badgeColor: 'blue' },
];

// Tabs with disabled state
const tabsWithDisabled: TabItem[] = [
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending', badge: 3, badgeColor: 'yellow' },
  { id: 'archived', label: 'Archived', disabled: true },
  { id: 'deleted', label: 'Deleted', disabled: true },
];

// Basic example
export const Default: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 'overview',
    onChange: (tabId) => console.log(`Tab changed to: ${tabId}`),
  },
};

// Different variants
export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Underline Variant (default)</h3>
        <TabNavigation
          tabs={basicTabs}
          activeTab="overview"
          variant="underline"
          onChange={(tabId) => console.log(`Selected tab: ${tabId}`)}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Filled Variant</h3>
        <TabNavigation
          tabs={basicTabs}
          activeTab="features"
          variant="filled"
          onChange={(tabId) => console.log(`Selected tab: ${tabId}`)}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Minimal Variant</h3>
        <TabNavigation
          tabs={basicTabs}
          activeTab="specifications"
          variant="minimal"
          onChange={(tabId) => console.log(`Selected tab: ${tabId}`)}
        />
      </div>
    </div>
  ),
};

// With icons
export const WithIcons: Story = {
  args: {
    tabs: iconTabs,
    activeTab: 'dashboard',
    onChange: (tabId) => console.log(`Tab changed to: ${tabId}`),
  },
};

// With badges
export const WithBadges: Story = {
  args: {
    tabs: badgeTabs,
    activeTab: 'inbox',
    onChange: (tabId) => console.log(`Tab changed to: ${tabId}`),
  },
};

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Small Size</h3>
        <TabNavigation
          tabs={basicTabs}
          activeTab="overview"
          size="sm"
          onChange={(tabId) => console.log(`Selected tab: ${tabId}`)}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Medium Size (default)</h3>
        <TabNavigation
          tabs={basicTabs}
          activeTab="features"
          size="md"
          onChange={(tabId) => console.log(`Selected tab: ${tabId}`)}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Large Size</h3>
        <TabNavigation
          tabs={basicTabs}
          activeTab="specifications"
          size="lg"
          onChange={(tabId) => console.log(`Selected tab: ${tabId}`)}
        />
      </div>
    </div>
  ),
};

// Vertical orientation
export const Vertical: Story = {
  args: {
    tabs: iconTabs,
    activeTab: 'dashboard',
    orientation: 'vertical',
    variant: 'filled',
    onChange: (tabId) => console.log(`Tab changed to: ${tabId}`),
  },
};

// Disabled tabs
export const WithDisabledTabs: Story = {
  args: {
    tabs: tabsWithDisabled,
    activeTab: 'active',
    onChange: (tabId) => console.log(`Tab changed to: ${tabId}`),
  },
};

// Interactive example
export const Interactive: Story = {
  render: () => {
    const TabExample = () => {
      const [activeTabId, setActiveTabId] = useState('overview');
      
      // Content for each tab
      const tabContents = {
        overview: (
          <div className="p-4 bg-gray-800 rounded-md mt-4">
            <h3 className="text-lg font-medium mb-2">Product Overview</h3>
            <p className="text-gray-300">
              This is a high-level overview of our product. It includes the main features
              and benefits that users can expect when using our solution.
            </p>
          </div>
        ),
        features: (
          <div className="p-4 bg-gray-800 rounded-md mt-4">
            <h3 className="text-lg font-medium mb-2">Key Features</h3>
            <ul className="list-disc pl-5 text-gray-300 space-y-1">
              <li>Real-time collaboration</li>
              <li>Advanced analytics dashboard</li>
              <li>Customizable workflows</li>
              <li>Enterprise-grade security</li>
            </ul>
          </div>
        ),
        specifications: (
          <div className="p-4 bg-gray-800 rounded-md mt-4">
            <h3 className="text-lg font-medium mb-2">Technical Specifications</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Platform</div>
              <div className="text-gray-300">Web, iOS, Android</div>
              <div className="text-gray-400">API</div>
              <div className="text-gray-300">REST, GraphQL</div>
              <div className="text-gray-400">Security</div>
              <div className="text-gray-300">SOC 2, GDPR compliant</div>
              <div className="text-gray-400">Uptime</div>
              <div className="text-gray-300">99.9% guaranteed</div>
            </div>
          </div>
        ),
        pricing: (
          <div className="p-4 bg-gray-800 rounded-md mt-4">
            <h3 className="text-lg font-medium mb-2">Pricing Plans</h3>
            <div className="space-y-3 text-gray-300">
              <div className="p-3 border border-gray-700 rounded">
                <div className="font-medium">Basic</div>
                <div className="text-xl mt-1">$10<span className="text-sm text-gray-400">/month</span></div>
                <div className="text-xs text-gray-400 mt-1">For individuals and small teams</div>
              </div>
              <div className="p-3 border border-blue-700 rounded bg-blue-900 bg-opacity-20">
                <div className="font-medium">Pro</div>
                <div className="text-xl mt-1">$29<span className="text-sm text-gray-400">/month</span></div>
                <div className="text-xs text-gray-400 mt-1">For professional teams</div>
              </div>
              <div className="p-3 border border-gray-700 rounded">
                <div className="font-medium">Enterprise</div>
                <div className="text-xl mt-1">Contact Us</div>
                <div className="text-xs text-gray-400 mt-1">For large organizations</div>
              </div>
            </div>
          </div>
        ),
      };
      
      return (
        <div>
          <TabNavigation
            tabs={basicTabs}
            activeTab={activeTabId}
            onChange={setActiveTabId}
          />
          <div className="tab-content">
            {tabContents[activeTabId as keyof typeof tabContents]}
          </div>
        </div>
      );
    };
    
    return <TabExample />;
  }
};

// Scrollable tabs
export const Scrollable: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: 'Dashboard' },
      { id: 'tab2', label: 'Analytics' },
      { id: 'tab3', label: 'Reports' },
      { id: 'tab4', label: 'Customers' },
      { id: 'tab5', label: 'Products' },
      { id: 'tab6', label: 'Marketing' },
      { id: 'tab7', label: 'Finance' },
      { id: 'tab8', label: 'Settings' }
    ],
    activeTab: 'tab1',
    scrollable: true,
    onChange: (tabId) => console.log(`Tab changed to: ${tabId}`),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};