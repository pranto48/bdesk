import { PropsWithChildren } from "react";
import { Minus, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WindowFrameProps {
  title: string;
  onClose: () => void;
}

export const WindowFrame = ({ title, onClose, children }: PropsWithChildren<WindowFrameProps>) => {
  return (
    <section className="absolute top-16 left-8 w-[min(960px,92vw)] h-[min(600px,70vh)] glass elevated rounded-lg border overflow-hidden animate-enter" role="dialog" aria-label={title}>
      <header className="h-11 flex items-center justify-between px-3 border-b bg-background/60">
        <h2 className="text-sm font-medium text-foreground/90">{title}</h2>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="taskbar" aria-label="Minimize"><Minus /></Button>
          <Button size="icon" variant="taskbar" aria-label="Maximize"><Square /></Button>
          <Button size="icon" variant="taskbar" aria-label="Close" onClick={onClose}><X /></Button>
        </div>
      </header>
      <div className="h-[calc(100%-44px)] bg-background/70">
        {children}
      </div>
    </section>
  );
};
