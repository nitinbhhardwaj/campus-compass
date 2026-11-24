/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const contactEmail = env.VITE_CONTACT_EMAIL || process.env.VITE_CONTACT_EMAIL;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'validate-contact-email',
        buildStart() {
          if (
            !contactEmail ||
            !contactEmail.trim() ||
            contactEmail.includes('placeholder') ||
            contactEmail.includes('example.com')
          ) {
            throw new Error(
              'Build failed: VITE_CONTACT_EMAIL environment variable must be set to a valid, non-placeholder email address.'
            );
          }
        },
      },
    ],
    test: {
      globals: true,
      environment: 'node',
    },
  };
});
