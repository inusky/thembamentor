<template>
  <section class="section">
    <div class="container wrap">
      <div class="left">
        <h2 class="title">Why students trust The MBA Mentor</h2>
        <p class="lead">
          We focus on structure, execution, and honest guidance — so your MBA
          journey becomes simpler.
        </p>
      </div>

      <div class="right">
        <div class="pill">✔ Student-first approach</div>
        <div class="pill">✔ Clear roadmap + action steps</div>
        <div class="pill">✔ Transparent and ethical guidance</div>
        <div class="pill">✔ Practical academic + career focus</div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/scss/config/mixin' as *;

.wrap {
  display: grid;
  gap: 2rem;
  align-items: start;
  grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr));
}

.title {
  font-size: var(--h2);
  margin: 0 0 0.4rem;
}
.lead {
  color: var(--muted);
  margin: 0;
  max-width: 70ch;
}

.right {
  display: grid;
  gap: 0.75rem;
}

.pill {
  @include glass;
  padding: 0.9rem 1rem;
  border-radius: 999px;
}
</style>
