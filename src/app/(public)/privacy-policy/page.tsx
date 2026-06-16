
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
                At Gajanan Motors, accessible from gajananmotors.vercel.app and our mobile application, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by Gajanan Motors and how we use it.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p>We collect information in the following ways:</p>
              <ul className="list-disc pl-6 space-y-2 font-normal">
                <li><strong>Account Information:</strong> Name, email address, phone number, and password.</li>
                <li><strong>Identification Documents:</strong> To verify dealers and prevent fraud, we collect Aadhar Card, PAN Card, and Shop License images. These are used strictly for identity verification.</li>
                <li><strong>Car Listing Data:</strong> Vehicle details, photos, and registration information.</li>
                <li><strong>Location Data:</strong> Approximate location for filtering nearby cars based on your manual selection of City and State.</li>
                <li><strong>Media Access:</strong> Our mobile app requests access to your Gallery/Camera to allow you to upload car photos and verification documents.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Data Usage & Safety</h2>
              <p>Your data is used to provide car marketplace services, verify dealer identity, and process payments. We do not sell your personal data to third parties. We use industry-standard encryption (Firebase Security) to protect your documents.</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
              <p>We use trusted partners for core functionality:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Firebase:</strong> Secure data storage and authentication.</li>
                <li><strong>Razorpay:</strong> Secure payment processing for subscriptions.</li>
                <li><strong>Google AI:</strong> Automated ad content moderation.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Account Deletion</h2>
              <p>Users can delete their account at any time via the <strong>Settings</strong> page. Deleting your account permanently removes all personal data, car listings, and uploaded documents from our servers.</p>
            </section>

            <Separator />

            <section className="bg-muted/50 p-6 rounded-lg border">
              <h2 className="text-xl font-bold mb-4">6. Grievance Officer</h2>
              <p className="text-sm">In accordance with Information Technology Act 2000 and rules made there under, the name and contact details of the Grievance Officer are provided below:</p>
              <div className="mt-4 text-sm font-semibold space-y-1">
                <p>Name: Amey Patil</p>
                <p>Address: VARDHAMAN PLAZA, SANGLI KOLHAPUR ROAD, Sangli, Maharashtra 416416</p>
                <p>Email: gajananmotors@gmail.com</p>
                <p>Phone: +91 8999809224</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
