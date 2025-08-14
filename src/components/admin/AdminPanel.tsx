import { WindowFrame } from "@/components/desktop/WindowFrame";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Settings, Activity } from "lucide-react";

interface AdminPanelProps {
  onClose: () => void;
  isAdmin: boolean;
}

type Folder = { id: string; name: string; parent_id: string | null; is_system: boolean };

export const AdminPanel = ({ onClose, isAdmin }: AdminPanelProps) => {
  if (!isAdmin) {
    return (
      <WindowFrame title="Admin Panel" onClose={onClose}>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">You must be an admin to access this panel.</p>
        </div>
      </WindowFrame>
    );
  }

  return (
    <WindowFrame title="Admin Panel" onClose={onClose}>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">System Administration</h2>
          <p className="text-muted-foreground">Manage system-wide settings and configurations</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
              <CardDescription>
                Monitor and manage database connections and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Database Stats
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure global system preferences and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Manage Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Monitor
              </CardTitle>
              <CardDescription>
                View system logs and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </WindowFrame>
  );
};
