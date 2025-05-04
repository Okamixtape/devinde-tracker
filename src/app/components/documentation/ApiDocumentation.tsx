'use client';

import React, { useState } from 'react';
import serviceDocumentation from '../../services/utils/documentation';
import ServiceDocViewer from './ServiceDocViewer';
import ServicePlayground from './ServicePlayground';
import { Tab } from '@headlessui/react';
import {
  getBusinessPlanService,
  getSectionService,
  getAuthService
} from '../../services/service-factory';

/**
 * Main API documentation component that displays all service documentation
 */
export const ApiDocumentation: React.FC = () => {
  // Track which service is active
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  
  const activeService = serviceDocumentation.services[activeServiceIndex];
  
  // Get service instance based on active service name
  const getServiceInstance = (serviceName: string) => {
    switch (serviceName) {
      case 'BusinessPlanService':
        return getBusinessPlanService();
      case 'SectionService':
        return getSectionService();
      case 'AuthService':
        return getAuthService();
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">DevIndé Tracker API Documentation</h1>
        <p className="mt-2 text-xl text-gray-600">
          Complete documentation for the data service layer
        </p>
      </header>
      
      {/* Service Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {serviceDocumentation.services.map((service, index) => (
              <button
                key={service.name}
                onClick={() => setActiveServiceIndex(index)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  index === activeServiceIndex
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {service.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Active Service Documentation */}
      {activeService && (
        <div className="mt-6">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
                   ${selected 
                    ? 'bg-white shadow' 
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                   }`
                }
              >
                Documentation
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
                   ${selected 
                    ? 'bg-white shadow' 
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                   }`
                }
              >
                Interactive Playground
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <ServiceDocViewer serviceDoc={activeService} />
              </Tab.Panel>
              <Tab.Panel>
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Test {activeService.name} Methods</h2>
                  <p className="mb-6 text-gray-600">
                    Use this interactive playground to test the {activeService.name} methods directly.
                    Results will be displayed in real-time.
                  </p>
                  <ServicePlayground 
                    service={getServiceInstance(activeService.name)} 
                    serviceDoc={activeService}
                  />
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
      
      {/* General Documentation Info */}
      <div className="mt-12 bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Service Layer</h2>
        <div className="prose max-w-none">
          <p>
            The DevIndé Tracker uses a client-side service layer architecture to provide a clean separation between
            UI components and data storage. This approach follows several key design patterns:
          </p>
          
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>
              <strong>Service Layer Pattern</strong> - Provides a clear boundary between the UI and data storage
            </li>
            <li>
              <strong>Repository Pattern</strong> - Standardizes data access through well-defined interfaces
            </li>
            <li>
              <strong>Singleton Pattern</strong> - Ensures consistent data operations across the application
            </li>
            <li>
              <strong>Factory Pattern</strong> - Creates and configures service instances
            </li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Key Benefits</h3>
          <p>This architecture provides several benefits:</p>
          
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              <strong>Separation of Concerns</strong> - UI components don&apos;t need to know about data storage details
            </li>
            <li>
              <strong>Testability</strong> - Services can be easily mocked for unit testing
            </li>
            <li>
              <strong>Maintainability</strong> - Changes to storage mechanisms don&apos;t affect the UI
            </li>
            <li>
              <strong>Future-proofing</strong> - Makes it easier to add a backend API in the future
            </li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Error Handling</h3>
          <p>
            All service methods follow a consistent pattern for error handling using the <code>ServiceResult</code> type.
            This provides a standardized way to handle both successful operations and errors.
          </p>
          
          <pre className="bg-gray-100 p-4 rounded-md mt-2 overflow-x-auto">
{`// Example ServiceResult for success
{
  "success": true,
  "data": { ... } // The actual data returned
}

// Example ServiceResult for error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": "Additional technical details"
  }
}`}
          </pre>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Service Factory</h3>
          <p>
            To get an instance of a service, use the service factory functions:
          </p>
          
          <pre className="bg-gray-100 p-4 rounded-md mt-2 overflow-x-auto">
{`import { 
  getBusinessPlanService, 
  getSectionService, 
  getAuthService 
} from '../services/service-factory';

// Get service instances
const businessPlanService = getBusinessPlanService();
const sectionService = getSectionService();
const authService = getAuthService();`}
          </pre>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Security Measures</h3>
          <p>
            The service layer implements several security measures:
          </p>
          
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              <strong>Encrypted localStorage</strong> - Sensitive data is encrypted before storage
            </li>
            <li>
              <strong>Input validation</strong> - All user inputs are validated before processing
            </li>
            <li>
              <strong>Token-based authentication</strong> - JWT tokens are used for authentication
            </li>
            <li>
              <strong>Content sanitization</strong> - User-generated content is sanitized to prevent XSS attacks
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;
