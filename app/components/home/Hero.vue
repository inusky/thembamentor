<template>
  <section class="section hero">
    <div class="container hero__grid">
      <div class="hero__left">
        <h1 class="hero__title">Learning that inspires thinking, expression, and purpose.</h1>

        <div class="hero__list">
          <div class="hero__kicker">A space where...</div>

          <ul class="list">
            <li class="list__item">
              <span class="list__icon" aria-hidden="true">💡</span>
              <span class="list__text">curiosity expressed</span>
            </li>
            <li class="list__item">
              <span class="list__icon" aria-hidden="true">✨</span>
              <span class="list__text">ideas made clear</span>
            </li>
            <li class="list__item">
              <span class="list__icon" aria-hidden="true">🎯</span>
              <span class="list__text">learning with purpose</span>
            </li>
          </ul>

          <p class="hero__note">
            ... nurturing curiosity with clarity and confidence for every learner.
          </p>
        </div>
      </div>

      <div class="hero__right">
        <div class="hero__rightInner">
          <div class="hero__art" aria-hidden="true">
            <!-- Lightweight inline illustration (no asset needed) -->
            <svg
              class="art"
              viewBox="0 0 640 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="g1" x1="140" y1="60" x2="420" y2="360" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#3B82F6" />
                  <stop offset="1" stop-color="#FB7185" />
                </linearGradient>
                <linearGradient id="g2" x1="220" y1="80" x2="520" y2="360" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#22C55E" />
                  <stop offset="1" stop-color="#60A5FA" />
                </linearGradient>
              </defs>

              <!-- soft circles -->
              <circle cx="520" cy="90" r="54" fill="#93C5FD" />
              <circle cx="585" cy="145" r="38" fill="#A7F3D0" />
              <circle cx="470" cy="150" r="34" fill="#FBCFE8" />

              <!-- abstract device/book stack -->
              <path
                d="M260 320c0-42 34-76 76-76h150c42 0 76 34 76 76v10H260v-10Z"
                fill="url(#g1)"
              />
              <path
                d="M280 312c0-30 24-54 54-54h156c30 0 54 24 54 54v28H280v-28Z"
                fill="url(#g2)"
              />
              <rect x="308" y="150" width="148" height="96" rx="18" fill="#94A3B8" />
              <path
                d="M330 220c22-18 44-18 66 0 22 18 44 18 66 0"
                stroke="#64748B"
                stroke-width="10"
                stroke-linecap="round"
              />

              <!-- orbit scribble -->
              <path
                d="M420 170c-36 16-64 40-84 68-20 28-30 58-28 84"
                stroke="#FB7185"
                stroke-width="7"
                stroke-linecap="round"
              />
              <path
                d="M448 156c-40 20-72 48-96 82-24 34-36 70-34 100"
                stroke="#F97316"
                stroke-width="6"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/scss/config/mixin' as *;
@use '../../assets/scss/config/variables' as *;

.hero {
  /* Set --hero-bg-image: url('/path/to/image.jpg') when the asset is ready. */
  --hero-bg-image: url('/hero-bg-dummy.svg');
  --hero-bg-position: center bottom;
  --hero-bg-size: auto;
  --hero-bg-opacity: 0.1;

  padding-top: clamp(3rem, 8vw, 6rem);
  padding-bottom: clamp(3rem, 8vw, 6rem);
  background-color: #ffffff;
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--hero-bg-image);
  background-position: var(--hero-bg-position);
  background-size: var(--hero-bg-size);
  background-repeat: no-repeat;
  opacity: var(--hero-bg-opacity);
  z-index: 0;
  pointer-events: none;
}

.hero__grid {
  display: grid;
  align-items: center;
  min-height: clamp(24rem, 58vh, 36rem);
  gap: clamp(2rem, 5vw, 5rem);
  grid-template-columns: repeat(auto-fit, minmax(min(440px, 100%), 1fr));
  justify-items: center; /* horizontally center grid children */
  position: relative;
  z-index: 1;
}

.hero__left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.hero__title {
  font-size: clamp(2.1rem, 3.6vw, 3.4rem);
  letter-spacing: -0.02em;
  margin: 0 0 1.2rem;
  color: #111827;
  max-width: 18ch;
}

.hero__kicker {
  color: #2563eb;
  margin-bottom: 0.6rem;
}

.hero__note {
  margin: 0.7rem 0 0;
  color: #2563eb;
}

.list {
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

.list__item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  justify-content: flex-start;
  color: #f97316;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.hero__right {
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.hero__rightInner {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* vertical centering within right column */
  gap: 1.25rem;
}

.hero__art {
  width: min(520px, 100%);
  position: relative;
  z-index: 2;
  opacity: 1;
}

.art {
  width: 100%;
  height: auto;
  display: block;
  opacity: 1;
}

/* keep your existing `.btn` look, but tune it for light hero */
:deep(.btn) {
  border-color: rgba(17, 24, 39, 0.12);
  background: rgba(17, 24, 39, 0.04);
  color: #111827;
}
:deep(.btn:hover) {
  background: rgba(17, 24, 39, 0.06);
}
:deep(.btn.primary) {
  background: #2563eb;
  color: #ffffff;
}

.hero__cta {
  padding: 0.95rem 1.25rem;
}
</style>
