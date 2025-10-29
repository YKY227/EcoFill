import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

export default function QRScanner({ onScan }: { onScan: (text: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const scanner = new Html5QrcodeScanner("qr-root", { fps: 10, qrbox: 250 });
    scanner.render(
      (decoded) => { onScan(decoded); scanner.clear(); },
      (_err) => {}
    );
    return () => { scanner.clear(); };
  }, []);
  return <div id="qr-root" ref={ref} className="w-full" />;
}
