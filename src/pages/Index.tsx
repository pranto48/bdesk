import { useEffect, useState } from "react";
import wallpaper from "@/assets/wallpaper-hero.jpg";
import DesktopIcon from "@/components/desktop/DesktopIcon";
import { Taskbar } from "@/components/desktop/Taskbar";
import { StartMenu } from "@/components/desktop/StartMenu";
import { FileExplorer } from "@/components/desktop/FileExplorer";
import { Folder, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AuthWindow } from "@/components/auth/AuthWindow";
import { MyTorrents } from "@/components/torrents/MyTorrents";
import { TorrentCreator } from "@/components/torrents/TorrentCreator";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [startOpen, setStartOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [myTorrentsOpen, setMyTorrentsOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
        <div className="p-6 grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-5xl">
          <DesktopIcon Icon={Folder} label="File Explorer" onOpen={openExplorer} />
          <DesktopIcon Icon={Download} label="Downloads" onOpen={() => toast({ title: "Open Downloads" })} />
        </div>

        {explorerOpen && (
          <FileExplorer onClose={() => setExplorerOpen(false)} />
        )}
        {authOpen && <AuthWindow onClose={() => setAuthOpen(false)} />}
        {myTorrentsOpen && <MyTorrents onClose={() => setMyTorrentsOpen(false)} />}
        {creatorOpen && <TorrentCreator onClose={() => setCreatorOpen(false)} />}
        {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} isAdmin={isAdmin} />}

        <StartMenu
          open={startOpen}
          onOpenExplorer={openExplorer}
          onOpenAuth={() => { setAuthOpen(true); setStartOpen(false); }}
          onOpenMyTorrents={() => { setMyTorrentsOpen(true); setStartOpen(false); }}
          onOpenTorrentCreator={() => { setCreatorOpen(true); setStartOpen(false); }}
          onOpenAdmin={() => { setAdminOpen(true); setStartOpen(false); }}
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
