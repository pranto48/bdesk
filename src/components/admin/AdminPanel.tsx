import { useEffect, useMemo, useState } from "react";
import { WindowFrame } from "@/components/desktop/WindowFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminPanelProps {
  onClose: () => void;
  isAdmin: boolean;
}

type Folder = { id: string; name: string; parent_id: string | null; is_system: boolean };

export const AdminPanel = ({ onClose, isAdmin }: AdminPanelProps) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | "root">("root");
  const [isSystem, setIsSystem] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Admin Panel | bdesk.site";
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("folders").select("id,name,parent_id,is_system");
      if (error) {
        toast({ title: "Error loading folders", description: error.message });
      } else {
        setFolders(data || []);
      }
    };
    load();
  }, []);

  const parentOptions = useMemo(() => [{ id: "root", name: "(root)" }, ...folders], [folders]);

  const createFolder = async () => {
    if (!isAdmin) {
      toast({ title: "Not authorized" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Folder name required" });
      return;
    }
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("folders").insert({
        name: name.trim(),
        parent_id: parentId === "root" ? null : parentId,
        created_by: user.user?.id ?? null,
        is_system: isSystem,
      });
      if (error) throw error;
      toast({ title: "Folder created" });
      setName("");
      setIsSystem(false);
    } catch (err: any) {
      toast({ title: "Create failed", description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WindowFrame title="Admin Panel" onClose={onClose}>
      <main className="h-full overflow-auto p-4 space-y-6">
        <section>
          <h1 className="text-lg font-semibold">Manage Folders</h1>
          {!isAdmin && (
            <p className="text-sm text-foreground/70 mt-2">You must be an admin to use this panel.</p>
          )}
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder name</Label>
              <Input id="folder-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="New folder" />
            </div>
            <div className="space-y-2">
              <Label>Parent</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  {parentOptions.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-full flex items-center gap-2">
              <Switch id="is-system" checked={isSystem} onCheckedChange={setIsSystem} />
              <Label htmlFor="is-system">Mark as system folder</Label>
            </div>
            <div className="col-span-full">
              <Button onClick={createFolder} disabled={loading || !isAdmin}>Create folder</Button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-medium">Existing system folders</h2>
          <ul className="mt-2 grid sm:grid-cols-2 gap-2 text-sm">
            {folders.filter(f => f.is_system).map(f => (
              <li key={f.id} className="glass rounded-md px-3 py-2 border">{f.name}</li>
            ))}
          </ul>
        </section>
      </main>
    </WindowFrame>
  );
};
