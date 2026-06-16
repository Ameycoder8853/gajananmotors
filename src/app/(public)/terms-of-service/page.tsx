
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfServicePage() {
  return (
    <div className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-primary/5 pb-8">
            <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">Terms & Conditions</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Effective Date: February 2024</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-base md:text-lg p-8 md:p-12 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                <p>Welcome to Gajanan Motors. These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Gajanan Motors (“we”, “us”, or “our”), concerning your access to and use of our website and mobile application.</p>
                <p>Our operational office is located at: <strong>VARDHAMAN PLAZA, SANGLI KOLHAPUR ROAD, Sangli, Maharashtra 416416</strong>.</p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-bold mb-4">2. The Marketplace Platform</h2>
                <p>Gajanan Motors provides an online platform that allows registered dealers to list used vehicles for sale and for potential buyers to browse and contact dealers. We do not own, sell, or inspect the vehicles listed. The actual contract for sale is directly between the buyer and the dealer.</p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Dealer Verification</h2>
                <p>To ensure a safe environment, dealers are required to undergo a verification process. You agree to provide accurate and truthful information, including Aadhar Card, PAN Card, and Shop License. Providing fraudulent documents will lead to immediate account termination and reporting to authorities.</p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Fees and Subscriptions</h2>
                <p>Access to certain features, such as listing vehicles, requires a paid subscription. All payments are processed securely via Razorpay. <strong>All subscription fees are non-refundable</strong> once ad credits have been utilized or the pro status is activated.</p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-bold mb-4">5. User Conduct</h2>
                <p>You agree not to use the platform for any illegal purpose or to bypass the platform's listing limits. Deceptive titles, descriptions, or prices are strictly prohibited and will be removed by our AI moderation system or admin team.</p>
              </section>

              <Separator />

              <section className="bg-muted/50 p-6 rounded-lg border">
                <h2 className="text-xl font-bold mb-4">6. Contact Information</h2>
                <p>If you have any questions regarding these terms, please contact us at:</p>
                <div className="mt-4 text-sm font-semibold">
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
