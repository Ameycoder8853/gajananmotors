
'use client';

import { Users, Car, Heart } from "lucide-react";

const stats = [
    {
        icon: <Users className="w-10 h-10 text-primary" />,
        value: "50+",
        label: "Verified Dealers"
    },
    {
        icon: <Car className="w-10 h-10 text-primary" />,
        value: "500+",
        label: "Active Listings"
    },
    {
        icon: <Heart className="w-10 h-10 text-primary" />,
        value: "1000+",
        label: "Happy Customers"
    }
];

export function Stats() {
    return (
        <section className="py-16 sm:py-24 bg-background">
            <div className="px-4 md:px-8">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <div 
                            key={stat.label}
                            className="text-center animate-fade-in-up"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="flex justify-center mb-4">
                                {stat.icon}
                            </div>
                            <div className="text-4xl font-extrabold text-primary">{stat.value}</div>
                            <p className="text-lg text-muted-foreground mt-2">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
