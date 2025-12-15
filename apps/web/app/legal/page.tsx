"use client";

import Link from "next/link";
import { PageContainer, Tabs, TabsList, TabsTrigger, TabsContent } from "@ryla/ui";

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

      <h1 className="mb-6 text-2xl font-bold text-white">Legal</h1>

      <Tabs defaultValue="terms">
        <TabsList className="mb-6 w-full justify-start bg-transparent p-0">
          <TabsTrigger
            value="terms"
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white/60"
          >
            Terms of Service
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white/60"
          >
            Privacy Policy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terms">
          <div className="prose prose-invert max-w-none">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Terms of Service</h2>
              <p className="mb-4 text-sm text-white/70">Last updated: January 1, 2025</p>
              
              <div className="space-y-4 text-sm text-white/60">
                <section>
                  <h3 className="mb-2 font-medium text-white">1. Acceptance of Terms</h3>
                  <p>
                    By accessing and using RYLA, you agree to be bound by these Terms of Service.
                    If you do not agree to these terms, please do not use our service.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-medium text-white">2. Description of Service</h3>
                  <p>
                    RYLA provides AI-powered content generation tools for creating virtual influencer
                    personas and associated content. The service includes character creation, image
                    generation, and caption generation features.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-medium text-white">3. User Responsibilities</h3>
                  <p>
                    You are responsible for all content generated using your account. You agree not
                    to use the service for any illegal purposes or to generate content that violates
                    any applicable laws or regulations.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-medium text-white">4. Content Ownership</h3>
                  <p>
                    You retain ownership of any original content you create using RYLA. By using the
                    service, you grant RYLA a license to process and store your content for the
                    purpose of providing the service.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-medium text-white">5. Subscription and Payments</h3>
                  <p>
                    Subscription fees are billed monthly in advance. Refunds are handled on a
                    case-by-case basis. Credit purchases are non-refundable once used.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="prose prose-invert max-w-none">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Privacy Policy</h2>
              <p className="mb-4 text-sm text-white/70">Last updated: January 1, 2025</p>
              
              <div className="space-y-4 text-sm text-white/60">
                <section>
                  <h3 className="mb-2 font-medium text-white">1. Information We Collect</h3>
                  <p>
                    We collect information you provide directly, including email address, payment
                    information, and content you create. We also collect usage data to improve
                    our service.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-medium text-white">2. How We Use Information</h3>
                  <p>
                    We use your information to provide and improve our service, process payments,
                    send service updates, and communicate with you about your account.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-medium text-white">3. Data Storage</h3>
                  <p>
                    Your data is stored securely using industry-standard encryption. Generated
                    content is stored in your account until you choose to delete it.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-medium text-white">4. Third-Party Services</h3>
                  <p>
                    We use third-party services for payment processing (Finby), analytics (PostHog),
                    and AI generation (Replicate). These services have their own privacy policies.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-medium text-white">5. Your Rights</h3>
                  <p>
                    You have the right to access, correct, or delete your personal data. Contact
                    us at support@ryla.ai to exercise these rights.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

