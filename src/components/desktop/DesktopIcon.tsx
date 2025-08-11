import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesktopIconProps {
  Icon: LucideIcon;
  label: string;
  onOpen?: () => void;
}

const DesktopIcon = ({ Icon, label, onOpen }: DesktopIconProps) => {
  return (
    <button
      className="flex flex-col items-center justify-center w-24 h-24 rounded-md hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover-scale"
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen?.();
      }}
      aria-label={`${label} icon`}
    >
      <Icon className="mb-2 h-8 w-8 text-foreground" />
      <span className="text-xs text-foreground/90 text-center leading-tight">
        {label}
      </span>
    </button>
  );
};

export default DesktopIcon;
