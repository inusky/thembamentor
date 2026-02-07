export default defineNuxtRouteMiddleware(async () => {
  const user: any = await $fetch('/api/auth/me');

  if (!user.authenticated) {
    return navigateTo('/auth/sign-in');
  } else {
    return;
  }
});
