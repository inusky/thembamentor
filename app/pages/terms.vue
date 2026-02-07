<template>
  <main class="legal">
    <div class="legal__wrap">
      <section class="legal__card">
        <h1 class="legal__title">Terms & Conditions</h1>
        <p class="legal__meta">
          Effective Date: {{ effectiveDate }} • Last Updated: {{ lastUpdated }}
        </p>

        <p>
          These Terms & Conditions (“Terms”) govern your access to and use of
          The MBA Mentor website and services. By using our website or services,
          you agree to these Terms.
        </p>

        <h2>1. Services</h2>
        <p>
          The MBA Mentor provides mentorship, counselling, academic support, and
          career guidance for MBA aspirants and students. Services may be
          delivered via calls, messages, video sessions, workshops, or other
          formats.
        </p>

        <h2>2. User Responsibilities</h2>
        <p>You agree to:</p>
        <ul>
          <li>Provide accurate information when contacting or enrolling.</li>
          <li>Use the website and services lawfully and respectfully.</li>
          <li>
            Not misuse, copy, or distribute our content without permission.
          </li>
        </ul>

        <h2>3. Payments, Fees & Refunds</h2>
        <p>
          If a paid service is offered, the fee, inclusions, and timelines will
          be shared before confirmation. Refunds, if applicable, will be
          communicated in writing for each program/service.
        </p>

        <h2>4. No Guarantee / Disclaimer</h2>
        <p>
          We provide guidance based on experience and available information.
          Outcomes such as admissions, grades, placements, or salaries depend on
          many factors outside our control. We do not guarantee specific
          results.
        </p>

        <h2>5. Intellectual Property</h2>
        <p>
          All content, materials, branding, and resources on this website are
          the intellectual property of The MBA Mentor, unless stated otherwise.
          You may not reproduce or redistribute without written permission.
        </p>

        <h2>6. Prohibited Activities</h2>
        <p>You must not:</p>
        <ul>
          <li>Attempt to hack, disrupt, or reverse engineer the website.</li>
          <li>Upload malware, spam, or abusive content.</li>
          <li>Use our brand name for misleading promotions.</li>
        </ul>

        <h2>7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, The MBA Mentor will not be
          liable for any indirect, incidental, or consequential damages arising
          from your use of the website or services.
        </p>

        <h2>8. Termination</h2>
        <p>
          We may suspend or terminate access if these Terms are violated or if
          misuse is detected.
        </p>

        <h2>9. Third-Party Tools</h2>
        <p>
          We may use third-party services (such as email platforms or
          analytics). Their terms and policies may apply.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. Updates will be posted on
          this page with the revised date.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of India. Any disputes will be
          subject to the jurisdiction of the relevant courts.
        </p>

        <h2>12. Contact</h2>
        <p>For questions regarding these Terms, contact:</p>
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
