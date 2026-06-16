
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Info, Ban, CheckCircle } from "lucide-react";

export default function DealerPolicyPage() {
  return (
    <div className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-primary/5 pb-8">
            <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">Dealer Listing Policy</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Guidelines for successful and compliant selling on Gajanan Motors.</p>
          </CardHeader>
          <CardContent className="p-8 md:p-12 space-y-10">
            <section className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit"><ShieldCheck className="w-6 h-6 text-primary" /></div>
              <div>
                <h2 className="text-xl font-bold mb-2">1. Identity Verification</h2>
                <p className="text-muted-foreground">All dealers must upload clear, legible copies of their Aadhar Card, PAN Card, and Shop License. Accounts remain in 'Pending' status until our compliance team manually verifies these documents.</p>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit"><Info className="w-6 h-6 text-primary" /></div>
              <div>
                <h2 className="text-xl font-bold mb-2">2. Accuracy of Listings</h2>
                <p className="text-muted-foreground">Every car listing must include actual photos of the vehicle, correct odometer readings (km), and the actual variant name. Number plates must be visible or provided accurately for verification.</p>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit"><Ban className="w-6 h-6 text-primary" /></div>
              <div>
                <h2 className="text-xl font-bold mb-2">3. Prohibited Behavior</h2>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                  <li>Listing vehicles you do not have physical possession of.</li>
                  <li>Posting duplicate ads to bypass credit limits.</li>
                  <li>Using offensive language or inappropriate images.</li>
                  <li>Including contact numbers in images (use the dedicated field).</li>
                </ul>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit"><CheckCircle className="w-6 h-6 text-primary" /></div>
              <div>
                <h2 className="text-xl font-bold mb-2">4. AI Moderation</h2>
                <p className="text-muted-foreground">Our platform uses Google AI to monitor content. Ads flagged for policy violations will be automatically moved to 'Private' status. Dealers can appeal or edit these ads for re-review.</p>
              </div>
            </section>

            <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                <p className="text-amber-800 text-sm font-medium">Failure to comply with these policies may result in account suspension and loss of active subscription credits without refund.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
