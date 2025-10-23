
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FeaturedCars } from "@/components/landing/FeaturedCars";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Cta } from "@/components/landing/Cta";
import { Stats } from "@/components/landing/Stats";
import { Faq } from "@/components/landing/Faq";

function ContactForm() {
    return (
        <section id="contact" className="py-16 sm:py-24 bg-secondary">
            <div className="px-8">
                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <Card>
                        <CardContent className="p-8 md:p-12">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                    Have Questions?
                                </h2>
                                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                                    We're here to help. Fill out the form below and we'll get back to you as soon as possible.
                                </p>
                            </div>
                            <form className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input placeholder="Your Name" />
                                <Input type="email" placeholder="Your Email" />
                                <div className="sm:col-span-2">
                                    <Input placeholder="Subject" />
                                </div>
                                <div className="sm:col-span-2">
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Your Message"
                                    ></textarea>
                                </div>
                                <div className="sm:col-span-2 text-center">
                                    <Button size="lg" type="submit" className="transition-transform duration-300 hover:scale-105">Send Message</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <FeaturedCars />
      <Stats />
      <HowItWorks />
      <Testimonials />
      <Faq />
      <Cta />
      <ContactForm />
    </>
  );
}
