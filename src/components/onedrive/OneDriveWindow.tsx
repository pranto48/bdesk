import { WindowFrame } from "@/components/desktop/WindowFrame";
import { OneDriveConnect } from "./OneDriveConnect";

interface OneDriveWindowProps {
  onClose: () => void;
}

export const OneDriveWindow = ({ onClose }: OneDriveWindowProps) => {
  return (
    <WindowFrame title="OneDrive" onClose={onClose}>
      <OneDriveConnect />
    </WindowFrame>
  );
};