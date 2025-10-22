
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CancellationRefundPolicyPage() {
  return (
    <div className="container py-12 md:py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Cancellation & Refund Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Dealer Subscriptions</h2>
          <p>
            Payments made by dealers for subscription plans (e.g., 'Standard', 'Premium') are non-refundable. Once a subscription is purchased and ad credits are allocated, the service is considered rendered. Dealers can choose not to renew their subscription for the following period.
          </p>
          
          <h2>2. Ad Posting and Credits</h2>
          <p>
            Ad credits purchased as part of a subscription plan have no cash value and cannot be refunded or exchanged. If a dealer deletes an ad, the ad credit may be returned to their account, subject to the terms of their subscription plan.
          </p>
          
          <h2>3. Vehicle Purchases</h2>
          <p>
            Gajanan Motors is a platform that connects buyers and sellers. We are not a party to the vehicle transaction itself. Any issues regarding the cancellation of a vehicle purchase or requests for refunds must be settled directly between the buyer and the dealer according to their own agreed-upon terms. We are not responsible for any financial disputes between users.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
