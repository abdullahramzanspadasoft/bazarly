export const metadata = {
  title: "Privacy Policy",
  description: "Bazaarly privacy policy and data protection information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-neutral-500 mb-8">Last updated: June 6, 2026</p>

      <div className="prose prose-neutral max-w-none space-y-6 text-neutral-600 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">1. Information We Collect</h2>
          <p>We collect information you provide directly, including name, email, shipping address, and payment details when you create an account or place an order. We also collect browsing data through cookies and analytics tools.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">2. How We Use Your Information</h2>
          <p>Your information is used to process orders, provide customer support, send order updates, improve our services, and send marketing communications (with your consent). We never sell your personal data to third parties.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">3. Payment Security</h2>
          <p>All payment transactions are encrypted using SSL technology. We use Stripe and PayPal for secure payment processing. We do not store complete credit card numbers on our servers.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">4. Data Retention</h2>
          <p>We retain your account information for as long as your account is active. Order history is kept for 7 years for tax and legal compliance. You may request deletion of your account at any time.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. Contact us at privacy@bazaarly.com to exercise these rights. We will respond within 30 days.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">6. Contact</h2>
          <p>For privacy-related inquiries, contact us at privacy@bazaarly.com or write to Bazaarly Inc., 123 Fashion Ave, New York, NY 10001.</p>
        </section>
      </div>
    </div>
  );
}
