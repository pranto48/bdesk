import { useEffect, useRef, useState } from "react";
import wallpaper from "@/assets/wallpaper-hero.jpg";
import DesktopIcon from "@/components/desktop/DesktopIcon";
import { Taskbar } from "@/components/desktop/Taskbar";
import { StartMenu } from "@/components/desktop/StartMenu";
import { FileExplorer } from "@/components/desktop/FileExplorer";
import { Folder, Download, Recycle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AuthWindow } from "@/components/auth/AuthWindow";
import { MyTorrents } from "@/components/torrents/MyTorrents";
import { TorrentCreator } from "@/components/torrents/TorrentCreator";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { UserProfile } from "@/components/profile/UserProfile";
import { supabase } from "@/integrations/supabase/client";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator, ContextMenuLabel } from "@/components/ui/context-menu";
import { type LucideIcon } from "lucide-react";

const Index = () => {
  const [startOpen, setStartOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [myTorrentsOpen, setMyTorrentsOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  type DesktopItem = { id: string; label: string; Icon: LucideIcon; x: number; y: number; onOpen?: () => void; deleted?: boolean };
  const [items, setItems] = useState<DesktopItem[]>([
    { id: "explorer", label: "File Explorer", Icon: Folder, x: 24, y: 24, onOpen: () => openExplorer() },
    { id: "downloads", label: "Downloads", Icon: Download, x: 24, y: 120, onOpen: () => toast({ title: "Open Downloads" }) },
    { id: "recycle", label: "Recycle Bin", Icon: Recycle, x: 24, y: 216, onOpen: () => toast({ title: "Recycle Bin is empty" }) },
  ]);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const draggingRef = useRef<{ id: string | null; offsetX: number; offsetY: number }>({ id: null, offsetX: 0, offsetY: 0 });
  const onPointerMove = (e: PointerEvent) => {
    const { id, offsetX, offsetY } = draggingRef.current;
    if (!id) return;
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, x: e.clientX - offsetX, y: e.clientY - offsetY } : it));
  };
  const onPointerUp = () => {
    const { id } = draggingRef.current;
    window.removeEventListener('pointermove', onPointerMove);
    if (!id || id === 'recycle') { draggingRef.current.id = null; return; }
    const recycleEl = refs.current['recycle'];
    const draggedEl = refs.current[id];
    draggingRef.current.id = null;
    if (!recycleEl || !draggedEl) return;
    const r1 = draggedEl.getBoundingClientRect();
    const r2 = recycleEl.getBoundingClientRect();
    const intersects = !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
    if (intersects) {
      setItems((prev) => prev.map((it) => it.id === id ? { ...it, deleted: true } : it));
      const removed = items.find((it) => it.id === id)?.label ?? 'Item';
      toast({ title: `${removed} moved to Recycle Bin` });
    }
  };
  const onPointerDown = (id: string) => (e: React.PointerEvent) => {
    const el = refs.current[id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    draggingRef.current = { id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  };

  useEffect(() => {
    // Auth state management
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const signedIn = !!session?.user;
      setIsSignedIn(signedIn);
      if (signedIn) {
        setTimeout(async () => {
          const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', session!.user!.id);
          if (!error) setIsAdmin(!!data?.find(r => r.role === 'admin'));
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      const signedIn = !!session?.user;
      setIsSignedIn(signedIn);
      if (signedIn) {
        supabase.from('user_roles').select('role').eq('user_id', session!.user!.id).then(({ data }) => {
          setIsAdmin(!!data?.find(r => r.role === 'admin'));
        });
      }
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  const openExplorer = () => {
    setExplorerOpen(true);
    setStartOpen(false);
    toast({ title: "Opening File Explorer" });
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
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
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="relative w-full h-full">
              {items.filter((i) => !i.deleted).map((it) => (
                <div
                  key={it.id}
                  ref={(el) => (refs.current[it.id] = el)}
                  className="absolute"
                  style={{ top: it.y, left: it.x }}
                  onPointerDown={onPointerDown(it.id)}
                  onDoubleClick={it.onOpen}
                  role="button"
                  aria-label={`${it.label} icon`}
                >
                  <DesktopIcon Icon={it.Icon} label={it.label} onOpen={it.onOpen} />
                </div>
              ))}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Desktop</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => window.location.reload()}>Refresh</ContextMenuItem>
            <ContextMenuItem onSelect={() => toast({ title: "New Folder coming soon" })}>New Folder</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {explorerOpen && (
          <FileExplorer onClose={() => setExplorerOpen(false)} />
        )}
        {authOpen && <AuthWindow onClose={() => setAuthOpen(false)} />}
        {myTorrentsOpen && <MyTorrents onClose={() => setMyTorrentsOpen(false)} />}
        {creatorOpen && <TorrentCreator onClose={() => setCreatorOpen(false)} />}
        {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} isAdmin={isAdmin} />}
        {profileOpen && <UserProfile onClose={() => setProfileOpen(false)} />}

        <StartMenu
          open={startOpen}
          onOpenExplorer={openExplorer}
          onOpenAuth={() => { setAuthOpen(true); setStartOpen(false); }}
          onOpenMyTorrents={() => { setMyTorrentsOpen(true); setStartOpen(false); }}
          onOpenTorrentCreator={() => { setCreatorOpen(true); setStartOpen(false); }}
          onOpenAdmin={() => { setAdminOpen(true); setStartOpen(false); }}
          onOpenProfile={() => { setProfileOpen(true); setStartOpen(false); }}
          isAdmin={isAdmin}
          isSignedIn={isSignedIn}
          onSignOut={onSignOut}
        />
      </main>

      <Taskbar
        onToggleStart={() => setStartOpen((v) => !v)}
        onOpenExplorer={openExplorer}
      />
    </div>
  );
};

export default Index;
