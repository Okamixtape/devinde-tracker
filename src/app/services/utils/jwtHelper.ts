/**
 * JWT Helper - Utility functions for JWT token management
 * 
 * This module provides utilities for working with JWT tokens in a client-side 
 * environment. Since we're using localStorage for persistence and don't have
 * a backend server for proper JWT signing, this is a simplified implementation.
 * 
 * NOTE: In a real production app, tokens should be generated and verified on the server side.
 */

// Token configuration
const TOKEN_SECRET = 'devinde-tracker-jwt-secret';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Simple base64 encoding for JWT parts
 */
const base64Encode = (obj: Record<string, unknown>): string => {
  return btoa(JSON.stringify(obj));
};

/**
 * Simple base64 decoding for JWT parts
 */
const base64Decode = (str: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(atob(str)) as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Silently fail with null return on decode errors
    return null;
  }
};

/**
 * Generate a simplified JWT token
 * Note: This is NOT a secure implementation and should only be used for demo purposes
 * In a real app, tokens would be generated server-side with a proper library
 */
export const generateToken = (payload: Record<string, unknown>): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Date.now();
  const expiresAt = now + TOKEN_EXPIRY;
  
  const tokenPayload = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor(expiresAt / 1000)
  };

  const encodedHeader = base64Encode(header);
  const encodedPayload = base64Encode(tokenPayload);
  
  // In a real implementation, this would be signed with a secure algorithm
  // For demo purposes, we're just concatenating parts
  return `${encodedHeader}.${encodedPayload}.${TOKEN_SECRET}`;
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): { valid: boolean; payload?: Record<string, unknown>; expired?: boolean } => {
  try {
    // Split the token into parts
    const [, payloadBase64, signature] = token.split('.');
    
    // Verify signature (simplified)
    if (signature !== TOKEN_SECRET) {
      return { valid: false };
    }
    
    // Decode payload
    const payload = base64Decode(payloadBase64);
    
    if (!payload) {
      return { valid: false };
    }
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && typeof payload.exp === 'number' && payload.exp < now) {
      return { valid: false, expired: true };
    }
    
    return { valid: true, payload };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Log error in production scenarios
    return { valid: false };
  }
};

/**
 * Get the payload from a token without verifying it
 * Useful for extracting user info when verification is done elsewhere
 */
export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    // Split the token into parts
    const [, payloadBase64] = token.split('.');
    
    // Decode payload
    return base64Decode(payloadBase64);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
};
