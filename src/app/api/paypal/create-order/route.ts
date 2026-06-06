import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

    const paypalOrderId = `PAYPAL-${orderId}-${Date.now()}`;

    return NextResponse.json({
      paypalOrderId,
      approvalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?paypal=${paypalOrderId}`,
      status: "CREATED",
    });
  } catch (error) {
    console.error("PayPal order error:", error);
    return NextResponse.json({ error: "PayPal order creation failed" }, { status: 500 });
  }
}
