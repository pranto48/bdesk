import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cloud, File, Folder, LogOut, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
}

export const GoogleDriveConnect = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<GFile[]>([]);
  const [userName, setUserName] = useState("");
  const [clientId, setClientId] = useState<string>(localStorage.getItem("google_client_id") || "");
  const tokenClientRef = useRef<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [gsiReady, setGsiReady] = useState(false);

  useEffect(() => {
    if ((window as any).google && (window as any).google.accounts?.oauth2) {
      setGsiReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setGsiReady(true);
    s.onerror = () => toast({ title: "Failed to load Google SDK", variant: "destructive" });
    document.head.appendChild(s);
  }, []);

  const ensureTokenClient = () => {
    if (!gsiReady) return null;
    if (!tokenClientRef.current) {
      tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile https://www.googleapis.com/auth/drive.metadata.readonly",
        callback: (response: any) => {
          if (response?.access_token) {
            setAccessToken(response.access_token);
            setIsSignedIn(true);
            loadUserAndFiles(response.access_token);
          }
        },
      });
    }
    return tokenClientRef.current;
  };

  const signIn = async () => {
    if (!clientId) {
      toast({ title: "Google Client ID required", variant: "destructive" });
      return;
    }
    const client = ensureTokenClient();
    if (!client) return;
    setLoading(true);
    client.requestAccessToken({ prompt: "consent" });
  };

  const signOut = async () => {
    try {
      if (accessToken && (window as any).google?.accounts?.oauth2?.revoke) {
        (window as any).google.accounts.oauth2.revoke(accessToken, () => {});
      }
      setIsSignedIn(false);
      setFiles([]);
      setUserName("");
      setAccessToken(null);
      toast({ title: "Disconnected Google Drive" });
    } catch (e) {
      console.error(e);
    }
  };

  const loadUserAndFiles = async (token: string) => {
    try {
      setLoading(true);
      const ures = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const u = await ures.json();
      setUserName(u.name || u.email || "Google User");

      const fres = await fetch(
        "https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,modifiedTime,size)",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await fres.json();
      setFiles(data.files || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load Google Drive files", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return "—";
    const b = parseInt(bytes, 10);
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  if (!clientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Cloud className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Set up Google Drive</h2>
        <p className="text-muted-foreground mb-6">Enter your Google OAuth Client ID (Web).</p>
        <div className="w-full max-w-sm space-y-3 text-left">
          <div className="space-y-1">
            <Label htmlFor="google_client_id">Google Client ID</Label>
            <Input id="google_client_id" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com" />
          </div>
          <Button
            onClick={() => {
              if (!clientId.trim()) return;
              localStorage.setItem("google_client_id", clientId.trim());
              toast({ title: "Saved Google settings", description: "Reloading..." });
              setTimeout(() => window.location.reload(), 500);
            }}
            className="w-full mt-2"
          >
            Save and reload
          </Button>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Cloud className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect to Google Drive</h2>
        <p className="text-muted-foreground mb-6">Sign in with your Google account to access your Drive files</p>
        <Button onClick={signIn} disabled={loading || !gsiReady} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Cloud className="h-4 w-4" />
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Google Drive</h2>
          {userName && <p className="text-sm text-muted-foreground">{userName}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>

      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">My Drive</h3>
          <Button variant="outline" size="sm" onClick={() => accessToken && loadUserAndFiles(accessToken)} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Refresh
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {files.length === 0 && !loading ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No files found in your Google Drive</p>
              </Card>
            ) : (
              files.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex items-center gap-3">
                    {item.mimeType === "application/vnd.google-apps.folder" ? (
                      <Folder className="h-5 w-5 text-blue-500" />
                    ) : (
                      <File className="h-5 w-5 text-gray-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(item.modifiedTime)}</span>
                        {item.size && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(item.size)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {item.mimeType === "application/vnd.google-apps.folder" ? "Folder" : "File"}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
