import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CommissionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commissions</CardTitle>
        <CardDescription>
          View and manage commissions from sold listings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Commission data will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
