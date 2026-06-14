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
                At Gajanan Motors, accessible from gajananmotors.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Gajanan Motors and how we use it.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p>We collect information in the following ways:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> When you register as a dealer, we collect your name, email address, phone number, and password.</li>
                <li><strong>Dealer Verification Documents:</strong> To maintain a trusted marketplace, we require dealers to submit copies of their Aadhar Card, PAN Card, and Shop License. This information is stored securely and used only for internal verification purposes.</li>
                <li><strong>Car Listing Data:</strong> When you post an ad, we collect details about the vehicle, including make, model, year, kilometers driven, and your vehicle's number plate.</li>
                <li><strong>Location Data:</strong> We may collect your city and state to show you relevant local car listings. If you use our "Detect My Location" feature, we access your device's geolocation with your explicit permission.</li>
                <li><strong>Payment Information:</strong> Subscription payments are processed via Razorpay. We do not store your credit card or bank details on our servers. Razorpay collects this data according to their own privacy policy.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Facilitate the buying and selling of used cars.</li>
                <li>Verify the identity of dealers to prevent fraud.</li>
                <li>Operate and maintain our AI-powered ad moderation system (using Google Genkit/Gemini) to ensure all listings comply with our quality standards.</li>
                <li>Personalize your experience by showing cars available in your selected location.</li>
                <li>Communicate with you regarding your account, subscription status, or customer support inquiries via Resend (email service).</li>
                <li>Improve our marketplace features and user interface.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
              <p>
                We use several trusted third-party services to power our platform. These services may collect information used to identify you:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Firebase:</strong> Used for authentication, database storage, and file hosting.</li>
                <li><strong>Razorpay:</strong> Used for processing subscription payments securely.</li>
                <li><strong>Resend:</strong> Used for sending transaction and contact emails.</li>
                <li><strong>Google Generative AI (Genkit):</strong> Used for automated ad moderation of text and images.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Security of Your Data</h2>
              <p>
                We take the security of your documents (Aadhar, PAN, Shop License) very seriously. All sensitive documents are stored in encrypted cloud storage buckets. Access is restricted to authorized personnel only for the sole purpose of dealer verification.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p>
                You have the right to request access to the personal data we hold about you, to request corrections, or to request deletion of your account. Please note that deleting your account will also remove all your active listings.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
              <p>
                If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us:
              </p>
              <p className="mt-2 font-semibold text-primary">
                Email: gajananmotors@gmail.com<br />
                Phone: +91 8999809224
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
