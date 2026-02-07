<template>
  <main class="legal">
    <div class="legal__wrap">
      <section class="legal__card">
        <h1 class="legal__title">Privacy Policy</h1>
        <p class="legal__meta">
          Effective Date: {{ effectiveDate }} • Last Updated: {{ lastUpdated }}
        </p>

        <p>
          The MBA Mentor (“we”, “our”, “us”) respects your privacy. This Privacy
          Policy explains how we collect, use, disclose, and protect your
          information when you visit our website, fill out forms, or use our
          mentorship services.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul>
          <li>
            <strong>Personal details:</strong> name, email address, phone
            number.
          </li>
          <li>
            <strong>Education/career details (optional):</strong> college,
            course, goals, resume info you share.
          </li>
          <li>
            <strong>Technical data:</strong> device type, browser, pages visited
            (via analytics/cookies).
          </li>
          <li>
            <strong>Communication data:</strong> messages or queries you send to
            us.
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide mentorship, counselling, and support services.</li>
          <li>Respond to your queries and communicate service updates.</li>
          <li>
            Send emails/notifications (only when you opt in or when required for
            service delivery).
          </li>
          <li>Improve website performance, content, and user experience.</li>
          <li>
            Maintain safety, prevent misuse, and comply with legal obligations.
          </li>
        </ul>

        <h2>3. Email Communication</h2>
        <p>
          If you subscribe to our mailing list, we may send emails related to
          MBA guidance, offers, or updates. You can unsubscribe anytime using
          the link provided in the email, or by contacting us.
        </p>

        <h2>4. Cookies & Analytics</h2>
        <p>
          We may use cookies and analytics tools to understand how users
          interact with our website. You can control cookies through your
          browser settings. Disabling cookies may affect some website features.
        </p>

        <h2>5. Sharing of Information</h2>
        <p>
          We do not sell your personal information. We may share limited
          information with:
        </p>
        <ul>
          <li>
            <strong>Service providers</strong> (e.g., email delivery, analytics)
            only to operate our services.
          </li>
          <li>
            <strong>Legal authorities</strong> if required by law or to protect
            rights and safety.
          </li>
        </ul>

        <h2>6. Data Security</h2>
        <p>
          We use reasonable administrative and technical measures to protect
          your information. However, no system can be guaranteed 100% secure.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain data only as long as necessary for service delivery, legal
          compliance, and legitimate business needs. You may request deletion
          where applicable.
        </p>

        <h2>8. Your Rights</h2>
        <p>You may request to:</p>
        <ul>
          <li>Access or correct your personal data.</li>
          <li>Withdraw consent for marketing communications.</li>
          <li>
            Request deletion of your data (subject to legal requirements).
          </li>
        </ul>

        <h2>9. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We are not
          responsible for their privacy practices. Please review their policies
          separately.
        </p>

        <h2>10. Updates to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Updates will be
          posted on this page with the revised date.
        </p>

        <h2>11. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, contact us at:</p>
        <ul>
          <li>
            <strong>Email:</strong>
            <a href="mailto:info@thembamentor.in">info@thembamentor.in</a>
          </li>
          <li><strong>Company:</strong> The MBA Mentor</li>
          <li><strong>Website:</strong> thembamentor.in</li>
        </ul>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
const effectiveDate = '07 Feb 2026';
const lastUpdated = '07 Feb 2026';
</script>

<style scoped lang="scss">
@use '../assets/scss/components/privacy-terms' as *;
</style>
