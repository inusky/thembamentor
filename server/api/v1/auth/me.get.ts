export default defineEventHandler(async (event) => {
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();

  if (!session?.user) {
    // Not logged in
    return { authenticated: false, user: null };
  }

  // Logged in
  return {
    authenticated: true,
    user: session.user,
  };
});
