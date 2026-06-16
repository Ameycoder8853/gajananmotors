
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-primary">About Gajanan Motors</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Driving transparency and value in the used car marketplace.
        </p>
      </div>

      <div className="space-y-12">
        <Card className="overflow-hidden border-2 shadow-xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="bg-primary/5">
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-lg leading-relaxed">
            <p>
              Gajanan Motors was founded with a simple goal: to make buying and selling used cars a stress-free, transparent, and efficient process. Based in Sangli, Maharashtra, we bridge the gap between trusted local dealers and quality-seeking buyers across the region.
            </p>
            <p className="mt-4">
              We believe that every car has a story, and every buyer deserves a car they can rely on. Our platform leverages technology to verify dealers and moderate content, ensuring a safe ecosystem for everyone.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">For Buyers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Access to a wide range of verified used car listings.</li>
                <li>Advanced filtering by city, price, and vehicle type.</li>
                <li>Direct communication with verified dealers.</li>
                <li>No hidden fees or middleman commissions.</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">For Dealers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Professional dashboard to manage inventory.</li>
                <li>Flexible subscription plans for every business size.</li>
                <li>AI-powered ad moderation for quality assurance.</li>
                <li>Enhanced visibility to local buyers.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-secondary/30 border-none animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold text-primary">Trust</h3>
                <p className="text-sm text-muted-foreground">Strict dealer verification process.</p>
              </div>
              <div>
                <h3 className="font-bold text-primary">Efficiency</h3>
                <p className="text-sm text-muted-foreground">Fast search and easy ad publishing.</p>
              </div>
              <div>
                <h3 className="font-bold text-primary">Support</h3>
                <p className="text-sm text-muted-foreground">Dedicated help for our users.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
