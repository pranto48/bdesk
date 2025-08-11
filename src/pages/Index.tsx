import { useState } from "react";
import wallpaper from "@/assets/wallpaper-hero.jpg";
import DesktopIcon from "@/components/desktop/DesktopIcon";
import { Taskbar } from "@/components/desktop/Taskbar";
import { StartMenu } from "@/components/desktop/StartMenu";
import { FileExplorer } from "@/components/desktop/FileExplorer";
import { Folder, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [startOpen, setStartOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);

  const openExplorer = () => {
    setExplorerOpen(true);
    setStartOpen(false);
    toast({ title: "Opening File Explorer" });
  };

  return (
    <div className="min-h-screen w-full relative" style={{
      backgroundImage: `url(${wallpaper})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <header className="sr-only">
        <h1>Windows-style legal office file share system with File Explorer UI</h1>
        <p>Browse drives and categories, share files, and download via torrent magnet links.</p>
      </header>

      <main className="relative min-h-screen pb-16">
        <div className="p-6 grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-5xl">
          <DesktopIcon Icon={Folder} label="File Explorer" onOpen={openExplorer} />
          <DesktopIcon Icon={Download} label="Downloads" onOpen={() => toast({ title: "Open Downloads" })} />
        </div>

        {explorerOpen && (
          <FileExplorer onClose={() => setExplorerOpen(false)} />
        )}

        <StartMenu open={startOpen} onOpenExplorer={openExplorer} />
      </main>

      <Taskbar
        onToggleStart={() => setStartOpen((v) => !v)}
        onOpenExplorer={openExplorer}
      />
    </div>
  );
};

export default Index;
