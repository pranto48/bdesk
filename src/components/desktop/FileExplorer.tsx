import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HardDrive, Folder, FileText, Magnet, Download, FolderPlus, Edit, Trash2, Settings, Copy, Scissors, Clipboard, RefreshCw } from "lucide-react";
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

type FileSystemItem = { 
  id: string; 
  name: string; 
  type: "folder" | "file"; 
  path: string;
  size?: number;
  modified?: Date;
  magnet?: string;
};

type ClipboardItem = {
  item: FileSystemItem;
  operation: 'cut' | 'copy';
};

export const FileExplorer = ({ onClose, isAdmin = false }: FileExplorerProps) => {
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [currentPath, setCurrentPath] = useState("/");
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);
  const { toast } = useToast();

  const drives = [
    { id: "root", name: "Root (/)", path: "/", icon: HardDrive },
    { id: "home", name: "Home", path: "/home", icon: HardDrive },
    { id: "tmp", name: "Temp", path: "/tmp", icon: HardDrive },
  ];

  // Load file system items from server
  const loadItems = async (path: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('file-manager', {
        body: {},
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      const response = await fetch(`https://xrdyvbeaferrnthoguaw.supabase.co/functions/v1/file-manager?action=list&path=${encodeURIComponent(path)}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHl2YmVhZmVycm50aG9ndWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODY2NjgsImV4cCI6MjA3MDQ2MjY2OH0.vGsS1Sffgix-iLifOOsYA1A1IDb1mLUwdbfGez6qH0Y',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch directory');

      const result = await response.json();
      setItems(result.items || []);
    } catch (error: any) {
      console.error('Load items error:', error);
      toast({
        title: "Error",
        description: `Failed to load directory: ${error.message}`,
        variant: "destructive",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(currentPath);
  }, [currentPath]);

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        const response = await fetch(`https://xrdyvbeaferrnthoguaw.supabase.co/functions/v1/file-manager?action=create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHl2YmVhZmVycm50aG9ndWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODY2NjgsImV4cCI6MjA3MDQ2MjY2OH0.vGsS1Sffgix-iLifOOsYA1A1IDb1mLUwdbfGez6qH0Y',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: currentPath,
            name: newFolderName,
          }),
        });

        if (!response.ok) throw new Error('Failed to create folder');

        toast({
          title: "Folder created",
          description: `Created folder: ${newFolderName}`,
        });
        setNewFolderName("");
        setShowCreateFolder(false);
        loadItems(currentPath);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to create folder: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleCopy = (item: FileSystemItem) => {
    setClipboard({ item, operation: 'copy' });
    toast({
      title: "Copied",
      description: `${item.name} copied to clipboard`,
    });
  };

  const handleCut = (item: FileSystemItem) => {
    setClipboard({ item, operation: 'cut' });
    toast({
      title: "Cut",
      description: `${item.name} cut to clipboard`,
    });
  };

  const handlePaste = async () => {
    if (!clipboard) return;

    try {
      const destinationPath = `${currentPath}/${clipboard.item.name}`.replace('//', '/');
      
      if (clipboard.operation === 'copy') {
        const response = await fetch(`https://xrdyvbeaferrnthoguaw.supabase.co/functions/v1/file-manager?action=copy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHl2YmVhZmVycm50aG9ndWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODY2NjgsImV4cCI6MjA3MDQ2MjY2OH0.vGsS1Sffgix-iLifOOsYA1A1IDb1mLUwdbfGez6qH0Y',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourcePath: clipboard.item.path,
            destinationPath,
          }),
        });

        if (!response.ok) throw new Error('Failed to copy');

        toast({
          title: "Pasted",
          description: `${clipboard.item.name} copied to ${currentPath}`,
        });
      } else {
        const response = await fetch(`https://xrdyvbeaferrnthoguaw.supabase.co/functions/v1/file-manager?action=move`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHl2YmVhZmVycm50aG9ndWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODY2NjgsImV4cCI6MjA3MDQ2MjY2OH0.vGsS1Sffgix-iLifOOsYA1A1IDb1mLUwdbfGez6qH0Y',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourcePath: clipboard.item.path,
            destinationPath,
          }),
        });

        if (!response.ok) throw new Error('Failed to move');

        toast({
          title: "Moved",
          description: `${clipboard.item.name} moved to ${currentPath}`,
        });
        setClipboard(null);
      }
      loadItems(currentPath);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to paste item: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: FileSystemItem) => {
    try {
      const response = await fetch(`https://xrdyvbeaferrnthoguaw.supabase.co/functions/v1/file-manager?action=delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHl2YmVhZmVycm50aG9ndWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODY2NjgsImV4cCI6MjA3MDQ2MjY2OH0.vGsS1Sffgix-iLifOOsYA1A1IDb1mLUwdbfGez6qH0Y',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: item.path,
        }),
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast({
        title: "Deleted",
        description: `${item.name} deleted`,
        variant: "destructive",
      });
      loadItems(currentPath);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete item: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleRename = (item: FileSystemItem) => {
    // TODO: Implement rename functionality
    toast({
      title: "Rename",
      description: "Rename functionality will be implemented",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <WindowFrame title={`File Explorer - ${currentPath}`} onClose={onClose}>
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-2 flex items-center gap-2 bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadItems(currentPath)}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {currentPath !== '/' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
                setCurrentPath(parentPath);
              }}
            >
              ← Up
            </Button>
          )}
          {clipboard && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePaste}
            >
              <Clipboard className="h-4 w-4 mr-1" />
              Paste
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateFolder(true)}
          >
            <FolderPlus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
        </div>

        <div className="flex-1 grid grid-cols-12">
          {/* Sidebar */}
          <aside className="col-span-4 md:col-span-3 border-r p-3">
            <div className="text-xs font-medium text-foreground/60 mb-2">Drives</div>
            <nav className="space-y-1">
              {drives.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setCurrentPath(d.path)}
                  className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground ${
                    currentPath === d.path ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <d.icon className="h-4 w-4" />
                  <span className="text-sm">{d.name}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="col-span-8 md:col-span-9 p-3 overflow-auto bg-background">
            <div className="mb-3 text-sm text-muted-foreground flex items-center gap-1">
              {currentPath.split('/').filter(Boolean).reduce((acc: JSX.Element[], segment: string, index: number, arr: string[]) => {
                const path = '/' + arr.slice(0, index + 1).join('/');
                acc.push(
                  <button
                    key={path}
                    onClick={() => setCurrentPath(path)}
                    className="hover:text-foreground hover:underline"
                  >
                    {segment}
                  </button>
                );
                if (index < arr.length - 1) {
                  acc.push(<span key={`sep-${index}`}>/</span>);
                }
                return acc;
              }, [
                <button
                  key="root"
                  onClick={() => setCurrentPath('/')}
                  className="hover:text-foreground hover:underline"
                >
                  root
                </button>
              ])}
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                {items.map((item) => {
                  const ItemContent = (
                    <article className="flex flex-col items-center justify-center h-24 rounded-lg hover:bg-accent/50 p-2 cursor-pointer transition-colors border border-transparent hover:border-border">
                      {item.type === "folder" ? (
                        <Folder className="h-6 w-6 text-blue-500 mb-1" />
                      ) : (
                        <FileText className="h-6 w-6 text-muted-foreground mb-1" />
                      )}
                      <div className="text-xs text-center line-clamp-2 mb-1 max-w-full break-words">
                        {item.name}
                      </div>
                      {item.size && (
                        <div className="text-xs text-muted-foreground">{formatFileSize(item.size)}</div>
                      )}
                    </article>
                  );

                  return (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger>
                        <div
                          onDoubleClick={() => {
                            if (item.type === "folder") {
                              setCurrentPath(item.path);
                            }
                          }}
                        >
                          {ItemContent}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => handleCopy(item)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleCut(item)}>
                          <Scissors className="h-4 w-4 mr-2" />
                          Cut
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => handleRename(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </ContextMenuItem>
                        <ContextMenuItem 
                          onClick={() => handleDelete(item)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </ContextMenuItem>
                        {item.type === "folder" && isAdmin && (
                          <>
                            <ContextMenuSeparator />
                            <ContextMenuItem onClick={() => setShowCreateFolder(true)}>
                              <FolderPlus className="h-4 w-4 mr-2" />
                              New Folder
                            </ContextMenuItem>
                          </>
                        )}
                        <ContextMenuSeparator />
                        <ContextMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Properties
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </section>
            )}
          </main>
        </div>
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
