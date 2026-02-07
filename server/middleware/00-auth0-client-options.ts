import { defineEventHandler, createError, getRequestURL } from 'h3';

export default defineEventHandler((event) => {
  if ((event.context as any).auth0ClientOptions) return;

  const runtimeConfig = useRuntimeConfig();
  const auth0 = runtimeConfig.auth0 as any;

  if (!auth0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Auth0 runtimeConfig.auth0 is missing',
    });
  }

  // Derive a safe base URL even if env is missing
  const appBaseUrl =
    auth0.appBaseUrl && String(auth0.appBaseUrl).trim()
      ? String(auth0.appBaseUrl).trim()
      : getRequestURL(event).origin;

  const secret = auth0.secret || auth0.sessionSecret;

  if (!auth0.domain || !auth0.clientId || !secret) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Auth0 configuration error: domain/clientId/secret missing',
    });
  }

  (event.context as any).auth0ClientOptions = {
    ...auth0,
    appBaseUrl,
    secret,
  };
});
