<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1>Sign in</h1>

      <label>Email</label>
      <input type="email" placeholder="Email" v-model="email" />

      <p class="terms">
        By continuing, you agree to the
        <a href="#">Self Service PSS</a> and <a href="#">Privacy Policy</a>.
      </p>

      <button class="primary" @click="continueWithEmail">Continue</button>

      <div class="divider">
        <span>OR</span>
      </div>

      <button class="oauth google" @click="continueWithGoogle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.34 1.22 8.69 3.22l6.47-6.47C35.2 2.58 30.1 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.55 5.86C12.1 12.09 17.57 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.1 24.5c0-1.64-.15-3.21-.42-4.73H24v9.46h12.4c-.54 2.88-2.15 5.32-4.57 6.95l7.19 5.58c4.2-3.88 6.08-9.6 6.08-17.26z"
          />
          <path
            fill="#FBBC05"
            d="M10.11 28.08c-.54-1.62-.85-3.35-.85-5.08s.31-3.46.85-5.08l-7.55-5.86C.92 15.64 0 19.72 0 24s.92 8.36 2.56 11.94l7.55-5.86z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.1 0 11.2-2.01 14.93-5.47l-7.19-5.58c-2 1.35-4.57 2.15-7.74 2.15-6.43 0-11.9-2.59-13.89-9.58l-7.55 5.86C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        Continue with Google
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');

const redirectToAuth0 = (params: Record<string, string>) => {
  const qs = new URLSearchParams({
    returnTo: '/', // default
    ...params,
  });
  window.location.href = `/auth/login?${qs.toString()}`;
};

const continueWithEmail = () => {
  const value = email.value.trim();
  if (!value) return;

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (!isValid) return alert('Please enter a valid email address.');

  redirectToAuth0({
    connection: 'Username-Password-Authentication',
    login_hint: value,
  });
};

const continueWithGoogle = () => {
  redirectToAuth0({
    connection: 'google-oauth2',
  });
};
</script>

<style scoped lang="scss">
@use '../../assets/scss/components/auth' as *;
</style>
