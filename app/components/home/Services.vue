<template>
  <section id="services" class="section">
    <div class="container">
      <h2 class="title">What we help you with</h2>
      <p class="lead">
        Clear services, clear outcomes. Choose what you need and grow from
        there.
      </p>

      <div class="grid">
        <article class="card">
          <h3>🎯 Admissions Guidance</h3>
          <p>
            Shortlisting, positioning, SOP pointers, and interview readiness.
          </p>
        </article>

        <article class="card">
          <h3>📘 Academic Mentorship</h3>
          <p>Subjects, projects, case studies, and exam support.</p>
        </article>

        <article class="card">
          <h3>💼 Career Support</h3>
          <p>
            Resume, internships, placements, interview practice, confidence.
          </p>
        </article>

        <article class="card">
          <h3>🧭 Specialization Clarity</h3>
          <p>
            Marketing, Finance, HR, Ops, Analytics—make the right choice early.
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/scss/config/mixin' as *;

.title {
  font-size: var(--h2);
  margin: 0 0 1rem;
}
.lead {
  color: var(--muted);
  margin: 0 0 var(--s2);
  max-width: 70ch;
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
}

.card {
  @include glass;
  padding: 1.1rem;
}
.card h3 {
  margin: 0 0 0.5rem;
}
.card p {
  margin: 0;
  color: var(--muted);
}
</style>
