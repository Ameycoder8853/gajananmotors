import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account and application settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Settings form will be here.</p>
      </CardContent>
    </Card>
  );
}
