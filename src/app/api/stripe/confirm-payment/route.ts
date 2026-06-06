import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Order from "@/models/Order";
import Payment from "@/models/Payment";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, paymentIntentId } = await req.json();

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: "Order ID and payment intent ID are required" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({ _id: orderId, user: session.user.id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    order.stripePaymentIntentId = paymentIntentId;
    order.paidAt = new Date();
    await order.save();

    await Payment.findOneAndUpdate(
      { order: orderId },
      {
        status: "completed",
        transactionId: paymentIntentId,
        readByAdmin: false,
      }
    );

    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json({ error: "Payment confirmation failed" }, { status: 500 });
  }
}
