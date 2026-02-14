import { defineEventHandler, getQuery, sendRedirect } from 'h3';
import {
  findLeadByEmailNormalized,
  getPasswordlessCooldownSeconds,
  isLoginInitiationInCooldown,
  markLoginInitiated,
  normalizeEmail,
} from '../../../utils/leadRegistration';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const emailNormalized = normalizeEmail(query.email);

  if (!emailNormalized) {
    return sendRedirect(event, '/');
  }

  const lead = await findLeadByEmailNormalized(emailNormalized);
  if (!lead?.zohoSyncedAt) {
    return sendRedirect(event, '/');
  }

  if (isLoginInitiationInCooldown(lead, getPasswordlessCooldownSeconds())) {
    return sendRedirect(event, '/');
  }

  await markLoginInitiated(lead.id);

  const auth0 = useAuth0(event);
  const authorizationUrl = await auth0.startInteractiveLogin({
    appState: {
      returnTo: '/api/v1/auth/post-login?flow=pwl',
    },
    authorizationParams: {
      connection: 'email',
      login_hint: emailNormalized,
      screen_hint: 'login',
      response_type: 'code',
      scope: 'openid profile email',
    },
  });

  if (import.meta.dev) {
    console.info('[auth/passwordless-login]', {
      leadId: lead.id,
      emailNormalized,
      action: 'redirect_to_auth0',
    });
  }

  return sendRedirect(event, authorizationUrl.href);
});
