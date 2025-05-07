'use client';

import React, { useState, useEffect } from 'react';
import { useErrorHandling } from '@/app/providers/ErrorHandlingProvider';
import { BusinessPlanService, SectionService, AuthService } from "@/app/services/interfaces/serviceInterfaces";
import { ServiceDoc } from "@/app/services/utils/documentation";

// Define a service type that can be any of our service interfaces
type AnyService = BusinessPlanService | SectionService | AuthService;

interface ServicePlaygroundProps {
  service: AnyService | null;
  serviceDoc: ServiceDoc;
}

type ParamValues = Record<string, string>;

/**
 * Interactive playground for testing service methods
 */
export const ServicePlayground: React.FC<ServicePlaygroundProps> = ({ service, serviceDoc }) => {
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [paramValues, setParamValues] = useState<ParamValues>({});
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const { setError } = useErrorHandling();
  
  // Check if serviceDoc is valid and has methods
  const hasMethods = serviceDoc && serviceDoc.methods && serviceDoc.methods.length > 0;
  
  // Initialize default parameter values
  useEffect(() => {
    if (!hasMethods) return;
    
    const initialValues: ParamValues = {};
    serviceDoc.methods[selectedMethodIndex].parameters.forEach(param => {
      initialValues[param.name] = '';
    });
    setParamValues(initialValues);
  }, [serviceDoc, selectedMethodIndex, hasMethods]);
  
  // Update parameter value
  const handleParamChange = (paramName: string, value: string) => {
    setParamValues({
      ...paramValues,
      [paramName]: value
    });
  };
  
  // Parse parameter value based on type
  const parseParamValue = (value: string, type: string): unknown => {
    if (!value) {
      return type === 'string' ? '' : undefined;
    }
    
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'object':
      case 'array':
        try {
          return JSON.parse(value);
        } catch {
          throw new Error(`Invalid JSON: ${value}`);
        }
      case 'string':
      default:
        return value;
    }
  };
  
  // Execute the service method
  const executeMethod = async () => {
    if (!hasMethods) {
      setError({
        title: 'Execution Error',
        message: 'No service methods available to execute'
      });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      // Get service instance
      if (!service) {
        throw new Error('Service instance is null');
      }
      
      // Check if method exists
      const methodDoc = serviceDoc.methods[selectedMethodIndex];
      const methodName = methodDoc.name;
      
      // Use a safer approach to call the method
      // First check if the method exists on the service
      if (!(methodName in service)) {
        throw new Error(`Method ${methodName} not found on service`);
      }
      
      // Then call it using a safer approach with Function.prototype.apply
      // Cast to unknown first then to a function type with specific signature
      const method = (service as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>)[methodName];
      
      // Parse parameter values
      const parsedParams = methodDoc.parameters.map(param => {
        return parseParamValue(paramValues[param.name] || '', param.type);
      });
      
      // Call the method
      const methodResult = await method.apply(service, parsedParams);
      setResult(methodResult);
    } catch (error) {
      console.error('Error executing method:', error);
      setError({
        title: 'Method Execution Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // If no service doc or methods, show a message
  if (!hasMethods) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Interactive Playground</h3>
        <p className="text-gray-600">No service methods available for testing.</p>
      </div>
    );
  }
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Interactive Playground</h3>
        <p className="text-sm text-gray-600">
          Test the {serviceDoc.methods[selectedMethodIndex].name} method with real-time feedback
        </p>
      </div>
      
      <div className="p-6">
        {/* Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Method
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedMethodIndex}
            onChange={(e) => setSelectedMethodIndex(Number(e.target.value))}
          >
            {serviceDoc.methods.map((method, index) => (
              <option key={method.name} value={index}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Parameters Form */}
        <div className="space-y-4">
          {serviceDoc.methods[selectedMethodIndex].parameters.map(param => (
            <div key={param.name}>
              <label 
                htmlFor={`param-${param.name}`} 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {param.name}
                {param.required && <span className="ml-1 text-red-500">*</span>}
                <span className="ml-2 text-gray-500 text-xs">({param.type})</span>
              </label>
              
              {param.type === 'object' || param.type === 'array' ? (
                <textarea
                  id={`param-${param.name}`}
                  value={paramValues[param.name] || ''}
                  onChange={(e) => handleParamChange(param.name, e.target.value)}
                  placeholder={`Enter ${param.type} as JSON`}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-24 font-mono text-sm"
                />
              ) : (
                <input
                  type={param.type === 'number' ? 'number' : 'text'}
                  id={`param-${param.name}`}
                  value={paramValues[param.name] || ''}
                  onChange={(e) => handleParamChange(param.name, e.target.value)}
                  placeholder={`Enter ${param.type} value`}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              
              {param.description && (
                <p className="mt-1 text-xs text-gray-500">{param.description}</p>
              )}
            </div>
          ))}
        </div>
        
        {/* Execute Button */}
        <div className="mt-6">
          <button
            onClick={executeMethod}
            disabled={loading}
            className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
          >
            {loading ? 'Running...' : 'Execute Method'}
          </button>
        </div>
        
        {/* Result Display */}
        {result !== null && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h3 className="text-md font-medium mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap bg-white p-3 rounded border text-sm">
              {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicePlayground;
