import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Files, Trash2, Search, Shield } from "lucide-react";

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
  user_roles?: { role: string }[];
}

interface File {
  id: string;
  name: string;
  size: number | null;
  owner_id: string;
  created_at: string;
  owner_email?: string;
}

interface UserFileManagerProps {
  isAdmin: boolean;
}

export const UserFileManager = ({ isAdmin }: UserFileManagerProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadFiles();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        id,
        display_name,
        user_roles (role)
      `);
    
    if (error) {
      toast({ title: "Error loading users", description: error.message });
      return;
    }

    const usersData = profiles?.map(profile => {
      const roles = Array.isArray(profile.user_roles) ? profile.user_roles : [];
      const role = roles.length > 0 ? roles[0].role : 'user';
      return {
        id: profile.id,
        email: "Profile ID: " + profile.id.slice(0, 8) + "...",
        display_name: profile.display_name || 'No display name',
        role,
        user_roles: roles
      };
    }) || [];
    
    setUsers(usersData);
  };

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from("files")
      .select(`
        id,
        name,
        size,
        owner_id,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading files", description: error.message });
    } else {
      // Get profile names for each file owner
      const filesWithOwner = await Promise.all(
        (data || []).map(async (file) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", file.owner_id)
            .maybeSingle();
          
          return {
            ...file,
            owner_email: profile?.display_name || 'Unknown User'
          };
        })
      );
      setFiles(filesWithOwner);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!isAdmin) return;
    
    setLoading(true);
    const { error } = await supabase.from("files").delete().eq("id", fileId);
    
    if (error) {
      toast({ title: "Delete failed", description: error.message });
    } else {
      toast({ title: "File deleted" });
      loadFiles();
    }
    setLoading(false);
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    if (!isAdmin) return;
    
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      if (currentRole === 'user') {
        // Add admin role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      } else {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        if (error) throw error;
      }
      
      toast({ title: `User role updated to ${newRole}` });
      loadUsers();
    } catch (err: any) {
      toast({ title: "Role update failed", description: err?.message });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Admin access required to manage users and files.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users and files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 glass rounded border">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{user.display_name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role || 'user'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserRole(user.id, user.role || 'user')}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Files className="h-5 w-5" />
              Files ({filteredFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 glass rounded border">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.owner_email} • {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteFile(file.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {filteredFiles.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No files found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};