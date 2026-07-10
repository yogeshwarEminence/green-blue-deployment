// - Local dev (`npm run dev`): VITE_API_URL comes from client/.env.development
//   and points straight at the backend on http://localhost:4000/api.
// - Docker: no VITE_API_URL is set at build time, so this falls back to the
//   relative path "/api". nginx (see client/nginx.conf) receives that request
//   on port 80 and forwards it to the "backend" container. The browser never
//   needs to know the backend's Docker service name — only nginx does.
const API_URL = import.meta.env.VITE_API_URL || '/api';

export default API_URL;
