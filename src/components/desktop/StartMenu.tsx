import { Folder, Download, Shield, LogIn, LogOut, Magnet, Files, User, Settings } from "lucide-react";
import { Magnet as MagnetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StartMenuProps {
  open: boolean;
  onOpenExplorer: () => void;
  onOpenAuth: () => void;
  onOpenMyTorrents: () => void;
  onOpenTorrentCreator: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onOpenControlPanel: () => void;
  isAdmin?: boolean;
  isSignedIn?: boolean;
  onSignOut?: () => void;
}

export const StartMenu = ({ open, onOpenExplorer, onOpenAuth, onOpenMyTorrents, onOpenTorrentCreator, onOpenAdmin, onOpenProfile, onOpenControlPanel, isAdmin = false, isSignedIn = false, onSignOut }: StartMenuProps) => {
  if (!open) return null;
  return (
    <div
      className="fixed bottom-16 left-2 w-80 max-w-[calc(100vw-1rem)] glass elevated rounded-xl border p-3 animate-enter z-40"
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
        <Button variant="glass" className="justify-start h-12" onClick={onOpenProfile} disabled={!isSignedIn}>
          <User />
          Profile
        </Button>
        <Button variant="glass" className="justify-start h-12" onClick={onOpenControlPanel} disabled={!isAdmin}>
          <Settings />
          Control Panel
        </Button>
        {!isSignedIn ? (
          <Button variant="glass" className="justify-start h-12" onClick={onOpenAuth}>
            <LogIn />
            Sign in / Register
          </Button>
        ) : (
          <Button variant="glass" className="justify-start h-12" onClick={onSignOut}>
            <LogOut />
            Sign out
          </Button>
        )}
      </div>
    </div>
  );
};