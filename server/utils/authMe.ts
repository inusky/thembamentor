import { setResponseStatus, type H3Event } from 'h3';
import { AuthUserSyncError, syncAuthenticatedUser } from './authUserSync';

export async function handleAuthMe(event: H3Event) {
  try {
    const result = await syncAuthenticatedUser(event);
    if (!result.authenticated) {
      return { authenticated: false, user: null };
    }

    return {
      authenticated: true,
      user: result.user,
    };
  } catch (error) {
    const statusCode =
      error instanceof AuthUserSyncError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : 'Unknown auth/me error';

    console.error('[auth/me] Failed to resolve auth user', {
      statusCode,
      message,
    });

    setResponseStatus(event, 500);
    return { authenticated: false, user: null };
  }
}
