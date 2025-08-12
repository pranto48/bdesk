import { useEffect, useMemo, useState } from "react";
import { WindowFrame } from "@/components/desktop/WindowFrame";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MyTorrentsProps { onClose: () => void }

type FileRow = { id: string; name: string; magnet_uri: string | null; torrent_path: string | null };

type FolderRow = { id: string };

export const MyTorrents = ({ onClose }: MyTorrentsProps) => {
  const [myFiles, setMyFiles] = useState<FileRow[]>([]);
  const [sharedFiles, setSharedFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "My Torrents | bdesk.site";
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getUser();
        if (!session.user) {
          setLoading(false);
          return;
        }
        const uid = session.user.id;
        const { data: my, error: myErr } = await supabase
          .from("files").select("id,name,magnet_uri,torrent_path")
          .eq("owner_id", uid)
          .order("created_at", { ascending: false });
        if (myErr) throw myErr;
        setMyFiles(my || []);

        const { data: shareFolder, error: fErr } = await supabase
          .from("folders").select("id").eq("name", "Share").eq("is_system", true).maybeSingle();
        if (fErr) throw fErr;
        if (shareFolder) {
          const { data: shared, error: sErr } = await supabase
            .from("files").select("id,name,magnet_uri,torrent_path")
            .eq("folder_id", (shareFolder as FolderRow).id)
            .order("created_at", { ascending: false });
          if (sErr) throw sErr;
          setSharedFiles(shared || []);
        }
      } catch (err: any) {
        toast({ title: "Load error", description: err?.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copyMagnet = async (magnet: string | null) => {
    if (!magnet) return;
    await navigator.clipboard.writeText(magnet);
    toast({ title: "Magnet copied" });
  };

  const getTorrentUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from("torrents").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <WindowFrame title="My Torrents" onClose={onClose}>
      <main className="h-full overflow-auto p-4 space-y-6">
        <section>
          <h1 className="text-lg font-semibold">Your files</h1>
          {loading ? (
            <p className="text-sm text-foreground/70 mt-2">Loading…</p>
          ) : myFiles.length === 0 ? (
            <p className="text-sm text-foreground/70 mt-2">No torrent files yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {myFiles.map((f) => (
                <li key={f.id} className="glass rounded-md border px-3 py-2 flex items-center justify-between">
                  <span className="truncate pr-3">{f.name}</span>
                  <div className="flex items-center gap-2">
                    {f.magnet_uri && <Button size="sm" variant="secondary" onClick={() => copyMagnet(f.magnet_uri)}>Copy magnet</Button>}
                    {getTorrentUrl(f.torrent_path) && (
                      <a className="inline-flex" href={getTorrentUrl(f.torrent_path)!} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">Download .torrent</Button>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-base font-medium">Shared files (Share)</h2>
          {loading ? (
            <p className="text-sm text-foreground/70 mt-2">Loading…</p>
          ) : sharedFiles.length === 0 ? (
            <p className="text-sm text-foreground/70 mt-2">No shared files.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {sharedFiles.map((f) => (
                <li key={f.id} className="glass rounded-md border px-3 py-2 flex items-center justify-between">
                  <span className="truncate pr-3">{f.name}</span>
                  <div className="flex items-center gap-2">
                    {f.magnet_uri && <Button size="sm" variant="secondary" onClick={() => copyMagnet(f.magnet_uri)}>Copy magnet</Button>}
                    {getTorrentUrl(f.torrent_path) && (
                      <a className="inline-flex" href={getTorrentUrl(f.torrent_path)!} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">Download .torrent</Button>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </WindowFrame>
  );
};
