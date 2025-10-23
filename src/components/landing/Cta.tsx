
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

export function Cta() {
    return (
        <section className="py-16 sm:py-24">
            <div className="px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-primary/10 rounded-lg p-8 md:p-12 text-center animate-fade-in-up">
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-primary">
                            Ready to Find Your Next Car?
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                            Join thousands of satisfied customers and dealers. Your perfect car or next sale is just a click away.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
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
                </div>
            </div>
        </section>
    );
}
