import React, { useEffect } from "react";
import { useAppContext } from "./AppContext";

export function PrivacyPage() {
  const { setView } = useAppContext();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const navHome = (e) => {
    if (e) e.preventDefault();
    setView("landing");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <a
          href="/"
          onClick={navHome}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-6"
          data-testid="link-privacy-back"
        >
          ← Back to home
        </a>

        <article className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 sm:px-10 py-10 text-slate-700 leading-relaxed">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Singer Search — Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-1"><strong>Effective Date:</strong> June 1, 2026</p>
          <p className="text-sm text-slate-500 mb-8"><strong>Last Updated:</strong> June 1, 2026</p>
          <hr className="border-slate-200 mb-8" />

          <Section title="1. Introduction">
            <p>Singer Search ("we," "us," or "our") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use the Singer Search platform ("Platform").</p>
            <p>Please read this policy carefully. By using the Platform, you agree to the practices described here. If you do not agree, please discontinue use.</p>
          </Section>

          <Section title="2. Information We Collect">
            <SubSection title="2.1 Information You Provide Directly">
              <p><strong>All Users:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and email address</li>
                <li>Password (stored in encrypted form; we do not have access to plaintext passwords)</li>
                <li>Account type (Singer or Organization)</li>
              </ul>
              <p className="mt-3"><strong>Singers:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Voice type (fach)</li>
                <li>Repertoire and role history</li>
                <li>Language competencies</li>
                <li>Union status (e.g., AGMA)</li>
                <li>Agency or management representation</li>
                <li>Professional website and bio</li>
                <li>Geographic location (city/region)</li>
                <li>Availability status</li>
                <li>Profile photo (if provided)</li>
              </ul>
              <p className="mt-3"><strong>Organizations:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Organization name and type</li>
                <li>Primary contact name and title</li>
                <li>Location</li>
                <li>Billing information (processed by third-party payment processor — we do not store card numbers)</li>
              </ul>
            </SubSection>
            <SubSection title="2.2 Information Generated Through Platform Use">
              <ul className="list-disc pl-6 space-y-1">
                <li>Search queries submitted by Organizations</li>
                <li>Contact actions (e.g., button clicks to initiate contact with a Singer)</li>
                <li>Emergency casting request submissions</li>
                <li>Engagement feedback submitted by verified Organizations</li>
                <li>Subscription history and credit usage</li>
                <li>Login timestamps and session data</li>
              </ul>
            </SubSection>
            <SubSection title="2.3 Automatically Collected Technical Data">
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>Pages visited and time spent</li>
                <li>Referring URLs</li>
                <li>Cookies and similar tracking technologies (see Section 7)</li>
              </ul>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use collected information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Create and maintain your account</li>
              <li>Operate and improve the Platform</li>
              <li>Match Organizations with Singers based on search criteria</li>
              <li>Display Singer profiles to verified Organizations</li>
              <li>Process subscription payments and manage billing</li>
              <li>Send transactional emails (account creation, password resets, subscription receipts)</li>
              <li>Notify users of platform updates, new features, or policy changes</li>
              <li>Enforce our Terms of Service</li>
              <li>Detect and prevent fraud, abuse, and unauthorized access</li>
              <li>Comply with applicable legal obligations</li>
              <li>Analyze aggregate usage patterns to improve platform performance</li>
            </ul>
            <p>We do <strong>not</strong> sell your personal information to third parties. We do <strong>not</strong> use your information for advertising targeting outside the Platform.</p>
          </Section>

          <Section title="4. How We Share Your Information">
            <SubSection title="4.1 Singer Profiles — Visibility to Organizations">
              <p>Singer profile information (name, voice type, repertoire, languages, availability, union status, representation, and contact details) is made visible to verified Organizations with active accounts. This is the core function of the Platform. By creating a Singer profile and receiving approval, you consent to this visibility.</p>
              <p>Singer profiles are <strong>not</strong> visible to other Singers.</p>
            </SubSection>
            <SubSection title="4.2 Engagement and Reputation Data">
              <p>Verified engagement feedback submitted by Organizations may be displayed on Singer profiles as reputation or castability scores. The identity of the specific Organization submitting feedback is not displayed publicly. Aggregated feedback data may be visible to Pro-tier Organizations.</p>
            </SubSection>
            <SubSection title="4.3 Service Providers">
              <p>We share information with trusted third-party service providers who assist in operating the Platform, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Payment processors (e.g., Stripe)</li>
                <li>Email delivery services (e.g., SendGrid or Postmark)</li>
                <li>Cloud hosting and database providers</li>
                <li>Analytics services</li>
              </ul>
              <p>These providers are contractually required to use your information only as necessary to provide services to us and may not use it for their own purposes.</p>
            </SubSection>
            <SubSection title="4.4 Legal Requirements">
              <p>We may disclose information if required by law, subpoena, court order, or other legal process, or when we believe disclosure is necessary to protect our rights, prevent fraud, or protect the safety of users or others.</p>
            </SubSection>
            <SubSection title="4.5 Business Transfers">
              <p>If Singer Search is acquired, merged, or its assets are transferred, user information may be included in that transfer. We will notify users via email or prominent Platform notice prior to any such transfer.</p>
            </SubSection>
          </Section>

          <Section title="5. Data Retention">
            <p>We retain your account information for as long as your account is active or as needed to provide services. If you delete your account:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Singer profile data is removed from public visibility within 30 days</li>
              <li>Engagement feedback data associated with your profile is retained in anonymized form for platform integrity purposes</li>
              <li>Billing and transaction records are retained for a minimum of 7 years as required by applicable tax and financial regulations</li>
            </ul>
            <p>You may request deletion of your personal data by contacting us (see Section 11). We will honor deletion requests to the extent not limited by legal or contractual obligations.</p>
          </Section>

          <Section title="6. Data Security">
            <p>We implement commercially reasonable technical and organizational security measures to protect your information, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Encrypted password storage</li>
              <li>Access controls limiting employee access to user data</li>
              <li>Regular security reviews</li>
            </ul>
            <p>No system is completely secure. We cannot guarantee absolute security and are not responsible for unauthorized access resulting from factors outside our control.</p>
          </Section>

          <Section title="7. Cookies and Tracking Technologies">
            <SubSection title="7.1 What We Use">
              <p>Singer Search uses cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze Platform usage patterns</li>
              </ul>
            </SubSection>
            <SubSection title="7.2 Types of Cookies">
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Essential cookies:</strong> Required for core Platform functionality (login, session management). Cannot be disabled.</li>
                <li><strong>Analytics cookies:</strong> Help us understand how users interact with the Platform. May be disabled without affecting core functionality.</li>
              </ul>
            </SubSection>
            <SubSection title="7.3 Your Choices">
              <p>You may configure your browser to refuse cookies, but doing so may limit your ability to use certain Platform features. We do not currently respond to "Do Not Track" signals from browsers.</p>
            </SubSection>
          </Section>

          <Section title="8. California Privacy Rights (CCPA / CPRA)">
            <p>As a California-based platform, we comply with the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA).</p>
            <p>California residents have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Know</strong> what personal information we collect and how it is used</li>
              <li><strong>Access</strong> a copy of the personal information we hold about you</li>
              <li><strong>Delete</strong> your personal information (subject to certain exceptions)</li>
              <li><strong>Correct</strong> inaccurate personal information</li>
              <li><strong>Opt out</strong> of the sale of personal information (Singer Search does not sell personal information)</li>
              <li><strong>Non-discrimination</strong> for exercising your privacy rights</li>
            </ul>
            <p>To exercise any of these rights, contact us at support@singersearch.com. We will respond to verified requests within 45 days.</p>
          </Section>

          <Section title="9. Users Outside the United States">
            <p>Singer Search is operated from the United States. If you access the Platform from outside the United States, your information will be transferred to and processed in the United States. By using the Platform, you consent to this transfer.</p>
            <p>If you are located in the European Economic Area (EEA) or United Kingdom and have questions about your rights under GDPR, please contact us directly. We will work to accommodate requests consistent with applicable law.</p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>The Platform is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has submitted information to the Platform, we will delete that information promptly. If you believe a minor has registered, please contact us.</p>
          </Section>

          <Section title="11. Your Account and Data Controls">
            <p>You may:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Update your profile information at any time through your account settings</li>
              <li>Request a copy of your data by contacting us</li>
              <li>Request deletion of your account and associated data by contacting us</li>
              <li>Unsubscribe from marketing emails using the unsubscribe link in any such email (transactional emails cannot be opted out of while your account is active)</li>
            </ul>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify registered users by email and/or by posting a notice on the Platform with the updated effective date. Your continued use of the Platform after the effective date constitutes acceptance of the revised Policy.</p>
          </Section>

          <Section title="13. Contact">
            <p>For privacy-related inquiries, requests, or complaints:</p>
            <p>
              <strong>Singer Search</strong><br />
              support@singersearch.com
            </p>
          </Section>

          <hr className="border-slate-200 my-8" />
          <p className="text-sm text-slate-500 italic">This Privacy Policy was last updated June 1, 2026.</p>
        </article>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-3">{title}</h2>
      <div className="space-y-3 text-slate-700">{children}</div>
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
      <div className="space-y-2 text-slate-700">{children}</div>
    </div>
  );
}
