import { useMemo, useState, useEffect } from "react";
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
      // TODO: Replace with actual API call to server file system
      // For now, using mock data
      const mockItems: FileSystemItem[] = [
        { id: "1", name: "Documents", type: "folder", path: `${path}/Documents`, modified: new Date() },
        { id: "2", name: "Images", type: "folder", path: `${path}/Images`, modified: new Date() },
        { id: "3", name: "readme.txt", type: "file", path: `${path}/readme.txt`, size: 1024, modified: new Date() },
        { id: "4", name: "config.json", type: "file", path: `${path}/config.json`, size: 2048, modified: new Date() },
      ];
      setItems(mockItems);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load directory contents",
        variant: "destructive",
      });
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
        // TODO: API call to create folder
        toast({
          title: "Folder created",
          description: `Created folder: ${newFolderName}`,
        });
        setNewFolderName("");
        setShowCreateFolder(false);
        loadItems(currentPath);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create folder",
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
      if (clipboard.operation === 'copy') {
        // TODO: API call to copy file/folder
        toast({
          title: "Pasted",
          description: `${clipboard.item.name} copied to ${currentPath}`,
        });
      } else {
        // TODO: API call to move file/folder
        toast({
          title: "Moved",
          description: `${clipboard.item.name} moved to ${currentPath}`,
        });
        setClipboard(null);
      }
      loadItems(currentPath);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to paste item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: FileSystemItem) => {
    try {
      // TODO: API call to delete file/folder
      toast({
        title: "Deleted",
        description: `${item.name} deleted`,
        variant: "destructive",
      });
      loadItems(currentPath);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
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
        <div className="border-b p-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadItems(currentPath)}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
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
          <main className="col-span-8 md:col-span-9 p-3 overflow-auto">
            <div className="mb-3 text-sm text-foreground/70">{currentPath}</div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {items.map((item) => {
                  const ItemContent = (
                    <article className="flex flex-col items-center justify-center h-32 rounded-md hover:bg-foreground/5 p-2 cursor-pointer">
                      {item.type === "folder" ? (
                        <Folder className="h-8 w-8 text-foreground mb-2" />
                      ) : (
                        <FileText className="h-8 w-8 text-foreground mb-2" />
                      )}
                      <div className="text-xs text-center line-clamp-2 mb-1">{item.name}</div>
                      {item.size && (
                        <div className="text-xs text-foreground/60">{formatFileSize(item.size)}</div>
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
