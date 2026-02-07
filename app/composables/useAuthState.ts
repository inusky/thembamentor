interface AuthMeResponse {
  authenticated: boolean;
  user: {
    id: string;
    auth0Id: string;
    email: string | null;
    name: string | null;
    imageUrl: string | null;
    deletedAt: Date | null;
  } | null;
}

export const useAuthState = () => {
  const { data, pending, refresh, error } = useFetch<AuthMeResponse>(
    '/api/v1/auth/me',
    {
      key: 'auth-me',
    },
  );

  const isSignedIn = computed(() => data.value?.authenticated === true);
  const isSignedOut = computed(() => data.value?.authenticated === false);
  const displayName = computed(
    () => data.value?.user?.name || data.value?.user?.email || 'Account',
  );

  return {
    me: data,
    pending,
    refresh,
    error,
    isSignedIn,
    isSignedOut,
    displayName,
  };
};
