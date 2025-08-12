import { Folder, Download, Shield, LogIn, LogOut, Magnet, Files } from "lucide-react";
import { Magnet as MagnetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StartMenuProps {
  open: boolean;
  onOpenExplorer: () => void;
  onOpenAuth: () => void;
  onOpenMyTorrents: () => void;
  onOpenTorrentCreator: () => void;
  onOpenAdmin: () => void;
  isAdmin?: boolean;
  isSignedIn?: boolean;
  onSignOut?: () => void;
}

export const StartMenu = ({ open, onOpenExplorer, onOpenAuth, onOpenMyTorrents, onOpenTorrentCreator, onOpenAdmin, isAdmin = false, isSignedIn = false, onSignOut }: StartMenuProps) => {
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
        <Button variant="glass" className="justify-start h-12" onClick={onOpenMyTorrents} disabled={!isSignedIn}>
          <Files />
          My Torrents
        </Button>
        <Button variant="glass" className="justify-start h-12" onClick={onOpenTorrentCreator} disabled={!isSignedIn}>
          <Magnet />
          Create Torrent
        </Button>
        <Button variant="glass" className="justify-start h-12" onClick={onOpenAdmin} disabled={!isAdmin}>
          <Shield />
          Admin Panel
        </Button>
        {!isSignedIn ? (
          <Button variant="glass" className="justify-start col-span-2 h-12" onClick={onOpenAuth}>
            <LogIn />
            Sign in / Register
          </Button>
        ) : (
          <Button variant="glass" className="justify-start col-span-2 h-12" onClick={onSignOut}>
            <LogOut />
            Sign out
          </Button>
        )}
      </div>
    </div>
  );
};
