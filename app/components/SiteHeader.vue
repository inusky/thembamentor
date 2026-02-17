<template>
  <header class="header">
    <div class="title-nav">
      <NuxtLink to="/">
        <div class="title-sel">
          <h1>The MBA Mentor</h1>
        </div>
      </NuxtLink>

      <button
        class="nav-toggle"
        type="button"
        :aria-expanded="isMenuOpen"
        :aria-controls="menuId"
        aria-label="Toggle navigation menu"
        @click="toggleMenu"
      >
        <span class="nav-toggle__label">Menu</span>
        <span class="nav-toggle__bar" aria-hidden="true" />
      </button>
    </div>

    <div :id="menuId" class="header__links" :class="{ 'is-open': isMenuOpen }">
      <nav class="nav-links" aria-label="Primary navigation">
        <NuxtLink to="/blogs" @click="closeMenu">Blogs</NuxtLink>
      </nav>

      <nav v-if="isSignedOut" class="user-links user-links--auth user-links--sign-in">
        <NuxtLink to="/auth/sign-in" @click="closeMenu">Sign in</NuxtLink>
      </nav>

      <nav v-else-if="isSignedIn" class="user-links user-links--auth">
        <span class="user-links__avatar" :title="displayName">
          <img
            v-if="me?.user?.imageUrl"
            :src="me.user.imageUrl"
            alt=""
            loading="lazy"
          />
          <svg
            v-else
            class="user-links__icon"
            viewBox="0 0 24 24"
            role="img"
            aria-label="User"
          >
            <path
              d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5z"
            />
          </svg>
        </span>
        <a href="/auth/logout" @click="closeMenu">Sign out</a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const isMenuOpen = ref(false);
const menuId = 'site-header-links';
const route = useRoute();
const { isSignedIn, isSignedOut, displayName, me } = useAuthState();

const closeMenu = () => {
  isMenuOpen.value = false;
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

watch(
  () => route.fullPath,
  () => {
    closeMenu();
  },
);
</script>

<style scoped lang="scss">
@use '../assets/scss/components/header' as *;
</style>
