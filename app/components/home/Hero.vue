<template>
  <section class="section hero">
    <div class="container hero__grid">
      <div class="hero__left">
        <div class="badge">🎓 The MBA Mentor</div>

        <h1 class="hero__title">
          MBA Guidance that feels clear, structured, and personal.
        </h1>

        <p class="hero__subtitle">
          Admissions, academics, and career support — designed for MBA aspirants
          and students who want real mentorship, not generic advice.
        </p>

        <div class="hero__actions">
          <a class="btn primary" href="#cta">Get Mentorship</a>
          <a class="btn" href="#services">Explore Services</a>
        </div>

        <div class="hero__meta">
          <div class="meta">
            <div class="meta__k">1:1 Mentorship</div>
            <div class="meta__v">Personal roadmap</div>
          </div>
          <div class="meta">
            <div class="meta__k">Academic Support</div>
            <div class="meta__v">Projects + exams</div>
          </div>
          <div class="meta">
            <div class="meta__k">Career Prep</div>
            <div class="meta__v">Resume + interview</div>
          </div>
        </div>
      </div>

      <div class="hero__right">
        <div class="mock">
          <div class="mock__top">
            <span class="dot"></span><span class="dot"></span
            ><span class="dot"></span>
          </div>
          <div class="mock__body">
            <div class="card">
              <div class="card__title">Your MBA Roadmap</div>
              <ul class="card__list">
                <li>✅ Goal clarity</li>
                <li>✅ College shortlist</li>
                <li>✅ Profile building</li>
                <li>✅ Interview prep</li>
              </ul>
            </div>

            <div class="card alt">
              <div class="card__title">Weekly Mentorship</div>
              <p class="card__p">
                Short, focused calls with tasks you can actually execute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/scss/config/mixin' as *;

.hero {
  padding-top: clamp(2.5rem, 6vw, 5rem);
}

.hero__grid {
  display: grid;
  gap: 5rem;
  align-items: center;

  /* ⭐ No media query needed: auto stacks on small screens */
  grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr));
}

.hero__title {
  font-size: var(--h1);
  line-height: 1.12;
  margin: var(--s1) 0 var(--s0);
  letter-spacing: -0.02em;
  margin: 1rem 0;
}

.hero__subtitle {
  font-size: var(--p);
  color: var(--muted);
  margin: 0 0 var(--s1);
  max-width: 60ch;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin: 1.1rem 0 1.4rem;
}

.hero__meta {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.meta {
  @include glass;
  padding: 0.9rem 1rem;
}
.meta__k {
  font-weight: 600;
}
.meta__v {
  color: var(--muted);
  font-size: 0.95rem;
}

.mock {
  @include glass;
  overflow: hidden;
}
.mock__top {
  display: flex;
  gap: 0.4rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}
.mock__body {
  padding: 1rem;
  display: grid;
  gap: 1rem;
}
.card {
  @include glass;
  padding: 1rem;
}
.card__title {
  font-weight: 700;
  margin-bottom: 0.6rem;
}
.card__list {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--muted);
}
.card.alt .card__p {
  margin: 0;
  color: var(--muted);
}
</style>
