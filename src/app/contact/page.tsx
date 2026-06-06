"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-neutral-500">We&apos;d love to hear from you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {[
            { icon: Mail, title: "Email", value: "support@bazaarly.com" },
            { icon: Phone, title: "Phone", value: "+1 (555) 123-4567" },
            { icon: MapPin, title: "Address", value: "123 Fashion Ave, New York, NY 10001" },
            { icon: Clock, title: "Hours", value: "Mon-Fri: 9AM-6PM EST" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-sm text-neutral-500">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4 border border-neutral-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" name="name" required />
            <Input label="Email" name="email" type="email" required />
          </div>
          <Input label="Subject" name="subject" required />
          <div>
            <label className="block text-sm font-medium mb-1.5">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full px-4 py-2.5 border border-neutral-300 focus:outline-none focus:border-black"
            />
          </div>
          <Button type="submit" loading={loading}>Send Message</Button>
        </form>
      </div>
    </div>
  );
}
