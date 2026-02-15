<template>
  <section class="section lead-register" aria-labelledby="lead-register-title">
    <div class="container lead-register__wrap">
      <div class="lead-register__copy">
        <h2 id="lead-register-title">
          Your MBA.
          <br />
          Guided by Experts.
        </h2>
        <p>
          Get personalized admission guidance, fee clarity, and AI-powered
          curriculum insights.
        </p>
        <ul class="lead-register__credibility" aria-label="Credibility points">
          <li>AI-Integrated MBA Curriculum</li>
          <li>Flexible Weekend &amp; Online Format</li>
          <li>Dedicated Admission Mentor</li>
        </ul>
      </div>

      <form class="lead-register__form" @submit.prevent="submitLead">
        <label for="lead-name">Full Name</label>
        <input
          id="lead-name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          required
          maxlength="120"
          placeholder="Enter your full name"
          :aria-invalid="invalidName ? 'true' : 'false'"
          :aria-describedby="invalidName ? 'lead-form-message' : undefined"
        />

        <label for="lead-email">Email Address</label>
        <p
          id="lead-email-help"
          class="lead-register__helper lead-register__helper--email"
        >
          We'll email you a confirmation link.
        </p>
        <input
          id="lead-email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          maxlength="254"
          placeholder="you@example.com"
          :aria-invalid="invalidEmail ? 'true' : 'false'"
          :aria-describedby="
            invalidEmail
              ? 'lead-email-help lead-form-message'
              : 'lead-email-help'
          "
        />

        <label for="lead-phone">
          Mobile Number
          <span class="lead-register__label-meta">(Recommended)</span>
        </label>
        <p class="lead-register__helper">For priority admission guidance.</p>
        <input
          id="lead-phone"
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          maxlength="40"
          placeholder="10-digit number"
          :aria-invalid="invalidPhone ? 'true' : 'false'"
          :aria-describedby="invalidPhone ? 'lead-form-message' : undefined"
        />

        <div class="lead-register__honeypot" aria-hidden="true">
          <label for="lead-hp">Website</label>
          <input
            id="lead-hp"
            v-model="form.hp"
            type="text"
            tabindex="-1"
            autocomplete="off"
          />
        </div>

        <button class="btn primary" type="submit" :disabled="pending">
          {{ pending ? 'Submitting...' : 'Get My Personalized MBA Plan' }}
        </button>
        <p class="lead-register__trust">
          🔒 100% Confidential. No spam. Direct admission support.
        </p>

        <p
          id="lead-form-message"
          class="lead-register__message"
          :class="message ? 'lead-register__message--error' : undefined"
          role="status"
          aria-live="polite"
        >
          {{ message }}
        </p>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

type LeadResponse = {
  ok?: boolean;
};

const form = reactive({
  name: '',
  email: '',
  phone: '',
  hp: '',
});

const pending = ref(false);
const message = ref('');
const invalidName = ref(false);
const invalidEmail = ref(false);
const invalidPhone = ref(false);

function isValidName(name: string) {
  return name.trim().length >= 2;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string) {
  const value = phone.trim();
  if (!value) return true;
  if (!/^[+\d\s]+$/.test(value)) return false;

  const digitCount = value.replace(/\D/g, '').length;
  return digitCount >= 7 && digitCount <= 15;
}

async function submitLead() {
  if (pending.value) return;

  const normalizedName = form.name.trim();
  const normalizedEmail = form.email.trim();
  const normalizedPhone = form.phone.trim();

  message.value = '';
  invalidName.value = !isValidName(normalizedName);
  invalidEmail.value = !isValidEmail(normalizedEmail);
  invalidPhone.value = !isValidPhone(normalizedPhone);

  if (invalidName.value || invalidEmail.value || invalidPhone.value) {
    message.value = 'Please enter your name and a valid email.';
    return;
  }

  pending.value = true;

  try {
    const response = await $fetch<LeadResponse>('/api/v1/lead', {
      method: 'POST',
      body: {
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        hp: form.hp,
      },
    });

    if (response?.ok) {
      const go = () => window.location.assign('/thank-you?source=lead');

      // @ts-ignore
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        let redirected = false;

        // @ts-ignore
        window.gtag?.('event', 'generate_lead', {
          form_name: 'mba_admission_form',
          value: 1,
          currency: 'INR',
          event_callback: () => {
            if (redirected) return;
            redirected = true;
            go();
          },
        });

        setTimeout(() => {
          if (redirected) return;
          redirected = true;
          go();
        }, 800);

        return;
      }

      go();
      return;
    }

    message.value = 'We couldn\u2019t submit right now. Please try again.';
  } catch {
    message.value = 'We couldn\u2019t submit right now. Please try again.';
  } finally {
    pending.value = false;
  }
}
</script>

