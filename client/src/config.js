export function backendRoute() {
  const viteEnv = typeof import.meta !== 'undefined' && import.meta && import.meta.env
    ? import.meta.env
    : {};

  const configuredRoute = (
    viteEnv.VITE_BACKEND_ROUTE ||
    viteEnv.REACT_APP_BACKEND_ROUTE ||
    (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env
      ? globalThis.process.env.REACT_APP_BACKEND_ROUTE || globalThis.process.env.VITE_BACKEND_ROUTE
      : undefined)
  ) || 'http://localhost:8080';

  return configuredRoute.replace(/\/$/, '');
}
