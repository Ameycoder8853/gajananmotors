
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Car, Handshake, BadgeCheck } from 'lucide-react';

const steps = [
    {
        icon: <Search className="w-8 h-8 text-primary" />,
        title: "Find Your Car",
        description: "Use our advanced search filters to find the perfect car that fits your needs and budget from thousands of listings."
    },
    {
        icon: <BadgeCheck className="w-8 h-8 text-primary" />,
        title: "Connect with Dealers",
        description: "Contact verified dealers directly through our platform to ask questions, schedule a test drive, and negotiate."
    },
    {
        icon: <Handshake className="w-8 h-8 text-primary" />,
        title: "Finalize Your Deal",
        description: "Close the deal with confidence. We provide a transparent and secure environment for your transaction."
    },
     {
        icon: <Car className="w-8 h-8 text-primary" />,
        title: "Drive Away Happy",
        description: "Enjoy your new car! Our goal is to make your car buying experience as smooth and enjoyable as possible."
    }
]

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A simple, transparent process to get you behind the wheel.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
                 <Card 
                    key={step.title}
                    className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                >
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                            {step.icon}
                        </div>
                        <CardTitle className="mt-4">{step.title}</CardTitle>
                        <CardDescription className="mt-2">
                        {step.description}
                        </CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
