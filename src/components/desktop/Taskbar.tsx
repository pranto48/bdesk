import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Folder, Download, PanelsTopLeft } from "lucide-react";

interface TaskbarProps {
  onToggleStart: () => void;
  onOpenExplorer: () => void;
}

export const Taskbar = ({ onToggleStart, onOpenExplorer }: TaskbarProps) => {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 glass border-t flex items-center justify-between px-2 z-[1000]">
      <div className="flex items-center gap-2">
        <Button variant="start" size="sm" onClick={onToggleStart} className="px-3 h-10">
          <PanelsTopLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Start</span>
        </Button>

        <div className="ml-1 flex items-center gap-1">
          <Button variant="taskbar" size="icon" aria-label="File Explorer" onClick={onOpenExplorer}>
            <Folder />
          </Button>
          <Button variant="taskbar" size="icon" aria-label="Downloads">
            <Download />
          </Button>
        </div>
      </div>

      <div className="px-3 py-1 rounded-md text-sm text-foreground/80">
        {time}
      </div>
    </nav>
  );
};
