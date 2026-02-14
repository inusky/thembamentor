export default defineNuxtRouteMiddleware(async () => {
  const user: any = await $fetch('/api/v1/auth/me');

  if (!user.authenticated) {
    return navigateTo('/auth/sign-in');
  } else {
    return;
  }
});
