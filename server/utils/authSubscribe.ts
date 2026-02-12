import { setResponseStatus, type H3Event } from 'h3';
import { prisma } from './prisma';
import { AuthUserSyncError, syncAuthenticatedUser } from './authUserSync';

type SubscribeRouteState =
  | 'subscribed'
  | 'already_subscribed'
  | 'skipped_no_email';

type InternalZohoSubscribeResponse = {
  ok?: boolean;
  error?: string;
};

type FetchErrorLike = {
  statusCode?: unknown;
  data?: {
    error?: unknown;
  };
  message?: unknown;
};

function extractZohoCode(message: string | undefined) {
  if (!message) return undefined;
  const match = message.match(/\(code:\s*([^)]+)\)/i);
  return match?.[1]?.trim();
}

function buildZohoFailureMessage(code?: string) {
  return code
    ? `Failed to subscribe via Zoho (code: ${code})`
    : 'Failed to subscribe via Zoho';
}

function parseFetchError(error: unknown) {
  const fetchError = error as FetchErrorLike;
  const statusCode =
    typeof fetchError?.statusCode === 'number' ? fetchError.statusCode : undefined;
  const apiMessage =
    typeof fetchError?.data?.error === 'string' ? fetchError.data.error : undefined;
  const message =
    apiMessage ||
    (typeof fetchError?.message === 'string'
      ? fetchError.message
      : 'Unknown error');

  return { statusCode, message };
}

function success(state: SubscribeRouteState) {
  return { ok: true as const, state };
}

export async function handleAuthSubscribe(event: H3Event) {
  try {
    const result = await syncAuthenticatedUser(event);

    if (!result.authenticated) {
      setResponseStatus(event, 401);
      return { ok: false, error: 'Unauthorized' };
    }

    const { user, profile } = result;

    if (!profile.email) {
      return success('skipped_no_email');
    }

    if (user.zohoSubscribedAt) {
      return success('already_subscribed');
    }

    let subscribeResult: InternalZohoSubscribeResponse;
    try {
      subscribeResult = await event.$fetch<InternalZohoSubscribeResponse>(
        '/api/v1/zoho/subscribe',
        {
          method: 'POST',
          body: {
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
          },
          retry: 1,
          retryDelay: 250,
        },
      );
    } catch (error) {
      const { statusCode, message } = parseFetchError(error);
      const zohoCode = extractZohoCode(message);

      console.error('[auth/subscribe] Zoho subscribe endpoint call failed', {
        auth0Id: profile.auth0Id,
        email: profile.email,
        statusCode,
        message,
      });

      setResponseStatus(event, 502);
      return {
        ok: false,
        error: buildZohoFailureMessage(zohoCode),
      };
    }

    if (!subscribeResult?.ok) {
      const zohoCode = extractZohoCode(subscribeResult?.error);

      console.error('[auth/subscribe] Zoho subscribe endpoint returned failure', {
        auth0Id: profile.auth0Id,
        email: profile.email,
        error: subscribeResult?.error || 'Unknown error',
      });

      setResponseStatus(event, 502);
      return {
        ok: false,
        error: buildZohoFailureMessage(zohoCode),
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { zohoSubscribedAt: new Date() },
    });

    return success('subscribed');
  } catch (error) {
    if (error instanceof AuthUserSyncError) {
      console.error('[auth/subscribe] Failed during auth user sync', {
        statusCode: error.statusCode,
        message: error.message,
      });
    } else {
      console.error('[auth/subscribe] Unexpected server error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    setResponseStatus(event, 500);
    return { ok: false, error: 'Internal server error' };
  }
}

