interface AuthMeApiResponse {
  authenticated: boolean;
  user: {
    id: string;
    auth0Id: string;
    email: string | null;
    name: string | null;
    imageUrl: string | null;
    zohoSubscribedAt: string | null;
    deletedAt: string | null;
  } | null;
}

interface AuthMeResponse {
  authenticated: boolean;
  user: {
    id: string;
    auth0Id: string;
    email: string | null;
    name: string | null;
    imageUrl: string | null;
    zohoSubscribedAt: Date | null;
    deletedAt: Date | null;
  } | null;
}

function parseApiDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const useAuthState = () => {
  const { data, pending, refresh, error } = useFetch<AuthMeApiResponse>(
    '/api/v1/auth/me',
    {
      key: 'auth-me',
    },
  );

  const me = computed<AuthMeResponse | null>(() => {
    if (!data.value) return null;
    if (!data.value.user) {
      return {
        authenticated: data.value.authenticated,
        user: null,
      };
    }

    return {
      authenticated: data.value.authenticated,
      user: {
        ...data.value.user,
        zohoSubscribedAt: parseApiDate(data.value.user.zohoSubscribedAt),
        deletedAt: parseApiDate(data.value.user.deletedAt),
      },
    };
  });

  const isSignedIn = computed(() => me.value?.authenticated === true);
  const isSignedOut = computed(() => me.value?.authenticated === false);
  const displayName = computed(
    () => me.value?.user?.name || me.value?.user?.email || 'Account',
  );

  return {
    me,
    pending,
    refresh,
    error,
    isSignedIn,
    isSignedOut,
    displayName,
  };
};
