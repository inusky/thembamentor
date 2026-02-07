<template>
  <footer class="footer">
    <div class="container footer__grid">
      <!-- Brand -->
      <div class="footer__brand">
        <div class="footer__logo">🎓 The MBA Mentor</div>
        <p class="footer__tag">
          Admissions, academics, and career mentorship for MBA aspirants and
          students.
        </p>

        <div class="footer__contact">
          <a class="footer__link" href="mailto:info@thembamentor.in"
            >info@thembamentor.in</a
          >
          <span class="footer__sep">•</span>
          <a class="footer__link" href="/contact">Contact</a>
        </div>
      </div>

      <!-- Links -->
      <nav class="footer__col" aria-label="Footer navigation">
        <h4 class="footer__title">Company</h4>
        <NuxtLink class="footer__link" to="/about">About</NuxtLink>
        <NuxtLink class="footer__link" to="/contact">Contact</NuxtLink>
        <NuxtLink class="footer__link" to="/privacy-policy"
          >Privacy Policy</NuxtLink
        >
        <NuxtLink class="footer__link" to="/terms">Terms & Conditions</NuxtLink>
      </nav>

      <div class="footer__col">
        <h4 class="footer__title">Services</h4>
        <a class="footer__link" href="/#services">Admissions Guidance</a>
        <a class="footer__link" href="/#services">Academic Mentorship</a>
        <a class="footer__link" href="/#services">Career Support</a>
        <a class="footer__link" href="/#services">Specialization Clarity</a>
      </div>

      <!-- CTA -->
      <div class="footer__cta">
        <div class="footer__ctaBox">
          <div class="footer__ctaTitle">Need help choosing your MBA path?</div>
          <div class="footer__ctaText">
            Book a consultation and get a clear next-step plan.
          </div>
          <div class="footer__ctaActions">
            <NuxtLink class="btn primary" to="/contact"
              >Book Consultation</NuxtLink
            >
            <a class="btn" href="mailto:info@thembamentor.in">Email Us</a>
          </div>
        </div>
      </div>
    </div>

    <div class="container footer__bottom">
      <small class="footer__copy">
        © {{ year }} The MBA Mentor. All rights reserved.
      </small>

      <div class="footer__mini">
        <NuxtLink class="footer__miniLink" to="/privacy-policy"
          >Privacy</NuxtLink
        >
        <span class="footer__sep">•</span>
        <NuxtLink class="footer__miniLink" to="/terms">Terms</NuxtLink>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<style scoped lang="scss">
@use '../assets/scss/config/mixin' as *;
@use '../assets/scss/config/variables' as *;

.footer {
  padding-top: 3rem;
  border-top: 1px solid var(--border);
  background:
    /* LEFT light */
    radial-gradient(
      900px 420px at 15% 20%,
      rgba(90, 140, 255, 0.14),
      transparent 60%
    ),
    /* RIGHT light — MIRRORED */
    radial-gradient(
        900px 420px at 85% 20%,
        rgba(90, 140, 255, 0.14),
        transparent 60%
      ),
    /* base */
    linear-gradient(180deg, #0f172a 0%, #0b1220 55%, #0c1324 80%, #0f172a 100%);
}

.footer__grid {
  display: grid;
  gap: 1.2rem;
  align-items: start;

  /* ⭐ auto wraps (no media query needed) */
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
}

.footer__brand {
  max-width: 46ch;
}

.footer__logo {
  font-weight: 800;
  letter-spacing: -0.01em;
}

.footer__tag {
  margin: 0.55rem 0 1rem;
  color: var(--muted);
  font-size: 0.98rem;
}

.footer__contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.footer__col {
  display: grid;
  gap: 0.55rem;
}

.footer__title {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.92);
}

.footer__link {
  color: var(--muted);
  transition:
    color 0.15s ease,
    transform 0.15s ease;
  width: fit-content;

  &:hover {
    color: $blue-700;
  }
}

.footer__ctaBox {
  @include glass;
  padding: 1.1rem;
}

.footer__ctaTitle {
  font-weight: 800;
  margin-bottom: 0.3rem;
}

.footer__ctaText {
  color: var(--muted);
  margin-bottom: 0.9rem;
}

.footer__ctaActions {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;

  &:hover {
    color: $blue-700;
  }
}

/* bottom row */
.footer__bottom {
  margin-top: 1.6rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
}

.footer__copy {
  color: var(--muted);
}

.footer__mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer__miniLink {
  color: var(--muted);

  &:hover {
    color: $blue-700;
  }
}

.footer__sep {
  color: rgba(255, 255, 255, 0.25);
}
</style>
