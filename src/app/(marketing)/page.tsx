
'use client';

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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendContactEmail } from "@/ai/flows/send-contact-email";
import Head from "next/head";


const contactFormSchema = z.object({
    name: z.string().min(2, { message: 'Please enter your name.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
    message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

function ContactForm() {
    const { toast } = useToast();

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    });

    const onSubmit = async (values: ContactFormValues) => {
        try {
            await sendContactEmail(values);
            toast({
                title: 'Message Sent!',
                description: "We've received your message and will get back to you shortly.",
            });
            form.reset();
        } catch (error) {
            console.error("Failed to send contact email:", error);
            toast({
                variant: 'destructive',
                title: 'Failed to Send',
                description: 'There was an error sending your message. Please try again later.',
            });
        }
    };

    return (
        <section id="contact" className="py-16 sm:py-24 bg-secondary">
            <div className="px-4 md:px-8">
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
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="Your Email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                 <FormLabel className="sr-only">Subject</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Subject" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel className="sr-only">Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        className="min-h-[120px]"
                                                        placeholder="Your Message"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="sm:col-span-2 text-center">
                                        <Button size="lg" type="submit" className="transition-transform duration-300 hover:scale-105" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

// Structured Data for SEO
const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutomobileDealer",
    "name": "Gajanan Motors",
    "url": process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    "logo": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo-dark.svg`,
    "description": "Gajanan Motors is your trusted partner for buying and selling quality used cars. Browse our verified listings from trusted dealers and find your dream car today.",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "VARDHAMAN PLAZA, SANGLI KOLHAPUR ROAD",
        "addressLocality": "Sangli",
        "addressRegion": "MAHARASHTRA",
        "postalCode": "416416",
        "addressCountry": "IN"
    },
    "telephone": "+91-8999809224"
};

export default function LandingPage() {
  return (
    <>
    <Head>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    </Head>
    <div className="relative">
      <Hero />
      <div className="relative bg-background z-10">
        <Features />
        <FeaturedCars />
        <Stats />
        <HowItWorks />
        <Testimonials />
        <Faq />
        <Cta />
        <ContactForm />
      </div>
    </div>
    </>
  );
}
