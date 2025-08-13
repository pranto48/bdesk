import { useState, useEffect } from "react";
import { WindowFrame } from "@/components/desktop/WindowFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Settings, Cloud } from "lucide-react";

interface UserProfileProps {
  onClose: () => void;
}

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface CloudConnection {
  id: string;
  provider: string;
  account_email: string | null;
  account_name: string | null;
  is_active: boolean;
}

export const UserProfile = ({ onClose }: UserProfileProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cloudConnections, setCloudConnections] = useState<CloudConnection[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    document.title = "User Profile | bdesk.site";
    loadProfile();
    loadCloudConnections();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUser(user);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      toast({ title: "Error loading profile", description: error.message });
    } else if (data) {
      setProfile(data);
      setDisplayName(data.display_name || "");
    } else {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          display_name: user.user_metadata?.name || "",
          avatar_url: user.user_metadata?.avatar_url || null,
        })
        .select()
        .single();
      
      if (createError) {
        toast({ title: "Error creating profile", description: createError.message });
      } else {
        setProfile(newProfile);
        setDisplayName(newProfile.display_name || "");
      }
    }
  };

  const loadCloudConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("cloud_connections")
      .select("id, provider, account_email, account_name, is_active")
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error loading cloud connections", description: error.message });
    } else {
      setCloudConnections(data || []);
    }
  };

  const updateProfile = async () => {
    if (!profile || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || null })
        .eq("id", user.id);

      if (error) throw error;
      
      toast({ title: "Profile updated successfully" });
      setProfile({ ...profile, display_name: displayName.trim() || null });
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "onedrive":
        return "OneDrive";
      case "googledrive":
        return "Google Drive";
      default:
        return provider;
    }
  };

  const connectCloudService = (provider: string) => {
    toast({ 
      title: "Cloud Integration", 
      description: `${getProviderName(provider)} integration coming soon! OAuth setup required.` 
    });
  };

  return (
    <WindowFrame title="User Profile" onClose={onClose}>
      <main className="h-full overflow-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">User Profile</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Card className="glass border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            <Button onClick={updateProfile} disabled={loading}>
              Update Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="glass border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Cloud Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cloudConnections.length > 0 ? (
              <div className="space-y-2">
                {cloudConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-3 glass rounded border">
                    <div>
                      <p className="font-medium">{getProviderName(connection.provider)}</p>
                      <p className="text-sm text-muted-foreground">
                        {connection.account_email || connection.account_name || "Connected"}
                      </p>
                    </div>
                    <Badge variant={connection.is_active ? "default" : "secondary"}>
                      {connection.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No cloud connections configured
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => connectCloudService("onedrive")}
              >
                Connect OneDrive
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => connectCloudService("googledrive")}
              >
                Connect Google Drive
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </WindowFrame>
  );
};