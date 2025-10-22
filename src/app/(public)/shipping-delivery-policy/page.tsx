
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShippingDeliveryPolicyPage() {
  return (
    <div className="container py-12 md:py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Shipping & Delivery Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. General Information</h2>
          <p>
            Gajanan Motors is a marketplace connecting vehicle buyers and sellers. We do not directly handle the shipping or delivery of vehicles. The transaction, including the delivery and handover of the vehicle, is conducted directly between the buyer and the dealer.
          </p>
          
          <h2>2. Vehicle Handover</h2>
          <p>
            Arrangements for vehicle pickup or delivery must be made directly between the buyer and the selling dealer. We recommend both parties document the vehicle's condition at the time of handover and sign a transfer of ownership form.
          </p>

          <h2>3. Responsibilities</h2>
          <p>
            The buyer and seller are responsible for ensuring all legal and logistical aspects of the vehicle transfer are handled correctly, including but not limited to: RTO paperwork, insurance transfer, and payment of any applicable taxes or fees. Gajanan Motors is not liable for any issues that arise during the shipping, delivery, or handover process.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
