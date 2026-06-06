"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CreditCard, Wallet, Banknote, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { formatPrice } from "@/lib/utils";

const paymentMethods = [
  { id: "stripe" as const, label: "Credit/Debit Card (Stripe)", icon: CreditCard },
  { id: "paypal" as const, label: "PayPal", icon: Wallet },
  { id: "cod" as const, label: "Cash on Delivery", icon: Banknote },
];

interface PendingStripePayment {
  orderId: string;
  orderNumber: string;
  clientSecret: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getSubtotal, getTotal, couponCode, couponDiscount, setCoupon, clearCoupon, clearCart, clearCartInDb } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<CheckoutInput["paymentMethod"]>("stripe");
  const [stripePayment, setStripePayment] = useState<PendingStripePayment | null>(null);

  const subtotal = getSubtotal();
  const total = getTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "stripe",
      shippingAddress: { street: "", city: "", state: "", zipCode: "", country: "USA" },
    },
  });

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      setCoupon(data.code, data.discount);
      toast.success(`Coupon applied! Saved ${formatPrice(data.discount)}`);
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const finishOrder = async (orderNumber: string) => {
    clearCart();
    if (session) await clearCartInDb();
    router.push(`/order-confirmation/${orderNumber}`);
  };

  const onSubmit = async (data: CheckoutInput) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            title: i.title,
            image: i.image,
            price: i.price,
            discount: i.discount,
            quantity: i.quantity,
          })),
          shippingAddress: data.shippingAddress,
          paymentMethod: selectedPayment,
          couponCode: couponCode || undefined,
        }),
      });

      const order = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(order.error);
        return;
      }

      if (selectedPayment === "stripe") {
        const payRes = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: order.total, orderId: order._id }),
        });

        const payData = await payRes.json();
        if (!payRes.ok) {
          toast.error(payData.error || "Failed to initialize payment");
          return;
        }

        setStripePayment({
          orderId: order._id,
          orderNumber: order.orderNumber,
          clientSecret: payData.clientSecret,
        });
        toast.success("Order created. Complete your payment below.");
        return;
      }

      if (selectedPayment === "paypal") {
        await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: order.total, orderId: order._id }),
        });
        toast.success("PayPal payment initiated!");
      } else {
        toast.success("Order placed! Pay on delivery.");
      }

      await finishOrder(order.orderNumber);
    } catch {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = async () => {
    if (stripePayment) {
      await finishOrder(stripePayment.orderNumber);
    }
  };

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to checkout</p>
        <Button onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  if (items.length === 0 && !stripePayment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Button onClick={() => router.push("/shop")}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {stripePayment && (
        <div className="mb-8">
          <StripePaymentForm
            clientSecret={stripePayment.clientSecret}
            orderId={stripePayment.orderId}
            orderNumber={stripePayment.orderNumber}
            onSuccess={handleStripeSuccess}
            onCancel={() => setStripePayment(null)}
          />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" /> Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Street Address" error={errors.shippingAddress?.street?.message}
                    {...register("shippingAddress.street")} />
                </div>
                <Input label="City" error={errors.shippingAddress?.city?.message}
                  {...register("shippingAddress.city")} />
                <Input label="State" error={errors.shippingAddress?.state?.message}
                  {...register("shippingAddress.state")} />
                <Input label="Zip Code" error={errors.shippingAddress?.zipCode?.message}
                  {...register("shippingAddress.zipCode")} />
                <Input label="Country" error={errors.shippingAddress?.country?.message}
                  {...register("shippingAddress.country")} />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? "border-foreground bg-muted"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                      className="accent-foreground"
                    />
                    <method.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{method.label}</span>
                    {method.id === "stripe" && (
                      <span className="ml-auto text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5">
                        Test Mode
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className="border border-border p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span className="text-muted-foreground truncate mr-2">
                    {item.title} x{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({couponCode})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t border-border pt-3">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground"
              />
              <Button type="button" variant="outline" size="sm" onClick={applyCoupon} loading={couponLoading}>
                Apply
              </Button>
            </div>
            {couponCode && (
              <button type="button" onClick={clearCoupon} className="text-xs text-red-500 mt-1">
                Remove coupon
              </button>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={!!stripePayment}
              className="w-full mt-6"
              size="lg"
            >
              {selectedPayment === "stripe" ? "Continue to Payment" : "Place Order"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
