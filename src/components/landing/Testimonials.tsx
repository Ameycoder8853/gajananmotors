
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Rohan Patel",
    role: "First-Time Buyer",
    quote: "Gajanan Motors made finding my first car so easy. The dealers were verified, and the pricing was transparent. I found a great deal on a Swift and couldn't be happier!",
    imageId: "testimonial-1",
  },
  {
    name: "Priya Sharma",
    role: "Used Car Dealer",
    quote: "The Pro subscription is worth every penny. I've sold more cars in the last three months than I did in the previous six. The platform is intuitive and brings serious buyers.",
    imageId: "testimonial-2",
  },
  {
    name: "Ankit Gupta",
    role: "Upgraded his Family Car",
    quote: "I was looking for a reliable SUV for my family. The search filters helped me narrow down the options quickly. The entire process was smooth and hassle-free.",
    imageId: "testimonial-3",
  }
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-secondary">
      <div className="container">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            We're proud to have helped thousands of people find their perfect car.
          </p>
        </div>
        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
          {testimonials.map((testimonial, index) => {
            const image = PlaceHolderImages.find(p => p.id === testimonial.imageId);
            return (
              <Card 
                key={testimonial.name}
                className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up max-w-sm mx-auto"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center text-yellow-400 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <blockquote className="text-muted-foreground italic">"{testimonial.quote}"</blockquote>
                  <div className="mt-6 flex items-center justify-center">
                    {image && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={image.imageUrl}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                          data-ai-hint={image.imageHint}
                        />
                      </div>
                    )}
                    <div className="ml-4 text-left">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
