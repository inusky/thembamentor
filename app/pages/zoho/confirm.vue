<template>
  <main class="confirm">
    <h1>Almost there!</h1>

    <p class="primary">We’ve sent a confirmation email to your inbox.</p>

    <p class="secondary">
      Please open the email and click the confirmation link to complete your
      subscription.
    </p>

    <p class="hint">Didn’t receive it? Check your spam or promotions folder.</p>
  </main>
</template>

<style scoped>
.confirm {
  min-height: 70vh;
  max-width: 520px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.primary {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.secondary {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1.25rem;
}

.hint {
  font-size: 0.9rem;
  color: #888;
}
</style>
