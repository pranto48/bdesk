import { WindowFrame } from "@/components/desktop/WindowFrame";
import { GoogleDriveConnect } from "./GoogleDriveConnect";

interface GoogleDriveWindowProps {
  onClose: () => void;
}

export const GoogleDriveWindow = ({ onClose }: GoogleDriveWindowProps) => {
  return (
    <WindowFrame title="Google Drive" onClose={onClose}>
      <GoogleDriveConnect />
    </WindowFrame>
  );
};
