import { watch } from 'vue';

type AuthSubscribeResponse = {
  ok?: boolean;
  state?: 'subscribed' | 'already_subscribed' | 'skipped_no_email';
  error?: string;
};

const SESSION_KEY_PREFIX = 'zoho_auth_subscribe_fired';
const CONFIRM_ROUTE = '/zoho/confirm';
const inFlightByUser = new Set<string>();
const fallbackSessionFlags = new Set<string>();
let hasWarnedStorageUnavailable = false;

function warnStorageUnavailable(error: unknown) {
  if (hasWarnedStorageUnavailable) return;
  hasWarnedStorageUnavailable = true;

  console.warn('[post-auth-subscribe] sessionStorage unavailable, using in-memory fallback', {
    message: error instanceof Error ? error.message : 'Unknown error',
  });
}

function getSessionKey(userKey: string) {
  return `${SESSION_KEY_PREFIX}:${userKey}`;
}

function alreadyTriggeredInSession(userKey: string) {
  if (!import.meta.client) return false;
  const key = getSessionKey(userKey);

  try {
    return sessionStorage.getItem(key) === '1';
  } catch (error) {
    warnStorageUnavailable(error);
    return fallbackSessionFlags.has(key);
  }
}

function markTriggeredInSession(userKey: string) {
  if (!import.meta.client) return;
  const key = getSessionKey(userKey);

  try {
    sessionStorage.setItem(key, '1');
  } catch (error) {
    warnStorageUnavailable(error);
  }

  fallbackSessionFlags.add(key);
}

async function triggerAuthSubscribeRoute(
  userKey: string,
): Promise<AuthSubscribeResponse | null> {
  if (inFlightByUser.has(userKey)) return null;

  inFlightByUser.add(userKey);

  try {
    const result = await $fetch<AuthSubscribeResponse>(
      '/api/v1/auth/subscribe',
      {
        method: 'POST',
        retry: 1,
        retryDelay: 250,
      },
    );

    if (!result?.ok) {
      console.warn('[post-auth-subscribe] auth subscribe returned failure', {
        error: result?.error || 'Unknown error',
      });
      return null;
    }

    console.info('[post-auth-subscribe] auth subscribe completed', {
      state: result.state,
    });

    return result;
  } catch (error) {
    console.warn('[post-auth-subscribe] auth subscribe call failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  } finally {
    inFlightByUser.delete(userKey);
  }
}

export default defineNuxtPlugin(() => {
  const { isSignedIn, me, refresh } = useAuthState();
  const route = useRoute();
  const router = useRouter();

  const maybeSubscribeAndRedirect = async () => {
    if (!isSignedIn.value) return;

    const user = me.value?.user;
    if (!user) return;

    const userKey = user.auth0Id || user.id;
    if (!userKey) return;

    if (alreadyTriggeredInSession(userKey)) return;

    if (user.zohoSubscribedAt) {
      markTriggeredInSession(userKey);
      return;
    }

    const result = await triggerAuthSubscribeRoute(userKey);
    if (!result?.ok) return;

    markTriggeredInSession(userKey);
    void refresh();

    if (result.state === 'subscribed' && route.path !== CONFIRM_ROUTE) {
      await router.replace(CONFIRM_ROUTE);
    }
  };

  watch(
    () => [
      isSignedIn.value,
      me.value?.user?.id,
      me.value?.user?.auth0Id,
      me.value?.user?.zohoSubscribedAt,
      route.fullPath,
    ],
    () => {
      void maybeSubscribeAndRedirect();
    },
    { immediate: true },
  );
});
