import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { Minus, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WindowFrameProps {
  title: string;
  onClose: () => void;
}

export const WindowFrame = ({ title, onClose, children }: PropsWithChildren<WindowFrameProps>) => {
  const frameRef = useRef<HTMLElement | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 64, left: 32 });
  const dragState = useRef<{ active: boolean; offsetX: number; offsetY: number }>({ active: false, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current.active || isMaximized) return;
      const node = frameRef.current as HTMLElement | null;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;
      const newLeft = e.clientX - dragState.current.offsetX;
      const newTop = e.clientY - dragState.current.offsetY;
      const maxLeft = innerWidth - rect.width - 8;
      const maxTop = innerHeight - 56 - rect.height - 8; // account for taskbar height
      setPos({
        left: Math.max(8, Math.min(newLeft, Math.max(8, maxLeft))),
        top: Math.max(8, Math.min(newTop, Math.max(8, maxTop))),
      });
    };
    const onUp = () => { dragState.current.active = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isMaximized]);

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    const node = frameRef.current as HTMLElement | null;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    dragState.current = {
      active: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
  };

  const containerClass = isMaximized
    ? "fixed left-2 right-2 top-2 bottom-16 glass elevated rounded-lg border overflow-hidden animate-enter z-[70]"
    : "absolute glass elevated rounded-lg border overflow-hidden animate-enter z-[60]";

  const containerStyle = isMaximized
    ? undefined
    : { 
        top: pos.top, 
        left: pos.left, 
        width: "min(960px, calc(100vw - 2rem))", 
        height: "min(600px, calc(100vh - 8rem))",
        maxWidth: "92vw",
        maxHeight: "85vh"
      } as React.CSSProperties;

  return (
    <section
      ref={(el) => (frameRef.current = el)}
      className={containerClass}
      style={containerStyle}
      role="dialog"
      aria-label={title}
    >
      <header
        className="h-11 flex items-center justify-between px-3 border-b bg-background/60 cursor-move select-none"
        onMouseDown={onHeaderMouseDown}
        aria-grabbed={dragState.current.active}
      >
        <h2 className="text-sm font-medium text-foreground/90">{title}</h2>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="taskbar" aria-label="Minimize" onClick={onClose}><Minus /></Button>
          <Button
            size="icon"
            variant="taskbar"
            aria-label={isMaximized ? "Restore" : "Maximize"}
            onClick={() => setIsMaximized((v) => !v)}
          >
            <Square />
          </Button>
          <Button size="icon" variant="taskbar" aria-label="Close" onClick={onClose}><X /></Button>
        </div>
      </header>
      <div className="h-[calc(100%-44px)] bg-background/70">
        {children}
      </div>
    </section>
  );
};
