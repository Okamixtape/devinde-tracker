/**
 * Documentation utilities for DevIndé Tracker services
 * 
 * This module provides utilities for documenting service interfaces and methods,
 * generating examples, and creating interactive documentation.
 */

import { ServiceResult } from '../interfaces/data-models';

/**
 * Parameter documentation
 */
export interface ParameterDoc {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

/**
 * Return type documentation
 */
export interface ReturnTypeDoc {
  type: string;
  description: string;
  example?: unknown;
}

/**
 * Method documentation
 */
export interface MethodDoc {
  name: string;
  description: string;
  parameters: ParameterDoc[];
  returns: ReturnTypeDoc;
  example?: string;
  notes?: string[];
  since?: string;
  deprecated?: boolean;
  deprecationMessage?: string;
}

/**
 * Service documentation
 */
export interface ServiceDoc {
  name: string;
  description: string;
  usage: string;
  methods: MethodDoc[];
}

/**
 * Document collection
 */
export interface DocumentationCollection {
  services: ServiceDoc[];
}

/**
 * Example generator for ServiceResult
 */
export function generateServiceResultExample<T>(
  success: boolean, 
  data?: T, 
  errorCode?: string, 
  errorMessage?: string
): ServiceResult<T> {
  if (success) {
    return {
      success: true,
      data: data as T
    };
  } else {
    return {
      success: false,
      error: {
        code: errorCode || 'ERROR_CODE',
        message: errorMessage || 'Error message',
        details: 'Additional error details'
      }
    };
  }
}

/**
 * Business Plan Service Documentation
 */
export const businessPlanServiceDoc: ServiceDoc = {
  name: 'BusinessPlanService',
  description: 'Service for managing business plans in the DevIndé Tracker',
  usage: `
import { BusinessPlanService } from '../services/interfaces/service-interfaces';
import { getBusinessPlanService } from '../services/service-factory';

// Get the business plan service instance
const businessPlanService = getBusinessPlanService();

// Use the service methods
const result = await businessPlanService.createBusinessPlan({ name: 'My Business Plan' });
if (result.success) {
  console.log('Created business plan:', result.data);
}
  `,
  methods: [
    {
      name: 'getBusinessPlans',
      description: 'Retrieves all business plans for the current user',
      parameters: [],
      returns: {
        type: 'Promise<ServiceResult<BusinessPlanData[]>>',
        description: 'A promise that resolves to a service result containing an array of business plans',
        example: generateServiceResultExample(true, [
          { 
            id: '1', 
            name: 'Freelance Web Development', 
            description: 'Business plan for freelance web development services',
            createdAt: '2025-04-10T12:00:00.000Z',
            updatedAt: '2025-04-15T14:30:00.000Z',
            sections: []
          },
          { 
            id: '2', 
            name: 'Mobile App Startup', 
            description: 'Business plan for a mobile app startup idea',
            createdAt: '2025-04-12T09:15:00.000Z',
            updatedAt: '2025-04-15T10:45:00.000Z',
            sections: []
          }
        ])
      },
      example: `
// Get all business plans
const result = await businessPlanService.getBusinessPlans();
if (result.success) {
  const businessPlans = result.data;
  console.log(\`Found \${businessPlans.length} business plans\`);
} else {
  console.error('Failed to get business plans:', result.error);
}
      `
    },
    {
      name: 'getBusinessPlan',
      description: 'Retrieves a specific business plan by ID',
      parameters: [
        {
          name: 'id',
          type: 'string',
          description: 'The ID of the business plan to retrieve',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<BusinessPlanData>>',
        description: 'A promise that resolves to a service result containing the business plan',
        example: generateServiceResultExample(true, { 
          id: '1', 
          name: 'Freelance Web Development', 
          description: 'Business plan for freelance web development services',
          createdAt: '2025-04-10T12:00:00.000Z',
          updatedAt: '2025-04-15T14:30:00.000Z',
          sections: []
        })
      },
      example: `
// Get a specific business plan by ID
const businessPlanId = '1';
const result = await businessPlanService.getBusinessPlan(businessPlanId);
if (result.success) {
  const businessPlan = result.data;
  console.log('Retrieved business plan:', businessPlan.name);
} else {
  console.error('Failed to get business plan:', result.error);
}
      `
    },
    {
      name: 'createBusinessPlan',
      description: 'Creates a new business plan',
      parameters: [
        {
          name: 'businessPlan',
          type: 'Partial<BusinessPlanData>',
          description: 'The business plan data to create',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<BusinessPlanData>>',
        description: 'A promise that resolves to a service result containing the created business plan',
        example: generateServiceResultExample(true, { 
          id: '3', 
          name: 'New Business Plan', 
          description: 'Description of new business plan',
          createdAt: '2025-05-04T15:30:00.000Z',
          updatedAt: '2025-05-04T15:30:00.000Z',
          sections: []
        })
      },
      example: `
// Create a new business plan
const newBusinessPlan = {
  name: 'New Business Plan',
  description: 'Description of new business plan'
};
const result = await businessPlanService.createBusinessPlan(newBusinessPlan);
if (result.success) {
  const createdPlan = result.data;
  console.log('Created business plan with ID:', createdPlan.id);
} else {
  console.error('Failed to create business plan:', result.error);
}
      `
    },
    {
      name: 'updateBusinessPlan',
      description: 'Updates an existing business plan',
      parameters: [
        {
          name: 'id',
          type: 'string',
          description: 'The ID of the business plan to update',
          required: true
        },
        {
          name: 'updates',
          type: 'Partial<BusinessPlanData>',
          description: 'The business plan data to update',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<BusinessPlanData>>',
        description: 'A promise that resolves to a service result containing the updated business plan',
        example: generateServiceResultExample(true, { 
          id: '1', 
          name: 'Updated Business Plan Name', 
          description: 'Updated description of the business plan',
          createdAt: '2025-04-10T12:00:00.000Z',
          updatedAt: '2025-05-04T16:10:00.000Z',
          sections: []
        })
      },
      example: `
// Update an existing business plan
const businessPlanId = '1';
const updates = {
  name: 'Updated Business Plan Name',
  description: 'Updated description of the business plan'
};
const result = await businessPlanService.updateBusinessPlan(businessPlanId, updates);
if (result.success) {
  const updatedPlan = result.data;
  console.log('Updated business plan:', updatedPlan.name);
} else {
  console.error('Failed to update business plan:', result.error);
}
      `
    },
    {
      name: 'deleteBusinessPlan',
      description: 'Deletes a business plan',
      parameters: [
        {
          name: 'id',
          type: 'string',
          description: 'The ID of the business plan to delete',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<boolean>>',
        description: 'A promise that resolves to a service result containing a boolean indicating success',
        example: generateServiceResultExample(true, true)
      },
      example: `
// Delete a business plan
const businessPlanId = '1';
const result = await businessPlanService.deleteBusinessPlan(businessPlanId);
if (result.success) {
  console.log('Business plan deleted successfully');
} else {
  console.error('Failed to delete business plan:', result.error);
}
      `
    }
  ]
};

/**
 * Section Service Documentation
 */
export const sectionServiceDoc: ServiceDoc = {
  name: 'SectionService',
  description: 'Service for managing sections in a business plan',
  usage: `
import { SectionService } from '../services/interfaces/service-interfaces';
import { getSectionService } from '../services/service-factory';

// Get the section service instance
const sectionService = getSectionService();

// Use the service methods
const result = await sectionService.getSections('business-plan-id');
if (result.success) {
  console.log('Sections:', result.data);
}
  `,
  methods: [
    {
      name: 'getSections',
      description: 'Retrieves all sections for a specific business plan',
      parameters: [
        {
          name: 'businessPlanId',
          type: 'string',
          description: 'The ID of the business plan to get sections for',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<SectionData[]>>',
        description: 'A promise that resolves to a service result containing an array of sections',
        example: generateServiceResultExample(true, [
          { 
            id: 's1', 
            businessPlanId: '1',
            title: 'Executive Summary', 
            content: 'This is the executive summary of the business plan...',
            order: 1,
            createdAt: '2025-04-10T12:00:00.000Z',
            updatedAt: '2025-04-15T14:30:00.000Z'
          },
          { 
            id: 's2', 
            businessPlanId: '1',
            title: 'Market Analysis', 
            content: 'Analysis of the target market...',
            order: 2,
            createdAt: '2025-04-10T12:15:00.000Z',
            updatedAt: '2025-04-15T14:45:00.000Z'
          }
        ])
      },
      example: `
// Get all sections for a business plan
const businessPlanId = '1';
const result = await sectionService.getSections(businessPlanId);
if (result.success) {
  const sections = result.data;
  console.log(\`Found \${sections.length} sections\`);
} else {
  console.error('Failed to get sections:', result.error);
}
      `
    },
    {
      name: 'getSection',
      description: 'Retrieves a specific section by ID',
      parameters: [
        {
          name: 'id',
          type: 'string',
          description: 'The ID of the section to retrieve',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<SectionData>>',
        description: 'A promise that resolves to a service result containing the section',
        example: generateServiceResultExample(true, { 
          id: 's1', 
          businessPlanId: '1',
          title: 'Executive Summary', 
          content: 'This is the executive summary of the business plan...',
          order: 1,
          createdAt: '2025-04-10T12:00:00.000Z',
          updatedAt: '2025-04-15T14:30:00.000Z'
        })
      },
      example: `
// Get a specific section by ID
const sectionId = 's1';
const result = await sectionService.getSection(sectionId);
if (result.success) {
  const section = result.data;
  console.log('Retrieved section:', section.title);
} else {
  console.error('Failed to get section:', result.error);
}
      `
    },
    {
      name: 'createSection',
      description: 'Creates a new section for a business plan',
      parameters: [
        {
          name: 'section',
          type: 'Partial<SectionData>',
          description: 'The section data to create',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<SectionData>>',
        description: 'A promise that resolves to a service result containing the created section',
        example: generateServiceResultExample(true, { 
          id: 's3', 
          businessPlanId: '1',
          title: 'Financial Projections', 
          content: 'Financial projections for the next 5 years...',
          order: 3,
          createdAt: '2025-05-04T15:30:00.000Z',
          updatedAt: '2025-05-04T15:30:00.000Z'
        })
      },
      example: `
// Create a new section
const newSection = {
  businessPlanId: '1',
  title: 'Financial Projections',
  content: 'Financial projections for the next 5 years...',
  order: 3
};
const result = await sectionService.createSection(newSection);
if (result.success) {
  const createdSection = result.data;
  console.log('Created section with ID:', createdSection.id);
} else {
  console.error('Failed to create section:', result.error);
}
      `
    },
    {
      name: 'updateSection',
      description: 'Updates an existing section',
      parameters: [
        {
          name: 'id',
          type: 'string',
          description: 'The ID of the section to update',
          required: true
        },
        {
          name: 'updates',
          type: 'Partial<SectionData>',
          description: 'The section data to update',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<SectionData>>',
        description: 'A promise that resolves to a service result containing the updated section',
        example: generateServiceResultExample(true, { 
          id: 's1', 
          businessPlanId: '1',
          title: 'Updated Executive Summary', 
          content: 'This is the updated executive summary of the business plan...',
          order: 1,
          createdAt: '2025-04-10T12:00:00.000Z',
          updatedAt: '2025-05-04T16:10:00.000Z'
        })
      },
      example: `
// Update an existing section
const sectionId = 's1';
const updates = {
  title: 'Updated Executive Summary',
  content: 'This is the updated executive summary of the business plan...'
};
const result = await sectionService.updateSection(sectionId, updates);
if (result.success) {
  const updatedSection = result.data;
  console.log('Updated section:', updatedSection.title);
} else {
  console.error('Failed to update section:', result.error);
}
      `
    },
    {
      name: 'deleteSection',
      description: 'Deletes a section',
      parameters: [
        {
          name: 'id',
          type: 'string',
          description: 'The ID of the section to delete',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<boolean>>',
        description: 'A promise that resolves to a service result containing a boolean indicating success',
        example: generateServiceResultExample(true, true)
      },
      example: `
// Delete a section
const sectionId = 's1';
const result = await sectionService.deleteSection(sectionId);
if (result.success) {
  console.log('Section deleted successfully');
} else {
  console.error('Failed to delete section:', result.error);
}
      `
    },
    {
      name: 'reorderSections',
      description: 'Reorders the sections of a business plan',
      parameters: [
        {
          name: 'businessPlanId',
          type: 'string',
          description: 'The ID of the business plan to reorder sections for',
          required: true
        },
        {
          name: 'sectionOrder',
          type: 'Array<{ id: string; order: number }>',
          description: 'An array of section IDs and their new order positions',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<SectionData[]>>',
        description: 'A promise that resolves to a service result containing the reordered sections',
        example: generateServiceResultExample(true, [
          { 
            id: 's2', 
            businessPlanId: '1',
            title: 'Market Analysis', 
            content: 'Analysis of the target market...',
            order: 1,
            createdAt: '2025-04-10T12:15:00.000Z',
            updatedAt: '2025-05-04T16:15:00.000Z'
          },
          { 
            id: 's1', 
            businessPlanId: '1',
            title: 'Executive Summary', 
            content: 'This is the executive summary of the business plan...',
            order: 2,
            createdAt: '2025-04-10T12:00:00.000Z',
            updatedAt: '2025-05-04T16:15:00.000Z'
          }
        ])
      },
      example: `
// Reorder sections of a business plan
const businessPlanId = '1';
const sectionOrder = [
  { id: 's2', order: 1 },
  { id: 's1', order: 2 }
];
const result = await sectionService.reorderSections(businessPlanId, sectionOrder);
if (result.success) {
  const reorderedSections = result.data;
  console.log('Sections reordered successfully');
} else {
  console.error('Failed to reorder sections:', result.error);
}
      `
    }
  ]
};

/**
 * Auth Service Documentation
 */
export const authServiceDoc: ServiceDoc = {
  name: 'AuthService',
  description: 'Service for user authentication and authorization',
  usage: `
import { AuthService } from '../services/interfaces/service-interfaces';
import { getAuthService } from '../services/service-factory';

// Get the auth service instance
const authService = getAuthService();

// Use the service methods
const result = await authService.login('username', 'password');
if (result.success) {
  console.log('Logged in successfully:', result.data);
}
  `,
  methods: [
    {
      name: 'register',
      description: 'Registers a new user account',
      parameters: [
        {
          name: 'username',
          type: 'string',
          description: 'The username for the new account',
          required: true
        },
        {
          name: 'password',
          type: 'string',
          description: 'The password for the new account',
          required: true
        },
        {
          name: 'userData',
          type: 'Partial<UserData>',
          description: 'Additional user data fields',
          required: false
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<UserData>>',
        description: 'A promise that resolves to a service result containing the user data (without password)',
        example: generateServiceResultExample(true, { 
          id: 'u1', 
          username: 'johndoe',
          email: 'john.doe@example.com',
          name: 'John Doe',
          role: 'user',
          createdAt: '2025-05-04T15:30:00.000Z',
          updatedAt: '2025-05-04T15:30:00.000Z'
        })
      },
      example: `
// Register a new user
const username = 'johndoe';
const password = 'securePassword123';
const userData = {
  email: 'john.doe@example.com',
  name: 'John Doe'
};
const result = await authService.register(username, password, userData);
if (result.success) {
  const user = result.data;
  console.log('User registered successfully:', user.username);
} else {
  console.error('Registration failed:', result.error);
}
      `
    },
    {
      name: 'login',
      description: 'Authenticates a user and generates an auth token',
      parameters: [
        {
          name: 'username',
          type: 'string',
          description: 'The username to login with',
          required: true
        },
        {
          name: 'password',
          type: 'string',
          description: 'The password to login with',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<AuthResponse>>',
        description: 'A promise that resolves to a service result containing the auth response with token and user data',
        example: generateServiceResultExample(true, { 
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'u1', 
            username: 'johndoe',
            email: 'john.doe@example.com',
            name: 'John Doe',
            role: 'user'
          }
        })
      },
      example: `
// Login a user
const username = 'johndoe';
const password = 'securePassword123';
const result = await authService.login(username, password);
if (result.success) {
  const { token, user } = result.data;
  console.log('Login successful for user:', user.name);
  console.log('Token:', token);
  
  // Save token for future authenticated requests
  localStorage.setItem('auth_token', token);
} else {
  console.error('Login failed:', result.error);
}
      `
    },
    {
      name: 'logout',
      description: 'Logs out the current user by invalidating their token',
      parameters: [],
      returns: {
        type: 'Promise<ServiceResult<boolean>>',
        description: 'A promise that resolves to a service result indicating success',
        example: generateServiceResultExample(true, true)
      },
      example: `
// Logout the current user
const result = await authService.logout();
if (result.success) {
  console.log('Logout successful');
  
  // Remove token from storage
  localStorage.removeItem('auth_token');
} else {
  console.error('Logout failed:', result.error);
}
      `
    },
    {
      name: 'getCurrentUser',
      description: 'Gets the currently authenticated user',
      parameters: [],
      returns: {
        type: 'Promise<ServiceResult<UserData | null>>',
        description: 'A promise that resolves to a service result containing the current user data or null if not authenticated',
        example: generateServiceResultExample(true, { 
          id: 'u1', 
          username: 'johndoe',
          email: 'john.doe@example.com',
          name: 'John Doe',
          role: 'user'
        })
      },
      example: `
// Get the current user
const result = await authService.getCurrentUser();
if (result.success && result.data) {
  const currentUser = result.data;
  console.log('Current user:', currentUser.name);
} else {
  console.log('No user is currently logged in');
}
      `
    },
    {
      name: 'updateUserProfile',
      description: 'Updates the profile information for the current user',
      parameters: [
        {
          name: 'updates',
          type: 'Partial<UserData>',
          description: 'The user profile data to update',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<UserData>>',
        description: 'A promise that resolves to a service result containing the updated user data',
        example: generateServiceResultExample(true, { 
          id: 'u1', 
          username: 'johndoe',
          email: 'updated.email@example.com',
          name: 'John Updated Doe',
          role: 'user',
          createdAt: '2025-05-04T15:30:00.000Z',
          updatedAt: '2025-05-04T16:45:00.000Z'
        })
      },
      example: `
// Update user profile
const updates = {
  email: 'updated.email@example.com',
  name: 'John Updated Doe'
};
const result = await authService.updateUserProfile(updates);
if (result.success) {
  const updatedUser = result.data;
  console.log('Profile updated successfully:', updatedUser.name);
} else {
  console.error('Failed to update profile:', result.error);
}
      `
    },
    {
      name: 'changePassword',
      description: 'Changes the password for the current user',
      parameters: [
        {
          name: 'currentPassword',
          type: 'string',
          description: 'The current password for verification',
          required: true
        },
        {
          name: 'newPassword',
          type: 'string',
          description: 'The new password to set',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<boolean>>',
        description: 'A promise that resolves to a service result indicating success',
        example: generateServiceResultExample(true, true)
      },
      example: `
// Change user password
const currentPassword = 'securePassword123';
const newPassword = 'evenMoreSecurePassword456';
const result = await authService.changePassword(currentPassword, newPassword);
if (result.success) {
  console.log('Password changed successfully');
} else {
  console.error('Failed to change password:', result.error);
}
      `
    },
    {
      name: 'checkPermission',
      description: 'Checks if the current user has a specific permission',
      parameters: [
        {
          name: 'permission',
          type: 'string',
          description: 'The permission to check for',
          required: true
        }
      ],
      returns: {
        type: 'Promise<ServiceResult<boolean>>',
        description: 'A promise that resolves to a service result indicating if the user has the permission',
        example: generateServiceResultExample(true, true)
      },
      example: `
// Check if user has admin permission
const permission = 'admin';
const result = await authService.checkPermission(permission);
if (result.success && result.data) {
  console.log('User has admin permission');
} else {
  console.log('User does not have admin permission');
}
      `
    }
  ]
};

/**
 * Complete service documentation collection
 */
export const serviceDocumentation: DocumentationCollection = {
  services: [
    businessPlanServiceDoc,
    sectionServiceDoc,
    authServiceDoc
  ]
};

// Export as default for easier imports
export default serviceDocumentation;
