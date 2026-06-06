export const metadata = {
  title: "Terms & Conditions",
  description: "Bazaarly terms and conditions of service.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <p className="text-sm text-neutral-500 mb-8">Last updated: June 6, 2026</p>

      <div className="space-y-6 text-neutral-600 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">1. Acceptance of Terms</h2>
          <p>By accessing and using Bazaarly, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">2. Products and Pricing</h2>
          <p>All products are subject to availability. We reserve the right to modify prices at any time. Prices displayed include applicable discounts but exclude shipping and taxes unless stated otherwise.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">3. Orders and Payment</h2>
          <p>Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel orders. Payment must be received before order processing. We accept Stripe, PayPal, card payments, and Cash on Delivery.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">4. Shipping and Delivery</h2>
          <p>Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery. Free shipping applies to orders over $100 within the continental United States.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">5. Returns and Refunds</h2>
          <p>Items may be returned within 30 days in original condition. Refunds are processed within 5-10 business days after we receive the returned item. Shipping costs for returns are the customer&apos;s responsibility unless the item is defective.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">6. Limitation of Liability</h2>
          <p>Bazaarly shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or products. Our total liability is limited to the amount paid for the specific order.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black mb-2">7. Governing Law</h2>
          <p>These terms are governed by the laws of the State of New York. Any disputes shall be resolved in the courts of New York County.</p>
        </section>
      </div>
    </div>
  );
}
