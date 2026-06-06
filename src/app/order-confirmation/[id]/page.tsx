import Link from "next/link";
import { CheckCircle, Package, Truck } from "lucide-react";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";

interface OrderConfirmationProps {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  try {
    await connectDB();
    const order = await Order.findOne({
      $or: [{ _id: id }, { orderNumber: id }],
    }).lean();
    return order ? JSON.parse(JSON.stringify(order)) : null;
  } catch {
    return null;
  }
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationProps) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-neutral-500 mb-8">
        Thank you for your purchase. Your order has been placed successfully.
      </p>

      <div className="border border-neutral-200 p-6 text-left mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-neutral-500">Order Number</p>
            <p className="font-semibold">{order.orderNumber}</p>
          </div>
          <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>
            {order.paymentStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-neutral-500">Payment Method</p>
            <p className="font-medium capitalize">{order.paymentMethod}</p>
          </div>
          <div>
            <p className="text-neutral-500">Total</p>
            <p className="font-semibold">{formatPrice(order.total)}</p>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="flex items-center gap-2 p-3 bg-neutral-50 text-sm">
            <Truck className="w-4 h-4" />
            <span>Tracking: <strong>{order.trackingNumber}</strong></span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-sm font-medium mb-2">Items:</p>
          {order.items.map((item: { title: string; quantity: number; price: number }, i: number) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span>{item.title} x{item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/dashboard/orders">
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" /> View Orders
          </Button>
        </Link>
        <Link href="/shop">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