<style scoped lang="scss">
.lead-register {
  position: relative;
  overflow: hidden;
  padding-block: clamp(2.2rem, 6vw, 4.2rem);
  border-radius: 24px;
  background:
    radial-gradient(
      circle at 15% 40%,
      rgba(59, 130, 246, 0.08) 0%,
      rgba(59, 130, 246, 0) 55%
    ),
    radial-gradient(
      circle at 86% 14%,
      rgba(30, 64, 175, 0.06) 0%,
      rgba(30, 64, 175, 0) 58%
    ),
    linear-gradient(145deg, #f8fafc 0%, #f3f6fc 48%, #eef2ff 100%);
}

.lead-register__wrap {
  display: grid;
  gap: clamp(0.95rem, 2vw, 1.45rem);
  width: 100%;
  max-width: 1120px;
  margin-inline: auto;
  padding: clamp(1.25rem, 2.8vw, 2.3rem);
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  align-items: stretch;
}

.lead-register__copy {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.lead-register__copy h2 {
  margin: 0 0 0.65rem;
  max-width: 18ch;
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  font-weight: 720;
  line-height: 1.16;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.lead-register__copy p {
  margin: 0;
  max-width: 52ch;
  font-size: 1rem;
  line-height: 1.62;
  color: #475569;
}

.lead-register__credibility {
  list-style: none;
  margin: 0.94rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.54rem;
}

.lead-register__credibility li {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding-left: 1.3rem;
  font-size: 0.89rem;
  line-height: 1.44;
  font-weight: 550;
  letter-spacing: 0.01em;
  color: #334155;
}

.lead-register__credibility li::before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 0.24rem;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.5rem;
  font-weight: 700;
  color: #475569;
  background: rgba(100, 116, 139, 0.16);
}

.lead-register__form {
  display: grid;
  gap: 0.38rem;
  align-content: start;
  align-self: center;
  margin-top: 0.18rem;
  width: 100%;
  max-width: 520px;
  justify-self: end;
  padding: clamp(1.05rem, 2.1vw, 1.35rem);
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: #ffffff;
  box-shadow:
    0 25px 60px rgba(15, 23, 42, 0.08),
    0 10px 24px rgba(15, 23, 42, 0.05);
}

.lead-register__form label {
  margin-top: 0.16rem;
  font-size: 0.82rem;
  font-weight: 620;
  letter-spacing: 0.02em;
  color: #334155;
}

.lead-register__label-meta {
  font-size: 0.84em;
  font-weight: 560;
  opacity: 0.66;
}

.lead-register__form input + label {
  margin-top: 0.44rem;
}

.lead-register__helper {
  margin: -0.03rem 0 0.1rem;
  font-size: 0.74rem;
  line-height: 1.35;
  color: #64748b;
}

.lead-register__helper--email {
  margin: -0.03rem 0 0.08rem;
}

.lead-register__form input {
  width: 100%;
  border: 1px solid #cfd8e3;
  border-radius: 10px;
  padding: 0.7rem 0.85rem;
  background: #f8fafc;
  color: #111827;
  outline: none;
  box-shadow: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.lead-register__form input::placeholder {
  color: #94a3b8;
}

.lead-register__form input:hover {
  border-color: #b8c5d6;
}

.lead-register__form input:focus,
.lead-register__form input:focus-visible {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.lead-register__form .btn {
  margin-top: 0.34rem;
  transition:
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease;
  will-change: transform;
}

.lead-register__form .btn.primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

.lead-register__form .btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #1e40af;
  border-color: #1e40af;
  box-shadow: 0 14px 26px -18px rgba(30, 64, 175, 0.72);
}

.lead-register__form .btn:not(.primary):hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px -16px rgba(15, 23, 42, 0.45);
}

.lead-register__form .btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 7px 14px -12px rgba(15, 23, 42, 0.4);
}

.lead-register__trust {
  margin: 0.08rem 0 0.2rem;
  font-size: 0.74rem;
  line-height: 1.35;
  color: #64748b;
}

.lead-register__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.lead-register__message {
  margin: 0.25rem 0 0;
  min-height: 1.35rem;
  font-size: 0.95rem;
}

.lead-register__message--success {
  color: #22c55e;
}

.lead-register__message--error {
  color: #f97316;
}

@media (max-width: 900px) {
  .lead-register {
    border-radius: 20px;
    padding-block: clamp(1.9rem, 6vw, 2.9rem);
  }

  .lead-register__wrap {
    gap: 1.2rem;
    padding: clamp(1rem, 4vw, 1.35rem);
    grid-template-columns: 1fr;
  }

  .lead-register__copy {
    justify-content: flex-start;
  }

  .lead-register__form {
    align-self: stretch;
    justify-self: stretch;
    margin-top: 0;
    max-width: 100%;
    padding: 1rem;
  }
}
</style>
