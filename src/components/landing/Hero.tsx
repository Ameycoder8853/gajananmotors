
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ChevronDown } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function Hero() {
  const heroImage = PlaceHolderImages.find(p => p.id === "hero-background");

  return (
    <section className="relative w-full h-screen flex items-center justify-center text-white overflow-hidden">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover animate-zoom-in"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="relative z-10 px-4 md:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
          <span>Over 1,000+ happy customers</span>
        </div>
        <h1 className="mt-6 font-headline text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          Find Your Next Car, The Right Way
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-200 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          Browse a curated selection of quality used cars from trusted dealers.
          At Gajanan Motors, transparency and value drive everything we do.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <Button size="lg" asChild className="transition-transform duration-300 hover:scale-105">
            <Link href="/market">
              Browse Cars <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild className="transition-transform duration-300 hover:scale-105">
            <Link href="/signup">
              Become a Dealer
            </Link>
          </Button>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
        <a href="#features" aria-label="Scroll down">
          <ChevronDown className="w-10 h-10 text-white animate-bounce-slow" />
        </a>
      </div>
    </section>
  );
}
