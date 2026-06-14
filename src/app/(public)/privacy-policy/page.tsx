
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="py-12 md:py-16">
       <div className="max-w-4xl mx-auto animate-fade-in-up">
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-primary/5 pb-8">
            <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Last updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-base md:text-lg p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p>
                At Gajanan Motors, accessible from gajananmotors.com and our mobile application, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by Gajanan Motors and how we use it.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p>We collect information in the following ways:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, and password.</li>
                <li><strong>Identification Documents:</strong> To verify dealers, we collect Aadhar Card, PAN Card, and Shop License images. These are used strictly for identity verification.</li>
                <li><strong>Car Listing Data:</strong> Vehicle details, photos, and registration information.</li>
                <li><strong>Location Data:</strong> Approximate location for filtering nearby cars. Our mobile app may request location permissions to "Detect My Location".</li>
                <li><strong>Media Access:</strong> Our mobile app requests access to your Gallery/Camera to allow you to upload car photos and verification documents.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Data Usage & Safety</h2>
              <p>Your data is used to provide car marketplace services, verify dealer identity, and process payments. We do not sell your personal data to third parties. We use industry-standard encryption to protect your documents.</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
              <p>We use trusted partners: <strong>Firebase</strong> (Data storage), <strong>Razorpay</strong> (Payments), and <strong>Google AI</strong> (Content moderation).</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Contact Information</h2>
              <p>For data deletion requests or privacy inquiries, contact us at <strong>gajananmotors@gmail.com</strong>.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
