import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPaymentIntent } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, orderId } = await req.json();

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "Amount and order ID are required" },
        { status: 400 }
      );
    }

    const paymentIntent = await createPaymentIntent(amount, orderId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
