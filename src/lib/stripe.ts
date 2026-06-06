import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

export async function createPaymentIntent(amount: number, orderId: string) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    metadata: { orderId },
    automatic_payment_methods: { enabled: true },
  });
}
