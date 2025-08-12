import { useEffect, useMemo, useState } from "react";
import { WindowFrame } from "@/components/desktop/WindowFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import bencode from "bencode";

interface TorrentCreatorProps { onClose: () => void }

type Folder = { id: string; name: string };

// Compute SHA-1 digest of a Uint8Array
async function sha1(data: Uint8Array): Promise<Uint8Array> {
  const buf = await crypto.subtle.digest("SHA-1", data);
  return new Uint8Array(buf);
}

// Concatenate Uint8Arrays
function concat(arrays: Uint8Array[]): Uint8Array {
  const len = arrays.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(len);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

export const TorrentCreator = ({ onClose }: TorrentCreatorProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [trackers, setTrackers] = useState("udp://tracker.opentrackr.org:1337/announce");
  const [pieceLen, setPieceLen] = useState(256 * 1024); // 256 KiB
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderId, setFolderId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Create .torrent | bdesk.site";
  }, []);

  useEffect(() => {
    const loadFolders = async () => {
      // User can insert into system or own folders
      const { data, error } = await supabase.from("folders").select("id,name");
      if (error) {
        toast({ title: "Error loading folders", description: error.message });
      } else {
        setFolders(data || []);
        const docs = data?.find(f => f.name === "Documents");
        setFolderId(docs?.id || data?.[0]?.id || "");
      }
    };
    loadFolders();
  }, []);

  const folderOptions = useMemo(() => folders, [folders]);

  const handleCreate = async () => {
    if (!file) { toast({ title: "Select a file" }); return; }
    if (!folderId) { toast({ title: "Select target folder" }); return; }
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Please sign in first");

      // Read file in chunks, hash pieces
      const pieceHashes: Uint8Array[] = [];
      for (let offset = 0; offset < file.size; offset += pieceLen) {
        const slice = file.slice(offset, Math.min(offset + pieceLen, file.size));
        const buf = new Uint8Array(await slice.arrayBuffer());
        const digest = await sha1(buf);
        pieceHashes.push(digest);
      }
      const pieces = concat(pieceHashes);

      // Info dict per BitTorrent spec
      const info: any = {
        name: file.name,
        'piece length': pieceLen,
        pieces,
        length: file.size,
      };

      const announceList = trackers
        .split(/\n|,/) 
        .map(s => s.trim())
        .filter(Boolean);

      const torrent: any = {
        announce: announceList[0] || undefined,
        'announce-list': announceList.length > 1 ? announceList.map(t => [t]) : undefined,
        info,
      };

      const encoded = bencode.encode(torrent);
      const infoEncoded = bencode.encode(info);
      const infoHashBytes = await sha1(infoEncoded);
      const infoHashHex = Array.from(infoHashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const magnet = `magnet:?xt=urn:btih:${infoHashHex}&dn=${encodeURIComponent(file.name)}` +
        (announceList.length ? announceList.map(t => `&tr=${encodeURIComponent(t)}`).join("") : "");

      const blob = new Blob([encoded], { type: 'application/x-bittorrent' });
      const torrentPath = `${userId}/${file.name}.torrent`;
      const { error: upErr } = await supabase.storage.from('torrents').upload(torrentPath, blob, { upsert: true, contentType: 'application/x-bittorrent' });
      if (upErr) throw upErr;

      const { error: insertErr } = await supabase.from('files').insert({
        folder_id: folderId,
        owner_id: userId,
        name: file.name,
        size: file.size,
        magnet_uri: magnet,
        info_hash: infoHashHex,
        torrent_path: torrentPath,
      });
      if (insertErr) throw insertErr;

      toast({ title: ".torrent created", description: `${file.name}.torrent uploaded` });
    } catch (err: any) {
      toast({ title: "Create failed", description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WindowFrame title="Create Torrent" onClose={onClose}>
      <main className="h-full overflow-auto p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Source file</Label>
          <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="space-y-2">
          <Label>Target folder</Label>
          <Select value={folderId} onValueChange={setFolderId}>
            <SelectTrigger>
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              {folderOptions.map(f => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="trackers">Trackers (comma or newline separated)</Label>
          <Input id="trackers" value={trackers} onChange={(e) => setTrackers(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="piece">Piece length (bytes)</Label>
          <Input id="piece" type="number" value={pieceLen} onChange={(e) => setPieceLen(parseInt(e.target.value || '262144', 10))} />
        </div>
        <Button onClick={handleCreate} disabled={loading}>Create .torrent</Button>
      </main>
    </WindowFrame>
  );
};
