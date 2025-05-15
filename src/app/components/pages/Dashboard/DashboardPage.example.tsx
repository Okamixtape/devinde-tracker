import React, { useState } from 'react';
import { CardContainer } from '../../core/CardContainer';
import { BusinessMetricsCard } from '../../business/BusinessMetrics/BusinessMetricsCard';
import { ErrorBoundary } from '../../core/ErrorBoundary';

/**
 * DashboardPage Example
 * 
 * This is an example implementation of a Dashboard page that uses CardContainer
 * components to organize content in a consistent, user-friendly layout.
 * 
 * Note: This is for demonstration purposes only and would integrate with
 * actual hooks and services in a real implementation.
 */
export const DashboardPageExample: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const businessPlanId = 'sample-business-plan-id';

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400">Overview of your business performance</p>
        </div>
        <div className="flex space-x-3">
          <select 
            className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics section - Using BusinessMetricsCard which uses CardContainer internally */}
      <ErrorBoundary>
        <BusinessMetricsCard 
          title="Key Metrics" 
          businessPlanId={businessPlanId}
          timeframe={timeframe}
        />
      </ErrorBoundary>

      {/* Two-column layout for additional cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent activity card */}
        <ErrorBoundary>
          <CardContainer
            title="Recent Activity"
            actions={
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                View All
              </button>
            }
          >
            <div className="space-y-4">
              {/* In a real implementation, these would be mapped from actual data */}
              <div className="flex">
                <div className="mr-4 w-1 bg-blue-600 rounded-full"></div>
                <div>
                  <span className="text-sm text-gray-400">Today</span>
                  <p className="text-sm font-medium mt-1">Updated service pricing</p>
                  <span className="text-xs text-blue-400">Business Model</span>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4 w-1 bg-blue-600 rounded-full"></div>
                <div>
                  <span className="text-sm text-gray-400">Yesterday</span>
                  <p className="text-sm font-medium mt-1">Created milestone: "Launch Website"</p>
                  <span className="text-xs text-blue-400">Action Plan</span>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4 w-1 bg-blue-600 rounded-full"></div>
                <div>
                  <span className="text-sm text-gray-400">3 days ago</span>
                  <p className="text-sm font-medium mt-1">Added new market segment: "Small Businesses"</p>
                  <span className="text-xs text-blue-400">Market Analysis</span>
                </div>
              </div>
            </div>
          </CardContainer>
        </ErrorBoundary>

        {/* Quick actions card */}
        <ErrorBoundary>
          <CardContainer
            title="Quick Actions"
          >
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left">
                <div className="w-10 h-10 rounded-full bg-blue-600 bg-opacity-20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium">Add New Service</h3>
                <p className="text-xs text-gray-400 mt-1">Define a new service offering</p>
              </button>
              
              <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left">
                <div className="w-10 h-10 rounded-full bg-green-600 bg-opacity-20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium">Create Document</h3>
                <p className="text-xs text-gray-400 mt-1">Generate quotes or invoices</p>
              </button>
              
              <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left">
                <div className="w-10 h-10 rounded-full bg-purple-600 bg-opacity-20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium">View Reports</h3>
                <p className="text-xs text-gray-400 mt-1">Analyze your business data</p>
              </button>
              
              <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left">
                <div className="w-10 h-10 rounded-full bg-yellow-600 bg-opacity-20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium">Schedule Task</h3>
                <p className="text-xs text-gray-400 mt-1">Add to your action plan</p>
              </button>
            </div>
          </CardContainer>
        </ErrorBoundary>
      </div>

      {/* Progress Card */}
      <ErrorBoundary>
        <CardContainer
          title="Plan Completion"
          subtitle="Track your progress across different plan sections"
        >
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Business Model</span>
                <span className="text-sm">75%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Market Analysis</span>
                <span className="text-sm">45%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Financial Projections</span>
                <span className="text-sm">60%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Action Plan</span>
                <span className="text-sm">30%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </CardContainer>
      </ErrorBoundary>
    </div>
  );
};

export default DashboardPageExample;