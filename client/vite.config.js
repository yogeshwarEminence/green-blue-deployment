import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No proxy config here on purpose. In local dev, the app calls
// VITE_API_URL directly (see .env.development). In Docker, nginx
// handles routing /api to the backend container. See README.md.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
