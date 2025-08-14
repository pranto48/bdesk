import { useMemo, useState } from "react";
import { HardDrive, Folder, FileText, Magnet, Download, FolderPlus, Edit, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowFrame } from "./WindowFrame";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FileExplorerProps {
  onClose: () => void;
  isAdmin?: boolean;
}

type Item = { id: string; name: string; type: "folder" | "file"; magnet?: string };

export const FileExplorer = ({ onClose, isAdmin = false }: FileExplorerProps) => {
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { toast } = useToast();
  const drives = [
    { id: "office", name: "Office", icon: HardDrive },
    { id: "shared", name: "Shared", icon: HardDrive },
    { id: "archive", name: "Archive", icon: HardDrive },
  ];

  const items: Item[] = useMemo(() => (
    [
      { id: "reports", name: "Reports", type: "folder" },
      { id: "policies", name: "Policies", type: "folder" },
      { id: "contract", name: "Q3-Contract.pdf", type: "file", magnet: "magnet:?xt=urn:btih:dummyhash123&dn=Q3-Contract.pdf" },
      { id: "handbook", name: "Employee-Handbook.docx", type: "file", magnet: "magnet:?xt=urn:btih:dummyhash456&dn=Employee-Handbook.docx" },
    ]
  ), []);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // TODO: Implement folder creation logic with Supabase
      toast({
        title: "Folder created",
        description: `Created folder: ${newFolderName}`,
      });
      setNewFolderName("");
      setShowCreateFolder(false);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    // TODO: Implement folder rename logic
    toast({
      title: "Rename folder",
      description: "Rename functionality will be implemented",
    });
  };

  const handleDeleteFolder = (folderId: string) => {
    // TODO: Implement folder deletion logic
    toast({
      title: "Delete folder",
      description: "Delete functionality will be implemented",
      variant: "destructive",
    });
  };

  return (
    <WindowFrame title="File Explorer" onClose={onClose}>
      <div className="h-full grid grid-cols-12">
        <aside className="col-span-4 md:col-span-3 border-r p-3">
          <div className="text-xs font-medium text-foreground/60 mb-2">Drives</div>
          <nav className="space-y-1">
            {drives.map((d) => (
              <button key={d.id} className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground">
                <d.icon className="h-4 w-4" />
                <span className="text-sm">{d.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-4 text-xs font-medium text-foreground/60 mb-2">Quick access</div>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground">
              <Download className="h-4 w-4" />
              <span className="text-sm">Downloads</span>
            </button>
          </nav>
        </aside>

        <main className="col-span-8 md:col-span-9 p-3 overflow-auto">
          <div className="mb-3 text-sm text-foreground/70">This PC / Office</div>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.map((it) => {
              const ItemContent = (
                <article className="flex flex-col items-center justify-center h-28 rounded-md hover:bg-foreground/5 p-2">
                  {it.type === "folder" ? (
                    <Folder className="h-8 w-8 text-foreground mb-2" />
                  ) : (
                    <FileText className="h-8 w-8 text-foreground mb-2" />
                  )}
                  <div className="text-xs text-center line-clamp-2">{it.name}</div>
                  {it.magnet && (
                    <a
                      className="mt-1 inline-flex items-center gap-1 text-xs story-link"
                      href={it.magnet}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Download ${it.name} via magnet link`}
                    >
                      <Magnet className="h-3 w-3" /> Get Magnet
                    </a>
                  )}
                </article>
              );

              if (it.type === "folder" && isAdmin) {
                return (
                  <ContextMenu key={it.id}>
                    <ContextMenuTrigger>
                      {ItemContent}
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => setShowCreateFolder(true)}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Create Subfolder
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleRenameFolder(it.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Rename Folder
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem 
                        onClick={() => handleDeleteFolder(it.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Folder
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Properties
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              }

              return <div key={it.id}>{ItemContent}</div>;
            })}
          </section>
        </main>
      </div>

      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right">
                Name
              </Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                placeholder="Enter folder name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WindowFrame>
  );
};
