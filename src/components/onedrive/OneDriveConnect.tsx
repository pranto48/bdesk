import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Cloud, File, Folder, LogOut, Loader2 } from "lucide-react";
import { msalInstance, loginRequest, initializeMsal } from "@/integrations/msal/msal";
import { Client } from "@microsoft/microsoft-graph-client";
import { toast } from "@/hooks/use-toast";

interface DriveItem {
  id: string;
  name: string;
  folder?: any;
  file?: any;
  size?: number;
  lastModifiedDateTime: string;
}

export const OneDriveConnect = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [driveItems, setDriveItems] = useState<DriveItem[]>([]);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    initializeMsal().then(() => {
      checkAuthStatus();
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        setIsSignedIn(true);
        // Try to get user info and files
        await getUserInfo();
        await getDriveItems();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const signIn = async () => {
    try {
      setLoading(true);
      const response = await msalInstance.loginPopup(loginRequest);
      if (response.account) {
        setIsSignedIn(true);
        await getUserInfo();
        await getDriveItems();
        toast({ title: "Successfully signed in to OneDrive" });
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      toast({ 
        title: "Sign in failed", 
        description: "Please check your configuration and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await msalInstance.logoutPopup();
      setIsSignedIn(false);
      setDriveItems([]);
      setUserName("");
      toast({ title: "Signed out of OneDrive" });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const getUserInfo = async () => {
    try {
      const account = msalInstance.getAllAccounts()[0];
      if (account) {
        const tokenResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        
        const graphClient = Client.init({
          authProvider: (done) => {
            done(null, tokenResponse.accessToken);
          },
        });

        const user = await graphClient.api('/me').get();
        setUserName(user.displayName || user.userPrincipalName);
      }
    } catch (error) {
      console.error("Failed to get user info:", error);
    }
  };

  const getDriveItems = async () => {
    try {
      setLoading(true);
      const account = msalInstance.getAllAccounts()[0];
      if (!account) return;

      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

      const graphClient = Client.init({
        authProvider: (done) => {
          done(null, tokenResponse.accessToken);
        },
      });

      const response = await graphClient.api('/me/drive/root/children').get();
      setDriveItems(response.value || []);
    } catch (error) {
      console.error("Failed to get drive items:", error);
      toast({ 
        title: "Failed to load OneDrive files", 
        description: "Please try signing in again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Cloud className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect to OneDrive</h2>
        <p className="text-muted-foreground mb-6">
          Sign in with your Microsoft account to access your OneDrive files
        </p>
        <Button onClick={signIn} disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Cloud className="h-4 w-4" />
          Sign in with Microsoft
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">OneDrive</h2>
          {userName && <p className="text-sm text-muted-foreground">{userName}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>

      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Root Folder</h3>
          <Button variant="outline" size="sm" onClick={getDriveItems} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Refresh
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {driveItems.length === 0 && !loading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No files found in your OneDrive root folder</p>
                </CardContent>
              </Card>
            ) : (
              driveItems.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex items-center gap-3">
                    {item.folder ? (
                      <Folder className="h-5 w-5 text-blue-500" />
                    ) : (
                      <File className="h-5 w-5 text-gray-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(item.lastModifiedDateTime)}</span>
                        {item.file && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(item.size)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {item.folder ? "Folder" : "File"}
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