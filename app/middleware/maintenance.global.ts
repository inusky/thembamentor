export default defineNuxtRouteMiddleware((to) => {
  const cfg = useRuntimeConfig();
  const enabled = cfg.public.maintenanceMode === 'true';

  // allow the maintenance page itself + assets
  if (!enabled) return;
  if (to.path === '/maintenance') return;

  return navigateTo('/maintenance');
});
