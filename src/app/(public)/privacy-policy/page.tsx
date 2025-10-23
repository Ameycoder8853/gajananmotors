
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="px-8 py-12 md:py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, post an ad, or communicate with us. This may include your name, email address, phone number, and any other information you choose to provide.
          </p>
          
          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to operate, maintain, and provide the features and functionality of the Gajanan Motors platform, including:
          </p>
          <ul>
            <li>Connecting buyers with dealers.</li>
            <li>Processing subscription payments.</li>
            <li>Moderating content to ensure a safe marketplace.</li>
            <li>Communicating with you about your account and our services.</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We may share your contact information with other users when you express interest in a vehicle or when a buyer expresses interest in your listing. We do not sell your personal information to third parties.
          </p>
          
          <h2>4. Data Security</h2>
          <p>
            We use reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
