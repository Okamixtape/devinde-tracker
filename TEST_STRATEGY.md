# Test Strategy for Adapter Standardization

## Overview

This document outlines the strategy for standardizing adapters and ensuring backward compatibility with existing tests, which reflects the approach taken during the implementation of Task 31.9 regarding test improvements and adapter optimizations.

## Key Challenges

1. **Legacy vs. Standardized Structure:** The tests were written for the legacy adapter interfaces, but we're transitioning to a standardized architecture.
2. **Field Name Discrepancies:** Different property names are used between tests and new standardized implementations (e.g., "segments" vs "customerSegments").
3. **React 19 Compatibility:** Some tests use `@testing-library/react-hooks` which is not compatible with React 19.
4. **Method Signature Changes:** Methods in standardized adapters may have different parameter requirements.

## Standardization Approach

We've implemented a two-tier adapter architecture:

1. **Standardized Adapter Implementation**
   - Full implementation with standardized interfaces and methods
   - Located in `*.standardized.ts` files
   - Contains all core logic and transformations
   - Handles compatibility with both old and new field names
   - Implements JSDoc comments with `@standardized` tags

2. **Original Adapter as Proxy**
   - Located in the original `*.ts` files
   - Acts as a lightweight proxy/façade to the standardized implementation
   - Maintains the original public API for backward compatibility
   - Delegates all method calls to the standardized implementation

## Test Compatibility Strategy

We addressed test compatibility through several techniques:

1. **Method Name Compatibility**
   - Implemented legacy method names in standardized adapters
   - Added `@deprecated` tags with proper migration instructions
   - Ensured old methods delegate to new standardized methods

2. **Field Name Aliases**
   - Added property aliases in returned objects to support both naming conventions
   - Example: `{ customerSegments: data, segments: data }` to support both fields

3. **Parameter Overloading**
   - Implemented multiple method signatures to support both old and new calling patterns
   - Made sure methods can work with both individual component arrays and full BusinessPlanData

4. **Defensive Implementation**
   - Added robust null/undefined checking
   - Implemented sensible defaults for missing values
   - Used type guards to prevent runtime errors

5. **Bidirectional Field Mapping**
   - Added mappers to convert between old and new field names
   - Made transformations work in both directions (service-to-UI and UI-to-service)

## Specific Adaptations

### MarketAnalysisAdapter

- Added missing methods (`toCustomerSegments`, `toCompetitors`, `toMarketTrends`)
- Implemented field aliases for compatibility (`segments` for `customerSegments`)
- Created overloaded methods for `generateSwotAnalysis` and other calculations
- Ensured compatibility with both primitive and complex types

### ActionPlanAdapter

- Added specialized methods for timeline and calendar conversions
- Implemented field name compatibility for deprecated status codes
- Added support for both basic and detailed transformations
- Managed bidirectional task/milestone associations

### BusinessModelProjectionsAdapter

- Created compatibility for both object-based and array-based revenue sources
- Added support for yearly projections in different formats
- Implemented additional fields needed by tests (breakEvenPoint, etc.)
- Made sure calculations work with both new/old simulation parameters

## Testing Approach

1. **Run Original Tests**: We use the original tests to verify compatibility of our changes
2. **Maintain Test Intent**: We preserve the original test assertions and expectations
3. **Add Coverage**: Where needed, we enhance tests to verify both old and new patterns
4. **Document Deprecations**: We clearly mark deprecated interfaces that will be removed in future versions

## Future Work

1. **Test Migration**: Gradually update tests to use the standardized interfaces
2. **Remove Deprecated Methods**: Once all tests are updated, remove deprecated methods
3. **Simplify Implementation**: Remove compatibility code when no longer needed
4. **Update React Testing**: Replace `@testing-library/react-hooks` with React 19 compatible alternatives

## Implementation Example

```typescript
// Standardized adapter
export class MarketAnalysisAdapter {
  /**
   * Transform data from service format to UI format
   * @standardized true
   */
  static toUI(businessPlanData: BusinessPlanData): UIMarketAnalysis {
    // Core standardized implementation
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use toCustomerSegments instead
   */
  static transformToCustomerSegments(businessPlanData: BusinessPlanData): UICustomerSegment[] {
    return MarketAnalysisAdapter.toCustomerSegments(businessPlanData);
  }

  /**
   * Standardized method that supports both new and old patterns
   * @standardized true
   */
  static toCustomerSegments(businessPlanData: BusinessPlanData): UICustomerSegment[] {
    // Implementation that works with both patterns
    // Adds aliases: segments for customerSegments
  }
}

// Original adapter as proxy
export class MarketAnalysisAdapter {
  static toUI(businessPlanData: BusinessPlanData): UIMarketAnalysis {
    return StandardizedAdapter.toUI(businessPlanData);
  }
  
  static transformToCustomerSegments(businessPlanData: BusinessPlanData): UICustomerSegment[] {
    return StandardizedAdapter.toCustomerSegments(businessPlanData);
  }
}
```

## Conclusion

This standardization approach ensures backward compatibility while moving toward a cleaner architecture. The bidirectional adapters successfully bridge the gap between legacy tests and standardized implementation, allowing for a gradual migration path rather than a disruptive rewrite.