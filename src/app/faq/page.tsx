"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What payment methods do you accept?",
    a: "We accept Stripe (credit/debit cards), PayPal, direct card payments, and Cash on Delivery (COD) for eligible orders.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available at checkout. Free shipping on orders over $100.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day return policy for unused items in original packaging. Custom or altered items may not be eligible for return.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive a tracking number via email. You can also view tracking details in your dashboard under Order History.",
  },
  {
    q: "Are your watches authentic?",
    a: "Yes, all our luxury watches come with authenticity certificates and manufacturer warranties. We source directly from authorized dealers.",
  },
  {
    q: "Do you offer suit alterations?",
    a: "We offer complimentary basic alterations on all suit purchases. Premium tailoring services are available at select locations.",
  },
  {
    q: "How do coupon codes work?",
    a: "Enter your coupon code at checkout. Codes like WELCOME10 offer percentage discounts, while SAVE50 provides fixed amount discounts. Minimum order amounts may apply.",
  },
  {
    q: "Can I cancel my order?",
    a: "Orders can be cancelled within 2 hours of placement if they haven't been processed. Contact support for assistance.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-neutral-500">Find answers to common questions</p>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-neutral-200">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
            >
              <span className="font-medium text-sm pr-4">{faq.q}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-transform",
                  openIndex === i && "rotate-180"
                )}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-sm text-neutral-600 leading-relaxed animate-fade-in">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
