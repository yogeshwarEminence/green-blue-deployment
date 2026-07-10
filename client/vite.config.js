import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No proxy configuration needed on purpose.
// The frontend talks to the backend using a full URL that comes from
// VITE_API_URL (see src/api.js), so there is nothing for Vite to proxy.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow access from outside the container during `npm run dev`
    port: 5173,
  },
});
