/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Mapping pour les imports absolus dans Next.js
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    // Transformation des fichiers TypeScript
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // Fichiers à ignorer
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/'
  ],
  // Extensions de fichiers à considérer
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Fichiers à couvrir
  collectCoverageFrom: [
    'src/app/adapters/**/*.{ts,tsx}',
    'src/app/utils/calculations/**/*.{ts,tsx}',
    'src/app/hooks/**/*.{ts,tsx}',
    '!src/app/adapters/templates/**/*.{ts,tsx}'
  ],
};

module.exports = config;