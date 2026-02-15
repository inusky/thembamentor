import { defineEventHandler, getQuery, sendRedirect } from 'h3';
import { syncUserZohoSubscribedFromLead } from '../../../utils/leadRegistration';
import { syncAuthenticatedUser } from '../../../utils/authUserSync';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  if (query.flow !== 'pwl') {
    return sendRedirect(event, '/');
  }

  const auth0 = useAuth0(event);
  const session = await auth0.getSession();

  if (!session?.user) {
    return sendRedirect(event, '/');
  }

  try {
    const result = await syncAuthenticatedUser(event);

    if (result.authenticated) {
      await syncUserZohoSubscribedFromLead({
        userId: result.user.id,
        email: result.profile.email,
        userZohoSubscribedAt: result.user.zohoSubscribedAt,
      });
    }
  } catch (error) {
    console.error('[auth/post-login] Failed to sync user after callback', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return sendRedirect(event, '/');
});
