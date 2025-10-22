
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container py-12 md:py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to Gajanan Motors. By accessing our website, you agree to be
            bound by these terms of service, all applicable laws and regulations,
            and agree that you are responsible for compliance with any applicable
            local laws.
          </p>
          
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials
            (information or software) on Gajanan Motors' website for personal,
            non-commercial transitory viewing only. This is the grant of a license,
            not a transfer of title.
          </p>
          
          <h2>3. Disclaimer</h2>
          <p>
            The materials on Gajanan Motors' website are provided on an 'as is'
            basis. Gajanan Motors makes no warranties, expressed or implied, and
            hereby disclaims and negates all other warranties including, without
            limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of intellectual
            property or other violation of rights.
          </p>
          
          <h2>4. Limitations</h2>
          <p>
            In no event shall Gajanan Motors or its suppliers be liable for any
            damages (including, without limitation, damages for loss of data or
            profit, or due to business interruption) arising out of the use or
            inability to use the materials on Gajanan Motors' website.
          </p>

          <h2>5. Modifications</h2>
          <p>
            Gajanan Motors may revise these terms of service for its website at any
            time without notice. By using this website you are agreeing to be bound
            by the then current version of these terms of service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
