import { useMemo } from "react";
import { HardDrive, Folder, FileText, Magnet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowFrame } from "./WindowFrame";

interface FileExplorerProps {
  onClose: () => void;
}

type Item = { id: string; name: string; type: "folder" | "file"; magnet?: string };

export const FileExplorer = ({ onClose }: FileExplorerProps) => {
  const drives = [
    { id: "office", name: "Office", icon: HardDrive },
    { id: "shared", name: "Shared", icon: HardDrive },
    { id: "archive", name: "Archive", icon: HardDrive },
  ];

  const items: Item[] = useMemo(() => (
    [
      { id: "reports", name: "Reports", type: "folder" },
      { id: "policies", name: "Policies", type: "folder" },
      { id: "contract", name: "Q3-Contract.pdf", type: "file", magnet: "magnet:?xt=urn:btih:dummyhash123&dn=Q3-Contract.pdf" },
      { id: "handbook", name: "Employee-Handbook.docx", type: "file", magnet: "magnet:?xt=urn:btih:dummyhash456&dn=Employee-Handbook.docx" },
    ]
  ), []);

  return (
    <WindowFrame title="File Explorer" onClose={onClose}>
      <div className="h-full grid grid-cols-12">
        <aside className="col-span-4 md:col-span-3 border-r p-3">
          <div className="text-xs font-medium text-foreground/60 mb-2">Drives</div>
          <nav className="space-y-1">
            {drives.map((d) => (
              <button key={d.id} className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground">
                <d.icon className="h-4 w-4" />
                <span className="text-sm">{d.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-4 text-xs font-medium text-foreground/60 mb-2">Quick access</div>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground">
              <Download className="h-4 w-4" />
              <span className="text-sm">Downloads</span>
            </button>
          </nav>
        </aside>

        <main className="col-span-8 md:col-span-9 p-3 overflow-auto">
          <div className="mb-3 text-sm text-foreground/70">This PC / Office</div>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.map((it) => (
              <article key={it.id} className="flex flex-col items-center justify-center h-28 rounded-md hover:bg-foreground/5 p-2">
                {it.type === "folder" ? (
                  <Folder className="h-8 w-8 text-foreground mb-2" />
                ) : (
                  <FileText className="h-8 w-8 text-foreground mb-2" />
                )}
                <div className="text-xs text-center line-clamp-2">{it.name}</div>
                {it.magnet && (
                  <a
                    className="mt-1 inline-flex items-center gap-1 text-xs story-link"
                    href={it.magnet}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Download ${it.name} via magnet link`}
                  >
                    <Magnet className="h-3 w-3" /> Get Magnet
                  </a>
                )}
              </article>
            ))}
          </section>
        </main>
      </div>
    </WindowFrame>
  );
};
