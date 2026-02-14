<template>
  <section class="section thank-you">
    <div class="container thank-you__content">
      <h1>Thank you!</h1>
      <template v-if="isLeadSource">
        <p>We've received your details.</p>
        <p>Please check your email to confirm.</p>
        <p class="thank-you__note">If you don't see it, check Spam/Promotions.</p>
      </template>
      <p v-else>Thank you! Our team will contact you shortly.</p>
      <NuxtLink class="btn primary" to="/">
        Back to Home
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const route = useRoute();
const isLeadSource = computed(() => route.query.source === 'lead');
</script>

<style scoped lang="scss">
.thank-you {
  padding-block: clamp(4rem, 10vw, 6rem);
}

.thank-you__content {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.thank-you__content h1 {
  margin: 0 0 0.6rem;
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  color: #0f172a;
}

.thank-you__content p {
  margin: 0 0 0.55rem;
  color: #475569;
}

.thank-you__note {
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
  color: #64748b;
}
</style>
