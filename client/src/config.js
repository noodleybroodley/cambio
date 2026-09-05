export function backendRoute() {
  const viteRoute = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_BACKEND_ROUTE || import.meta.env.REACT_APP_BACKEND_ROUTE
    : undefined;

  const nodeRoute = typeof process !== 'undefined' && process.env
    ? process.env.REACT_APP_BACKEND_ROUTE || process.env.VITE_BACKEND_ROUTE
    : undefined;

  return (viteRoute || nodeRoute || 'http://localhost:8080').replace(/\/$/, '');
}
