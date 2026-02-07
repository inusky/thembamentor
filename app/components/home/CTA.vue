<template>
  <section id="cta" class="section">
    <div class="container cta">
      <div>
        <h2 class="title">Ready to make your MBA journey easier?</h2>
        <p class="lead">
          Share your goal. We’ll suggest the best next step within 24–48 hours.
        </p>
      </div>

      <div class="actions">
        <a class="btn primary" href="/contact">Book a Consultation</a>
        <a class="btn" href="mailto:info@thembamentor.in">Email Us</a>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/scss/config/mixin' as *;

.cta {
  @include glass;
  padding: clamp(1.2rem, 3vw, 2rem);
  display: grid;
  gap: 1rem;
  align-items: center;
  grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr));
}

.title {
  font-size: var(--h2);
  margin: 0 0 0.4rem;
}
.lead {
  color: var(--muted);
  margin: 0;
}

.actions {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: flex-start;
}
</style>
