/**
 * Test script for useBusinessModel hook migration to standardized interfaces
 * 
 * This script tests that the useBusinessModel hook correctly handles
 * both legacy and standardized interfaces.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useBusinessModel } from '../src/app/hooks/useBusinessModel';
import { BusinessPlanServiceImpl } from '../src/app/services/core/businessPlanService';

// Mock the BusinessPlanServiceImpl
jest.mock('../src/app/services/core/businessPlanService', () => {
  return {
    BusinessPlanServiceImpl: jest.fn().mockImplementation(() => {
      return {
        getItem: jest.fn().mockResolvedValue({
          success: true,
          data: {
            id: 'test-plan',
            name: 'Test Plan',
            businessModel: {
              hourlyRates: [
                {
                  id: 'rate-1',
                  serviceType: 'Development',
                  rate: 80,
                  currency: 'EUR'
                }
              ],
              packages: [
                {
                  id: 'package-1',
                  name: 'Starter',
                  description: 'Basic development package',
                  price: 2000,
                  currency: 'EUR',
                  services: ['UI Design', 'Frontend Development']
                }
              ],
              subscriptions: []
            },
            standardized: {
              businessModel: {
                partners: [],
                activities: [],
                resources: [],
                valueProposition: [],
                customerRelations: [],
                channels: [],
                segments: [],
                costStructure: [],
                revenueStreams: []
              },
              pricingModel: {
                hourlyRates: [
                  {
                    id: 'rate-1',
                    title: 'Development',
                    description: '',
                    ratePerHour: 80,
                    currency: 'EUR'
                  }
                ],
                packages: [
                  {
                    id: 'package-1',
                    title: 'Starter',
                    description: 'Basic development package',
                    price: 2000,
                    currency: 'EUR',
                    features: ['UI Design', 'Frontend Development']
                  }
                ],
                subscriptions: [],
                custom: []
              }
            }
          }
        }),
        updateItem: jest.fn().mockResolvedValue({
          success: true,
          data: {}
        })
      };
    })
  };
});

describe('useBusinessModel hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should load a business plan with both legacy and standardized data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useBusinessModel({ 
      planId: 'test-plan',
      autoLoad: true 
    }));
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the async operation to complete
    await waitForNextUpdate();
    
    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);
    
    // Should have legacy data
    expect(result.current.canvas).not.toBeNull();
    expect(result.current.pricing).not.toBeNull();
    
    // Should have standardized data
    expect(result.current.standardizedBusinessModel).not.toBeNull();
    expect(result.current.standardizedPricing).not.toBeNull();
    expect(result.current.standardizedPricing.hourlyRates.length).toBe(1);
    expect(result.current.standardizedPricing.packages.length).toBe(1);
  });

  it('should update the business model canvas', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useBusinessModel({
      planId: 'test-plan',
      autoLoad: true
    }));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Update the canvas
    act(() => {
      result.current.updateCanvas({
        partners: [
          {
            id: 'partner-1',
            name: 'Test Partner',
            description: 'A test partner',
            priority: 'medium'
          }
        ],
        activities: [],
        resources: [],
        valueProposition: [],
        customerRelations: [],
        channels: [],
        segments: [],
        costStructure: [],
        revenueStreams: []
      });
    });
    
    // The state should be updated
    expect(result.current.canvas.partners.length).toBe(1);
    expect(result.current.standardizedBusinessModel.partners.length).toBe(1);
    expect(result.current.dirty).toBe(true);
  });

  it('should update the pricing model', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useBusinessModel({
      planId: 'test-plan',
      autoLoad: true
    }));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Update the pricing
    act(() => {
      result.current.updatePricing({
        hourlyRates: [
          {
            id: 'rate-1',
            title: 'Development',
            description: '',
            ratePerHour: 90, // Increased rate
            currency: 'EUR'
          }
        ],
        packages: result.current.pricing.packages,
        subscriptions: [],
        custom: []
      });
    });
    
    // The state should be updated
    expect(result.current.pricing.hourlyRates[0].ratePerHour).toBe(90);
    expect(result.current.standardizedPricing.hourlyRates[0].ratePerHour).toBe(90);
    expect(result.current.dirty).toBe(true);
  });

  it('should save the business model with standardized data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useBusinessModel({
      planId: 'test-plan',
      autoLoad: true
    }));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Update some data
    act(() => {
      result.current.updatePricing({
        ...result.current.pricing,
        hourlyRates: [
          {
            id: 'rate-1',
            title: 'Development',
            description: 'Professional development services',
            ratePerHour: 95,
            currency: 'EUR'
          }
        ]
      });
    });
    
    // Save the changes
    await act(async () => {
      const success = await result.current.saveBusinessModel();
      expect(success).toBe(true);
    });
    
    // The BusinessPlanServiceImpl.updateItem should have been called with standardized data
    expect(BusinessPlanServiceImpl().updateItem).toHaveBeenCalledTimes(1);
    const updateCall = BusinessPlanServiceImpl().updateItem.mock.calls[0];
    expect(updateCall[0]).toBe('test-plan');
    expect(updateCall[1].standardized).toBeDefined();
    expect(updateCall[1].standardized.businessModel).toBeDefined();
    expect(updateCall[1].standardized.pricingModel).toBeDefined();
    
    // The dirty flag should be reset
    expect(result.current.dirty).toBe(false);
  });
});