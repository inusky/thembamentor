export default defineNuxtRouteMiddleware(async (to) => {
  const user: any = await $fetch('/api/v1/auth/me');

  if (!user.authenticated && to.path !== '/auth/sign-in') {
    return navigateTo('/auth/sign-in');
  } else if (user.authenticated && to.path === '/auth/sign-in') {
    return navigateTo('/');
  } else {
    return;
  }
});
