// cypress.config.ts
import { defineConfig } from 'cypress';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  e2e: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SERVER_ENDPOINT: process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
    NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT,
    TEST_USER_EMAIL: 'super@example.com',
    TEST_USER_PASSWORD: 'Password123$9',
  },
});