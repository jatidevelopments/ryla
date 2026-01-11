'use client';

import Link from 'next/link';
import {
  PageContainer,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@ryla/ui';

export default function LegalPage() {
  return (
    <PageContainer>
      {/* Back navigation */}
      <Link
        href="/settings"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        Back to Settings
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-white">Legal & Policies</h1>

      <Tabs defaultValue="terms">
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <TabsList className="inline-flex w-max justify-start bg-transparent p-0 gap-2">
            {[
              { label: 'Terms of Service', value: 'terms' },
              { label: 'Privacy Policy', value: 'privacy' },
              { label: 'Imprint', value: 'imprint' },
              { label: 'Underage Policy', value: 'underage' },
              { label: 'Blocked Content', value: 'blocked' },
              { label: 'Content Removal', value: 'removal' },
              { label: 'Community Guidelines', value: 'guidelines' },
              { label: 'Complaint Policy', value: 'complaint' },
              { label: 'DMCA Policy', value: 'dmca' },
              { label: '2257 Exemption', value: '2257' },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg px-4 py-2 text-sm whitespace-nowrap border border-white/5 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-white/10 data-[state=inactive]:text-white/60 transition-all hover:bg-white/5"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Background glow for premium feel */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

          {/* Terms Content */}
          <TabsContent value="terms" className="outline-none">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-white mb-2">
                Terms of Service
              </h2>
              <p className="text-white/40 text-sm mb-8 italic">
                Last Modified: January 8, 2026
              </p>

              <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    1. Welcome to RYLA
                  </h3>
                  <p>
                    These Terms of Service (“TOS”) set forth the guidelines for
                    using our website located at: https://www.ryla.ai/ and the
                    associated web application. RYLA is operated by Miracle AI
                    UG (haftungsbeschränkt), registered in Germany. By accessing
                    or using the platform, you agree to be bound by these TOS
                    and our Privacy Policy.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    2. Description of Services
                  </h3>
                  <p>
                    RYLA provides users with the ability to create
                    hyper-realistic AI Influencers and personas. Our services
                    include generative artificial intelligence (AI) models for
                    image and text creation. Users can training specific persona
                    models, generate promotional content, and manage virtual
                    personas intended for social media monetization. While we
                    strive for high visual fidelity, we cannot guarantee the
                    realism or accuracy of any AI-generated content.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    3. Eligibility and Age Requirement
                  </h3>
                  <p>
                    Our services are strictly intended for individuals who are
                    at least 18 years old. If you are under 18, you are
                    prohibited from using or attempting to access RYLA in any
                    capacity. Providing false information about your age is a
                    material breach of these TOS.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    4. Credits and Monetization
                  </h3>
                  <p>
                    RYLA operates on a credit-based system. Each generation or
                    training session consumes a specific number of credits.
                    Credits can be purchased via our platform. These purchases
                    are final and non-refundable due to the immediate allocation
                    of cloud computing resources required for AI processing. If
                    the platform offers monetization features for AI-generated
                    personas, these will be subject to additional specific
                    payout terms and tax compliance.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    5. Content Ownership & License
                  </h3>
                  <p>
                    <strong>User Submissions:</strong> You retain ownership of
                    the original prompts and training data you provide. However,
                    by using RYLA, you grant us a worldwide, non-exclusive,
                    royalty-free, perpetual license to use and reproduce this
                    data to provide the services and improve our underlying AI
                    models.
                  </p>
                  <p className="mt-4">
                    <strong>Generated Output:</strong> Subject to your
                    compliance with these Terms, you are granted a license to
                    use the generated content for commercial purposes (e.g.,
                    social media influencer management). However, since content
                    is generated by AI, RYLA retains the right to use generated
                    outputs to further train and improve the platform&apos;s
                    performance.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    6. Prohibited Conduct
                  </h3>
                  <p>You agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>
                      Create deepfakes of real individuals without explicit
                      legal consent.
                    </li>
                    <li>
                      Generate content involving minors or material that
                      exploits minors.
                    </li>
                    <li>
                      Use the service for illegal activities or to generate hate
                      speech and violence.
                    </li>
                    <li>
                      Reverse engineer or scrape the platform&apos;s proprietary
                      algorithms.
                    </li>
                    <li>
                      Share account credentials or use automated tools to abuse
                      the generation engine.
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* Privacy Content */}
          <TabsContent value="privacy" className="outline-none">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-white mb-2">
                Privacy Policy
              </h2>
              <p className="text-white/40 text-sm mb-8 italic">
                Last Modified: January 8, 2026
              </p>

              <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    1. Commitment to GDPR
                  </h3>
                  <p>
                    If you are a resident of the European Union, you are
                    entitled to the rights provided by the GDPR. Miracle AI UG
                    (haftungsbeschränkt) acts as the Data Controller. We are
                    committed to transparency, security, and upholding your
                    rights to access, rectify, and delete your personal data.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    2. Information Collection
                  </h3>
                  <p>
                    We collect personal information necessary for the
                    performance of our services:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>
                      <strong>Registration Data:</strong> Email, name, and date
                      of birth.
                    </li>
                    <li>
                      <strong>Usage Data:</strong> IP address, device type, and
                      interaction logs.
                    </li>
                    <li>
                      <strong>Generation Data:</strong> Text prompts and
                      uploaded reference images.
                    </li>
                    <li>
                      <strong>Payment Data:</strong> Processed via third-party
                      providers (e.g., Finby); we do not store full credit card
                      details.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    3. Use of Data for AI Improvement
                  </h3>
                  <p>
                    We may use anonymized or aggregated interaction data to
                    continuously improve our AI models. This includes analyzing
                    prompt patterns to refine output quality and safety filters.
                    Individual users cannot be identified from this aggregated
                    data.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    4. Data Retention and Security
                  </h3>
                  <p>
                    We retain your data only for as long as necessary to provide
                    our services or comply with legal obligations. We use
                    industry-standard encryption (AES-256) for data at rest and
                    TLS for data in transit. Regular security audits are
                    conducted to ensure your data remains protected.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    5. Third-Party Partners
                  </h3>
                  <p>
                    We leverage trusted partners to deliver high-quality
                    services:
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Replicate & Hugging Face (AI Model Inference)</li>
                      <li>PostHog (Analytics)</li>
                      <li>Finby (Payment Processing)</li>
                    </ul>
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* Imprint Content */}
          <TabsContent value="imprint" className="outline-none">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-white mb-2">
                Imprint (Legal Notice)
              </h2>
              <p className="text-white/40 text-sm mb-8 italic text-right">
                Mandatory under § 5 DDG
              </p>

              <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="bg-white/5 p-6 rounded-lg border border-white/5">
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest opacity-60">
                      Provider
                    </h3>
                    <p className="text-lg font-bold text-white mb-1">
                      Miracle AI UG (haftungsbeschränkt)
                    </p>
                    <p>Grolmanstraße 40</p>
                    <p>10623 Berlin</p>
                    <p>Germany</p>
                  </section>

                  <section className="bg-white/5 p-6 rounded-lg border border-white/5">
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest opacity-60">
                      Contact
                    </h3>
                    <p className="mb-2">
                      <strong>Email:</strong> info@ryla.ai
                    </p>
                    <p>
                      <strong>Website:</strong> www.ryla.ai
                    </p>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="bg-white/5 p-6 rounded-lg border border-white/5">
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest opacity-60">
                      Registration
                    </h3>
                    <p>
                      <strong>Register Court:</strong> Amtsgericht
                      Charlottenburg (Berlin)
                    </p>
                    <p>
                      <strong>Register Number:</strong> HRB 231497 B
                    </p>
                    <p className="mt-4">
                      <strong>VAT ID:</strong> DE346705159
                    </p>
                  </section>

                  <section className="bg-white/5 p-6 rounded-lg border border-white/5">
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest opacity-60">
                      Authorized Management
                    </h3>
                    <p className="text-white font-medium">
                      Jonas Frederik Paul Gaebel
                    </p>
                    <p className="text-white font-medium">Makszim Rimarcsuk</p>
                    <p className="text-sm mt-4 opacity-70">
                      Responsible for content according to § 18 MStV: Jonas
                      Frederik Paul Gaebel
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Underage Policy */}
          <TabsContent value="underage" className="outline-none">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-white mb-2">
                Underage Policy
              </h2>
              <p className="text-white/40 text-sm mb-8 italic">
                Protecting minors on our platform.
              </p>

              <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
                <section>
                  <p>
                    RYLA is committed to ensuring that our AI influencer tools
                    are used exclusively by adults. Our platform may contain
                    adult-themed content and hyper-realistic AI figures that are
                    inappropriate for minors. Therefore, a minimum age of 18 is
                    strictly required.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    Registration and Verification
                  </h3>
                  <p>
                    Every user must affirm their age during registration.
                    Providing false age information to gain access is a
                    violation of our Terms of Service and will result in
                    immediate account termination. We leverage automated and
                    manual checks to identify accounts suspected of being
                    operated by minors.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    AI Safety Filters
                  </h3>
                  <p>
                    We employ proprietary &quot;Child Protection&quot; safety
                    filters on our AI models. These filters are specifically
                    designed to prevent the generation of content that resembles
                    or exploits the likeness of minors. Any attempt to bypass
                    these filters will be logged and reported to relevant
                    authorities (e.g., NCMEC).
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* Blocked Content Policy */}
          <TabsContent value="blocked" className="outline-none">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-white mb-2">
                Blocked Content Policy
              </h2>
              <p className="text-white/40 text-sm mb-8 italic">
                Last Modified: December 16, 2025
              </p>

              <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
                <p>
                  To maintain a safe and legal environment, RYLA strictly
                  prohibits the generation or dissemination of the following
                  categories of content:
                </p>

                <ul className="list-disc pl-6 space-y-4 mt-6">
                  <li>
                    <strong>Illegal Acts:</strong> Promotion of illegal
                    substances, weapons, or unlawful behavior.
                  </li>
                  <li>
                    <strong>Hate Speech:</strong> Discrimination or incitement
                    of hatred against protected groups.
                  </li>
                  <li>
                    <strong>Violence:</strong> Promotion of self-harm,
                    terrorism, or graphic depictions of real-world violence.
                  </li>
                  <li>
                    <strong>Child Exploitation:</strong> Content that harms,
                    sexualizes, or exploits minors in any form.
                  </li>
                  <li>
                    <strong>Non-consensual Media:</strong> Deepfakes of real
                    individuals created without their verifiable legal consent.
                  </li>
                  <li>
                    <strong>Extreme Sexual Content:</strong> Bestiality,
                    coprophilia, necrophilia, or any material depicting
                    non-consensual sexual acts.
                  </li>
                  <li>
                    <strong>Impersonation:</strong> Attempting to deceive users
                    by falsely representing public figures or known celebrities
                    via AI.
                  </li>
                </ul>

                <p className="mt-8 italic opacity-60">
                  RYLA reserves the right to review flagged content and suspend
                  accounts that repeatedly violate these standards.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Content Removal Content */}
          <TabsContent value="removal" className="outline-none">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-white mb-2">
                Content Removal Policy
              </h2>
              <p className="text-white/40 text-sm mb-8 italic">
                Protecting the privacy of real individuals.
              </p>

              <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    Accidental Resemblance
                  </h3>
                  <p>
                    RYLA generates images using complex neutral networks. While
                    the content is 100% AI-generated, there is a statistical
                    possibility that a generated figure accidentally resembles a
                    real individual. Such resemblances are entirely
                    coincidental.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    Request Process
                  </h3>
                  <p>
                    If you encounter AI-generated content on RYLA that you
                    believe bears a resemblance to yourself or someone you
                    legally represent, we provide a streamlined removal process.
                    Contact us at <strong>removal@ryla.ai</strong>.
                  </p>
                  <p className="mt-4 font-medium text-white italic">
                    Required Information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Link to the specific content or the unique ID of the
                      Persona.
                    </li>
                    <li>
                      Verification of your identity (where necessary to prevent
                      fraudulent removal requests).
                    </li>
                    <li>A brief statement explaining the resemblance.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    Resolution
                  </h3>
                  <p>
                    Valid requests result in the prompt deletion of the content
                    from our public platform. Requests are typically processed
                    within 48 to 72 hours.
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* Guidelines Content */}
          <TabsContent value="guidelines" className="outline-none">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-white mb-2">
                Community Guidelines
              </h2>
              <p className="text-white/40 text-sm mb-8 italic">
                Building a professional AI Influencer ecosystem.
              </p>

              <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
                <p>
                  These guidelines apply to all interactions on RYLA, including
                  public persona portfolios and community features.
                </p>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    1. Respect and Professionalism
                  </h3>
                  <p>
                    Treat other users with respect. Harassment, bullying, or
                    attempts to sabotage another user&apos;s AI persona will not
                    be tolerated.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    2. Ethical AI Generation
                  </h3>
                  <p>
                    Users are encouraged to explore creativity while staying
                    within ethical bounds. Do not use the platform for malicious
                    purposes, such as generating misinformation or deceptive
                    &quot;proof of life&quot; content for real individuals.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    3. Honest Representation
                  </h3>
                  <p>
                    If you are managing an AI influencer, we encourage labeling
                    content as AI-generated to maintain transparency with your
                    audience. This aligns with the upcoming EU AI Act
                    requirements.
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* Complaint Policy */}
          <TabsContent value="complaint" className="outline-none">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-white mb-2">
                Complaint Policy
              </h2>
              <p className="text-white/40 text-sm mb-8 italic">
                Feedback and Issue Resolution.
              </p>

              <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
                <p>
                  We value user feedback and take complaints seriously. Whether
                  it relates to account issues, content violations, or platform
                  errors, we aim for swift and professional resolution.
                </p>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    Filing a Report
                  </h3>
                  <p>
                    Send your complaint to <strong>support@ryla.ai</strong>{' '}
                    including your account ID and a clear description of the
                    issue.
                  </p>
                  <p className="mt-4">
                    <strong>Response Times:</strong> We acknowledge complaints
                    within 24 hours and provide a detailed resolution or status
                    update within 7 business days.
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    Escalation
                  </h3>
                  <p>
                    If the initial resolution is unsatisfactory, you may request
                    an executive review. A senior member of the Miracle AI UG
                    management team will re-evaluate the case within 14 days.
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* DMCA Policy */}
          <TabsContent value="dmca" className="outline-none">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-white mb-2">
                DMCA Policy
              </h2>
              <p className="text-white/40 text-sm mb-8 italic">
                Copyright Infringement Notification.
              </p>

              <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
                <p>
                  RYLA respects intellectual property rights and follows the
                  safe-harbor procedures of the Digital Millennium Copyright Act
                  (DMCA).
                </p>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    Notice Requirements
                  </h3>
                  <p>
                    If you believe your work has been copied in a way that
                    constitutes copyright infringement, your notice must
                    include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4 text-sm">
                    <li>
                      Physical or electronic signature of the copyright owner.
                    </li>
                    <li>
                      Identification of the copyrighted work claimed to have
                      been infringed.
                    </li>
                    <li>
                      Identification of the material that is claimed to be
                      infringing.
                    </li>
                    <li>
                      Contact information: name, address, phone, and email.
                    </li>
                    <li>
                      A statement of &quot;good faith belief&quot; that use of the
                      material is not authorized.
                    </li>
                    <li>
                      A statement that information in the notification is
                      accurate, under penalty of perjury.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    Submission
                  </h3>
                  <p>
                    Direct notices to: <strong>dmca@ryla.ai</strong>
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* 2257 Content */}
          <TabsContent value="2257" className="outline-none">
            <div className="prose prose-invert max-w-none">
              <h1 className="text-3xl font-bold text-white mb-4">
                2257 Compliance Statement
              </h1>
              <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
                <p>
                  <strong>Notice of Exemption:</strong> All visual content
                  displayed on RYLA (www.ryla.ai) qualifies for exemptions from
                  the requirements of 18 U.S.C. §2257, 2257A, and 28 C.F.R. 75.
                </p>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    Legal Basis for Exemption
                  </h3>
                  <ul className="list-disc pl-6 space-y-4">
                    <li>
                      <strong>AI Origin:</strong> Every pixel across our
                      generated imagery is produced by Artificial Intelligence
                      (AI) algorithms.
                    </li>
                    <li>
                      <strong>No Real Persons:</strong> There are no real-world
                      models, actors, or individuals depicted in sexually
                      explicit conduct. The figures you see are digital
                      constructs, not photographic representations of real
                      humans.
                    </li>
                    <li>
                      <strong>No Participation:</strong> Since no real humans
                      are involved, there is no &quot;participation&quot; as defined by 18
                      U.S.C. §2257.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2 mb-4">
                    Commitment
                  </h3>
                  <p>
                    RYLA is dedicated to maintaining high legal and ethical
                    standards. Our platform generates 100% synthetic media and
                    strictly prohibits the use of training data that infringes
                    on the safety of minors.
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </PageContainer>
  );
}
