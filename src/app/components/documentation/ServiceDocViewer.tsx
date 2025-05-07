'use client';

import React, { useState } from 'react';
import ServicePlayground from './ServicePlayground';
import { ServiceDoc } from "@/app/services/utils/documentation";

interface ServiceDocViewerProps {
  serviceDoc: ServiceDoc;
}

/**
 * Component for displaying interactive service documentation
 */
export const ServiceDocViewer: React.FC<ServiceDocViewerProps> = ({ serviceDoc }) => {
  const [activeMethod, setActiveMethod] = useState<string | null>(
    serviceDoc.methods.length > 0 ? serviceDoc.methods[0].name : null
  );
  
  // Find the currently active method
  const currentMethod = serviceDoc.methods.find(method => method.name === activeMethod);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Service Header */}
      <div className="bg-gray-800 text-white px-6 py-4">
        <h2 className="text-xl font-semibold">{serviceDoc.name}</h2>
        <p className="text-gray-300 mt-1">{serviceDoc.description}</p>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Method Sidebar */}
        <div className="w-full md:w-1/4 bg-gray-100 p-4 border-r border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Methods</h3>
          <nav>
            <ul className="space-y-1">
              {serviceDoc.methods.map(method => (
                <li key={method.name}>
                  <button
                    onClick={() => setActiveMethod(method.name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeMethod === method.name
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {method.name}
                    {method.deprecated && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Deprecated
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Method Details */}
        <div className="w-full md:w-3/4 p-6">
          {currentMethod ? (
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-800">{currentMethod.name}</h3>
                {currentMethod.since && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    Since v{currentMethod.since}
                  </span>
                )}
              </div>
              
              <p className="mt-2 text-gray-600">{currentMethod.description}</p>
              
              {currentMethod.deprecated && (
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800">
                  <p className="font-medium">Deprecated</p>
                  <p className="text-sm">{currentMethod.deprecationMessage || 'This method is deprecated and may be removed in a future version.'}</p>
                </div>
              )}
              
              {/* Parameters */}
              {currentMethod.parameters.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Parameters</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 border border-gray-200">Name</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 border border-gray-200">Type</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 border border-gray-200">Description</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 border border-gray-200">Required</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 border border-gray-200">Default</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMethod.parameters.map(param => (
                          <tr key={param.name} className="border-b border-gray-200">
                            <td className="px-4 py-2 text-sm text-gray-800 font-medium border border-gray-200">{param.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 font-mono border border-gray-200">{param.type}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 border border-gray-200">{param.description}</td>
                            <td className="px-4 py-2 text-sm border border-gray-200">
                              {param.required ? (
                                <span className="text-red-500">Yes</span>
                              ) : (
                                <span className="text-gray-500">No</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm font-mono text-gray-600 border border-gray-200">
                              {param.defaultValue ? param.defaultValue : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Return Type */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Returns</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-mono mb-2">{currentMethod.returns.type}</p>
                  <p className="text-sm text-gray-600">{currentMethod.returns.description}</p>
                </div>
              </div>
              
              {/* Ajouter un cast de type pour éviter l'erreur de TypeScript */}
              {(currentMethod.example as any) && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Example</h4>
                  <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                      {typeof currentMethod.example === 'string' ? currentMethod.example : JSON.stringify(currentMethod.example, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {currentMethod.notes && currentMethod.notes.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Notes</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {currentMethod.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Response Example */}
              {currentMethod.returns.example && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Response Example</h4>
                  <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                      {JSON.stringify(currentMethod.returns.example, null, 2) as string}
                    </pre>
                  </div>
                </div>
              )}
              
              <ServicePlayground service={null} serviceDoc={serviceDoc} />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Select a method from the sidebar to view its documentation.
            </div>
          )}
        </div>
      </div>
      
      {/* Usage Example */}
      <div className="border-t border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Usage</h3>
        <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
          <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
            {serviceDoc.usage}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ServiceDocViewer;
