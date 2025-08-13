import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HardDrive, Cloud, Trash2 } from "lucide-react";

interface Drive {
  id: string;
  name: string;
  description: string | null;
  drive_type: string;
  is_public: boolean;
  created_at: string;
}

interface DriveManagerProps {
  isAdmin: boolean;
}

export const DriveManager = ({ isAdmin }: DriveManagerProps) => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [driveType, setDriveType] = useState<string>("local");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    const { data, error } = await supabase
      .from("drives")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast({ title: "Error loading drives", description: error.message });
    } else {
      setDrives(data || []);
    }
  };

  const createDrive = async () => {
    if (!isAdmin) {
      toast({ title: "Not authorized" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Drive name required" });
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("drives").insert({
        name: name.trim(),
        description: description.trim() || null,
        drive_type: driveType,
        is_public: isPublic,
        created_by: user.user?.id,
      });

      if (error) throw error;
      
      toast({ title: "Drive created successfully" });
      setName("");
      setDescription("");
      setDriveType("local");
      setIsPublic(false);
      loadDrives();
    } catch (err: any) {
      toast({ title: "Create failed", description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  const deleteDrive = async (driveId: string) => {
    if (!isAdmin) return;
    
    const { error } = await supabase.from("drives").delete().eq("id", driveId);
    if (error) {
      toast({ title: "Delete failed", description: error.message });
    } else {
      toast({ title: "Drive deleted" });
      loadDrives();
    }
  };

  const getDriveIcon = (type: string) => {
    switch (type) {
      case "onedrive":
      case "googledrive":
        return <Cloud className="h-4 w-4" />;
      default:
        return <HardDrive className="h-4 w-4" />;
    }
  };

  const getDriveTypeLabel = (type: string) => {
    switch (type) {
      case "onedrive":
        return "OneDrive";
      case "googledrive":
        return "Google Drive";
      default:
        return "Local Drive";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Drive Management</h2>
        
        <div className="glass rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drive-name">Drive Name</Label>
              <Input
                id="drive-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Drive"
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label>Drive Type</Label>
              <Select value={driveType} onValueChange={setDriveType} disabled={!isAdmin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Drive</SelectItem>
                  <SelectItem value="onedrive">OneDrive</SelectItem>
                  <SelectItem value="googledrive">Google Drive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="drive-description">Description</Label>
            <Textarea
              id="drive-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this drive"
              disabled={!isAdmin}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={!isAdmin}
            />
            <Label htmlFor="is-public">Make public (visible to all users)</Label>
          </div>

          <Button onClick={createDrive} disabled={loading || !isAdmin}>
            Create Drive
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-3">Existing Drives</h3>
        <div className="grid gap-3">
          {drives.map((drive) => (
            <Card key={drive.id} className="glass border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getDriveIcon(drive.drive_type)}
                    {drive.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={drive.is_public ? "default" : "secondary"}>
                      {drive.is_public ? "Public" : "Private"}
                    </Badge>
                    <Badge variant="outline">
                      {getDriveTypeLabel(drive.drive_type)}
                    </Badge>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDrive(drive.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              {drive.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{drive.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
          {drives.length === 0 && (
            <div className="glass rounded-lg p-8 text-center text-muted-foreground">
              No drives created yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};