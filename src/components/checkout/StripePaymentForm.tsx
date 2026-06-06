"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  orderId: string;
  orderNumber: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ orderId, orderNumber, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/${orderNumber}`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await fetch("/api/stripe/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
          }),
        });
        toast.success("Payment successful!");
        onSuccess();
      }
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} disabled={!stripe} className="flex-1" size="lg">
          Pay Now
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} size="lg">
          Cancel
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Test card: 4242 4242 4242 4242 · Any future date · Any CVC
      </p>
    </form>
  );
}

interface StripePaymentFormProps extends PaymentFormProps {
  clientSecret: string;
}

export default function StripePaymentForm({
  clientSecret,
  orderId,
  orderNumber,
  onSuccess,
  onCancel,
}: StripePaymentFormProps) {
  return (
    <div className="border border-border p-6 bg-muted/30">
      <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#0a0a0a",
              borderRadius: "0px",
            },
          },
        }}
      >
        <CheckoutForm
          orderId={orderId}
          orderNumber={orderNumber}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
}
