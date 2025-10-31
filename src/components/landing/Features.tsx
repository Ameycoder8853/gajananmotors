
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, ShieldCheck, Search, Users, Gem } from "lucide-react";

const features = [
  {
    icon: <Search className="w-8 h-8 text-primary" />,
    title: "Advanced Search",
    description: "Easily find your perfect car with our powerful filters for make, model, year, price, and location.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "Verified Dealers",
    description: "We partner with trusted dealers to ensure every listing is legitimate and of high quality.",
  },
  {
    icon: <DollarSign className="w-8 h-8 text-primary" />,
    title: "Transparent Pricing",
    description: "No hidden fees. The price you see is the price you get. Contact dealers directly for the best deals.",
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "For Dealers, By Dealers",
    description: "Flexible plans for dealers, from free tiers to pro subscriptions with more ad slots.",
  },
  {
    icon: <Gem className="w-8 h-8 text-primary" />,
    title: "Pro Features",
    description: "Upgrade to a Pro account to list more cars, get premium support, and reach more buyers.",
  },
   {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "AI Ad Moderation",
    description: "Our smart system automatically checks ads for policy violations, ensuring a safe and trustworthy marketplace.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-background">
      <div className="px-4 md:px-8">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Why Choose Gajanan Motors?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            We've built a platform that simplifies car buying and selling for everyone.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription className="mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
