import React, { useEffect } from "react";
import { useAppContext } from "./AppContext";

export function TermsPage() {
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
          data-testid="link-terms-back"
        >
          ← Back to home
        </a>

        <article className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 sm:px-10 py-10 text-slate-700 leading-relaxed">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Singer Search — Terms of Service</h1>
          <p className="text-sm text-slate-500 mb-1"><strong>Effective Date:</strong> [INSERT DATE]</p>
          <p className="text-sm text-slate-500 mb-8"><strong>Last Updated:</strong> [INSERT DATE]</p>
          <hr className="border-slate-200 mb-8" />

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using Singer Search ("the Platform," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.</p>
            <p>These Terms apply to all users, including individuals who register as Singers and representatives of organizations that register as Hiring Organizations ("Organizations").</p>
          </Section>

          <Section title="2. Description of the Platform">
            <p>Singer Search is a professional casting intelligence platform that connects classical and opera singers with organizations seeking to hire vocal talent. The Platform facilitates discovery, search, and contact — it does not act as an employer, agent, or manager for any user.</p>
            <p><strong>Singer Search is not:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>A talent agency or booking agent</li>
              <li>A party to any engagement, contract, or employment agreement between Singers and Organizations</li>
              <li>Responsible for the outcome of any casting decision made through the Platform</li>
            </ul>
          </Section>

          <Section title="3. Eligibility and Account Registration">
            <SubSection title="3.1 Singers">
              <p>To register as a Singer, you must be a professional classical or opera singer. By registering, you represent that the information in your profile is accurate, current, and not misleading.</p>
            </SubSection>
            <SubSection title="3.2 Organizations">
              <p>To register as an Organization, you must be an authorized representative of a legitimate performing arts organization, opera company, orchestra, presenting organization, or similar institutional entity. Individual casting directors must register under an organizational affiliation.</p>
            </SubSection>
            <SubSection title="3.3 Account Accuracy">
              <p>You agree to maintain accurate account information and promptly update any information that changes. You are responsible for all activity under your account.</p>
            </SubSection>
            <SubSection title="3.4 Age Requirement">
              <p>You must be at least 18 years of age to use the Platform.</p>
            </SubSection>
          </Section>

          <Section title="4. Singer Profiles">
            <SubSection title="4.1 Profile Content">
              <p>Singers are responsible for the accuracy and completeness of all profile content, including but not limited to: voice type (fach), repertoire, language competencies, union status, agency representation, contact information, and availability.</p>
            </SubSection>
            <SubSection title="4.2 Profile Approval">
              <p>Singer profiles are subject to administrative review and approval before becoming visible to Organizations. Singer Search reserves the right to decline or remove profiles that do not meet professional standards, contain inaccurate information, or violate these Terms.</p>
            </SubSection>
            <SubSection title="4.3 Singer-to-Singer Search Restriction">
              <p>Singer profiles are visible only to verified Organizations. Singers may not use the Platform to search for, view, or contact other Singers. This restriction is structural and non-negotiable.</p>
            </SubSection>
          </Section>

          <Section title="5. Organization Access and Use">
            <SubSection title="5.1 Authorized Use">
              <p>Organizations may use the Platform to search for Singers, review profiles, access repertoire and availability information, and initiate contact for legitimate professional casting purposes.</p>
            </SubSection>
            <SubSection title="5.2 Prohibited Uses">
              <p>Organizations may not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use Singer contact information for purposes unrelated to professional casting</li>
                <li>Share Singer profile data or contact information with third parties outside the organization</li>
                <li>Harvest or scrape Singer data</li>
                <li>Use the Platform to solicit Singers for non-professional, inappropriate, or exploitative engagements</li>
              </ul>
            </SubSection>
            <SubSection title="5.3 Emergency Requests">
              <p>Organizations submitting emergency casting requests represent that the need is genuine and that they have authority to engage talent on behalf of their organization.</p>
            </SubSection>
          </Section>

          <Section title="6. Reputation and Engagement Data">
            <SubSection title="6.1 Company-Verified Data Only">
              <p>Reputation and castability data displayed on the Platform is sourced exclusively from verified Organizations. Singer Search does not publish self-reported or peer-submitted reputation data.</p>
            </SubSection>
            <SubSection title="6.2 Feedback Submission">
              <p>Organizations that submit engagement feedback represent that the feedback reflects an actual professional engagement and is submitted in good faith.</p>
            </SubSection>
            <SubSection title="6.3 Disputes">
              <p>Singers who believe reputation data is inaccurate may submit a dispute through the Platform. Singer Search will review disputes and make corrections at its discretion. Singer Search is not liable for the content of engagement feedback submitted by Organizations.</p>
            </SubSection>
            <SubSection title="6.4 Pro Tier Access">
              <p>Detailed reputation and castability data is available exclusively to Organizations with an active Pro subscription. Singer Search reserves the right to modify what data is gated at the Pro tier.</p>
            </SubSection>
          </Section>

          <Section title="7. Subscriptions and Payment">
            <SubSection title="7.1 Subscription Plans">
              <p>Singer Search offers subscription plans for both Singers and Organizations. Subscription features, pricing, and billing cycles are described on the Pricing page and are subject to change with notice.</p>
            </SubSection>
            <SubSection title="7.2 Founding Member Program">
              <p>The first 50 qualifying Singers and first 10 qualifying Organizations to register are eligible for one year of Pro access at no charge under the Founding Member Program. Founding Member status is non-transferable. Singer Search reserves the right to verify eligibility and revoke Founding Member status if eligibility requirements are not met.</p>
            </SubSection>
            <SubSection title="7.3 Free Trial">
              <p>Singer Search may offer a limited free trial period. By initiating a trial, you authorize Singer Search to charge your payment method at the conclusion of the trial period unless you cancel before the trial ends.</p>
            </SubSection>
            <SubSection title="7.4 Cancellation">
              <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. Singer Search does not provide refunds for unused subscription time except where required by law.</p>
            </SubSection>
            <SubSection title="7.5 Payment Processing">
              <p>Payment processing is handled by a third-party payment processor. Singer Search does not store payment card information on its servers.</p>
            </SubSection>
          </Section>

          <Section title="8. Intellectual Property">
            <SubSection title="8.1 Platform Content">
              <p>Singer Search owns all intellectual property rights in the Platform, including its design, functionality, search algorithms, and data structures.</p>
            </SubSection>
            <SubSection title="8.2 User Content">
              <p>By submitting content to the Platform (profile text, repertoire listings, photos, etc.), you grant Singer Search a non-exclusive, royalty-free, worldwide license to display and use that content in connection with operating and promoting the Platform.</p>
            </SubSection>
            <SubSection title="8.3 Restrictions">
              <p>You may not reproduce, distribute, reverse engineer, or create derivative works from the Platform or its content without written permission from Singer Search.</p>
            </SubSection>
          </Section>

          <Section title="9. Prohibited Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Submit false, misleading, or inaccurate information</li>
              <li>Impersonate any person or organization</li>
              <li>Attempt to gain unauthorized access to any part of the Platform</li>
              <li>Introduce malware, viruses, or harmful code</li>
              <li>Use the Platform to harass, abuse, or harm other users</li>
              <li>Circumvent any technical restrictions or paywalls</li>
              <li>Use automated tools to access or scrape the Platform</li>
              <li>Violate any applicable law or regulation</li>
            </ul>
          </Section>

          <Section title="10. Termination">
            <p>Singer Search reserves the right to suspend or terminate any account, at its sole discretion, for violation of these Terms, suspected fraudulent activity, or any conduct that Singer Search determines to be harmful to users or the Platform. You may terminate your account at any time through your account settings.</p>
          </Section>

          <Section title="11. Disclaimers">
            <p>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. SINGER SEARCH DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. SINGER SEARCH DOES NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR RELIABILITY OF ANY USER-SUBMITTED PROFILE DATA OR ENGAGEMENT FEEDBACK.</p>
            <p>SINGER SEARCH IS NOT A PARTY TO ANY AGREEMENT BETWEEN SINGERS AND ORGANIZATIONS AND MAKES NO REPRESENTATIONS REGARDING THE PROFESSIONAL QUALIFICATIONS, AVAILABILITY, OR RELIABILITY OF ANY SINGER OR ORGANIZATION LISTED ON THE PLATFORM.</p>
          </Section>

          <Section title="12. Limitation of Liability">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SINGER SEARCH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO LOSS OF REVENUE, CASTING ERRORS, OR FAILED ENGAGEMENTS, EVEN IF SINGER SEARCH HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            <p>OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID TO SINGER SEARCH IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.</p>
          </Section>

          <Section title="13. Indemnification">
            <p>You agree to indemnify, defend, and hold harmless Singer Search and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from your use of the Platform, your violation of these Terms, or your violation of any third-party rights.</p>
          </Section>

          <Section title="14. Governing Law and Dispute Resolution">
            <p>These Terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration in Los Angeles County, California, under the rules of the American Arbitration Association, except that either party may seek injunctive or other equitable relief in a court of competent jurisdiction.</p>
          </Section>

          <Section title="15. Changes to These Terms">
            <p>Singer Search reserves the right to modify these Terms at any time. We will notify registered users of material changes by email or through the Platform. Continued use of the Platform after the effective date of any changes constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="16. Contact">
            <p>Questions about these Terms should be directed to:</p>
            <p>
              <strong>Singer Search</strong><br />
              [support@YOURDOMAIN.com]<br />
              [Mailing address — insert upon incorporation]
            </p>
          </Section>

          <hr className="border-slate-200 my-8" />
          <p className="text-sm text-slate-500 italic">These Terms of Service were last updated [INSERT DATE]. Users are encouraged to review them periodically.</p>
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
