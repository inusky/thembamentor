<script setup lang="ts">
const props = defineProps<{ error: any }>();
</script>

<template>
  <main
    style="
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      text-align: center;
    "
  >
    <div style="max-width: 520px">
      <h1 style="font-size: 40px; margin: 0 0 12px">We’re fixing something</h1>
      <p style="opacity: 0.8; line-height: 1.6; margin: 0 0 18px">
        The MBA Mentor is temporarily unavailable. Please try again in a few
        minutes.
      </p>

      <button
        style="
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #ccc;
          cursor: pointer;
        "
        @click="clearError({ redirect: '/' })"
      >
        Go Home
      </button>
    </div>
  </main>
</template>
