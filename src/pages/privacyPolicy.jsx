import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Seo from "../components/seo";
import { toAbsoluteUrl } from "../lib/seo";

export default function PrivacyPolicy() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy - PDF Lovers",
    url: toAbsoluteUrl("/privacy-policy"),
    description: "Privacy policy and data handling details for PDF Lovers.",
  };

  return (
    <>
      <Seo
        title="Privacy Policy - PDF Lovers"
        description="Read the privacy policy for PDF Lovers, including data usage and DMCA compliance."
        pathname="/privacy-policy"
        structuredData={structuredData}
      />
      <Navbar />
      <main className="min-h-screen bg-white pt-28 sm:pt-32">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
          <h1 className="font-display text-3xl font-black text-black/85 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm font-display text-black/70">
            Effective Date: 2 Feb 2026
          </p>

          <div className="mt-6 space-y-6 font-display text-sm leading-7 text-black/75 sm:text-base">
            <p>
              Welcome to PDF Lovers ("we", "our", or "the website"). Your
              privacy is important to us, and we are committed to being
              transparent about how our platform operates.
            </p>
            <p>
              This Privacy Policy explains what information we collect and how
              we handle content displayed on our website.
            </p>

            <section>
              <h2 className="text-lg font-bold text-black/85">
                1. Information We Collect
              </h2>
              <p className="mt-2">
                PDF Lovers does not require users to create an account or
                provide personal information to access the website.
              </p>
              <p className="mt-2">
                However, we may collect limited information for security and
                performance purposes, including:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Device/browser type</li>
                <li>Anonymous usage statistics</li>
                <li>IP address (for spam and abuse prevention)</li>
                <li>Request form submissions (if used)</li>
              </ul>
              <p className="mt-2">
                This data is used only to improve user experience and prevent
                misuse.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black/85">
                2. We Do Not Host Any PDF Files
              </h2>
              <p className="mt-2">
                PDF Lovers does not upload, store, or host any PDF books,
                documents, or copyrighted material on its own servers.
              </p>
              <p className="mt-2">All content provided on this website is:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Collected from publicly available sources</li>
                <li>Linked from external websites</li>
                <li>Indexed through Google Search results</li>
              </ul>
              <p className="mt-2">
                We simply provide a convenient way for users to discover
                educational PDFs that are already available on the internet.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black/85">
                3. External Links Disclaimer
              </h2>
              <p className="mt-2">
                Our website may contain links to third-party websites.
              </p>
              <p className="mt-2">PDF Lovers is not responsible for:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>The content hosted on external websites</li>
                <li>
                  Copyright status of files found on third-party sites
                </li>
                <li>Availability or accuracy of external links</li>
              </ul>
              <p className="mt-2">
                Users access external links at their own discretion.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black/85">
                4. Copyright &amp; DMCA Compliance
              </h2>
              <p className="mt-2">
                We respect copyright laws and take intellectual property rights
                seriously.
              </p>
              <p className="mt-2">
                If you are a copyright owner and believe that any link on our
                website points to infringing content, you may contact us with
                the following details:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Your name and organization</li>
                <li>Proof of ownership</li>
                <li>The URL(s) in question</li>
                <li>A removal request</li>
              </ul>
              <p className="mt-2">
                Upon receiving a valid complaint, we will remove the content
                promptly.
              </p>
              <p className="mt-2">Contact Email:<span className="text-blue-500">pdflovers@atomicmail.io</span></p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black/85">
                5. User Requests
              </h2>
              <p className="mt-2">
                If users submit requests for PDFs, the information provided is
                used only to:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Review requested titles</li>
                <li>Improve content suggestions</li>
              </ul>
              <p className="mt-2">
                We do not sell or share request data with third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black/85">6. Cookies</h2>
              <p className="mt-2">
                PDF Lovers may use basic cookies or analytics tools to:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Understand traffic patterns</li>
                <li>Improve site performance</li>
              </ul>
              <p className="mt-2">
                You may disable cookies in your browser settings if desired.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black/85">
                7. Changes to This Policy
              </h2>
              <p className="mt-2">
                We may update this Privacy Policy at any time. Changes will be
                posted on this page with a new effective date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black/85">8. Contact Us</h2>
              <p className="mt-2">
                If you have questions about this Privacy Policy or wish to
                request content removal, contact us at:
              </p>
              <p className="mt-2">Email: <span className="text-blue-500">pdflovers@atomicmail.io</span></p>
              <p>Website: https://pdflovers.vercel.app</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
