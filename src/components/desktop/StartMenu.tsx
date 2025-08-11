import { Folder, Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StartMenuProps {
  open: boolean;
  onOpenExplorer: () => void;
}

export const StartMenu = ({ open, onOpenExplorer }: StartMenuProps) => {
  if (!open) return null;
  return (
    <div
      className="absolute bottom-16 left-2 w-[22rem] glass elevated rounded-xl border p-3 animate-enter z-40"
      role="dialog"
      aria-label="Start menu"
    >
      <div className="mb-2 text-sm font-medium text-foreground/70 px-2">Quick actions</div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="glass" className="justify-start h-12" onClick={onOpenExplorer}>
          <Folder />
          File Explorer
        </Button>
        <Button variant="glass" className="justify-start h-12">
          <Download />
          Downloads
        </Button>
        <Button variant="glass" className="justify-start col-span-2 h-12" disabled>
          <Shield />
          Admin Panel (coming soon)
        </Button>
      </div>
    </div>
  );
};
