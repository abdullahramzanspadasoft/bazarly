import Image from "next/image";
import { Award, Users, Globe, Heart } from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "Learn about Bazaarly - your destination for premium fashion and luxury watches.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[40vh] min-h-[300px] bg-black text-white flex items-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
            alt="About Bazaarly"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold mb-4">About Bazaarly</h1>
          <p className="text-neutral-300 max-w-lg">
            Redefining luxury shopping with curated collections and exceptional service.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Founded in 2020, Bazaarly was born from a passion for exceptional craftsmanship
              and timeless style. We believe that every gentleman deserves access to premium
              fashion without compromise.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              From meticulously tailored suits to precision-engineered timepieces, we curate
              only the finest products from renowned artisans and brands worldwide. Our commitment
              to quality, authenticity, and customer satisfaction sets us apart.
            </p>
          </div>
          <div className="relative aspect-[4/3] bg-neutral-100">
            <Image
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
              alt="Our team"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Premium Quality", desc: "Only the finest materials and craftsmanship" },
              { icon: Users, title: "Expert Curation", desc: "Handpicked by fashion and horology experts" },
              { icon: Globe, title: "Worldwide Shipping", desc: "Delivered to your doorstep globally" },
              { icon: Heart, title: "Customer First", desc: "Dedicated support and easy returns" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
