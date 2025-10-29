import { useEffect, useMemo, useRef, useState } from "react";
import { DEVQR_ENABLED, DEV_SIGNING_KEY, MOCK_ENABLED } from "@/utils/flags";
import { useToast } from "@/ui/Toast";
import { endpoints } from "@/api/endpoints";
import { useMutation } from "@tanstack/react-query";

// Minimal station/product presets (tweak freely)
const STATIONS = [
  { id: "STN-001", name: "Science Block" },
  { id: "STN-002", name: "Library Foyer" },
];

const PRODUCTS = [
  { id: "shampoo-500", label: "Shampoo 500ml", volumeMl: 500 },
  { id: "detergent-1000", label: "Detergent 1L", volumeMl: 1000 },
];

function uuid() {
  // Browser-native if available
  // @ts-ignore
  return (crypto?.randomUUID?.() || `uuid_${Math.random().toString(36).slice(2, 10)}`);
}

async function hmacSHA256Hex(key: string, message: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  // to hex
  const bytes = new Uint8Array(sig);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function QRGenerator() {
  const toast = useToast();
  const [stationId, setStationId] = useState(STATIONS[0].id);
  const [productId, setProductId] = useState(PRODUCTS[0].id);
//   const vol = useMemo(
//     () => PRODUCTS.find(p => p.id === productId)?.volumeMl || 500,
//     [productId]
//   );
const [vol, setVol] = useState(PRODUCTS[0].volumeMl);
useEffect(() => {
  // When product changes, update to its default once; user can still edit after.
  const def = PRODUCTS.find(p => p.id === productId)?.volumeMl;
  if (def && def !== vol) setVol(def);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [productId]);

  const [txnId, setTxnId] = useState(uuid());
  const [tsIso, setTsIso] = useState(new Date().toISOString());
  const [signingKey, setSigningKey] = useState<string>(DEV_SIGNING_KEY);
  const [signature, setSignature] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const signingString = `${stationId}|${productId}|${vol}|${brand}|${txnId}|${tsIso}`;

  const payload = useMemo(() => ({
    stationId,
    productId,
    volumeMl: vol,
    txnId,
    ts: tsIso,
    signature: signature || "mock",
    brand,  
  }), [stationId, productId, vol, txnId, tsIso, signature]);

  // Sign whenever inputs change (throttle by user action via "Generate" button)
  async function generate() {
  try {
    const now = new Date().toISOString();
    setTsIso(now);

    let sig = "mock";
    if (signingKey) {
      sig = await hmacSHA256Hex(
        signingKey,
        `${stationId}|${productId}|${vol}|${brand}|${txnId}|${now}` // ← include brand
      );
    }
    setSignature(sig);

    const s = JSON.stringify({ ...payload, ts: now, signature: sig, brand });
    await renderQr(s);
    toast?.push("QR generated");
  } catch (e: any) {
    toast?.push("Failed to generate QR");
    console.error(e);
  }
}

  async function renderQr(text: string) {
    const { default: QRCode } = await import("qrcode");
    // prepare a canvas we can watermark
    const size = 320;
    const tmp = document.createElement("canvas");
    await QRCode.toCanvas(tmp, text, { errorCorrectionLevel: "M", margin: 2, width: size });

    // Draw watermark "DEV"
    const out = canvasRef.current;
    if (!out) return;
    out.width = size; out.height = size;
    const ctx = out.getContext("2d")!;
    ctx.drawImage(tmp, 0, 0);

    if (DEVQR_ENABLED) {
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.translate(size / 2, size / 2);
      ctx.rotate((-20 * Math.PI) / 180);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 48px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillStyle = "#ff0000";
      ctx.fillText("DEV", 0, 0);
      ctx.restore();
    }

    setDataUrl(out.toDataURL("image/png"));
  }

  function downloadPng() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `QR_${stationId}_${productId}_${vol}.png`;
    a.click();
  }

  const testRedeem = useMutation({
    mutationFn: () => endpoints.redeemQR(payload as any),
    onSuccess: () => toast?.push("🎉 Mock redeem OK (wallet updated)"),
    onError: () => toast?.push("Redeem failed"),
  });

  useEffect(() => {
    // initial render
    (async () => {
      await generate();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!DEVQR_ENABLED) {
    return (
      <div className="card">
        <div className="font-semibold">QR Generator is disabled</div>
        <div className="text-sm text-gray-500">Set <code>VITE_USE_MOCK_DEVQR=1</code> in your .env to enable.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-600 text-white text-center p-2 font-bold rounded-xl">DEV ONLY – QR Generator</div>

      {/* Controls */}
      <section className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: form */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Station</label>
              <select className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
                value={stationId} onChange={e => setStationId(e.target.value)}>
                {STATIONS.map(s => <option key={s.id} value={s.id}>{s.id} — {s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-500">Product</label>
              <select className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
                value={productId} onChange={e => setProductId(e.target.value)}>
                {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
  <div>
    <label className="text-sm text-gray-500">Volume (ml)</label>
    <input
      className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
      type="number"
      min={1}
      step={25}                         // convenience for your 25ml points rule
      value={vol}
      onChange={e => {
        const v = Math.max(1, Number(e.target.value) || 0);
        setVol(Math.round(v / 25) * 25);
      }}
    />
    <div className="text-xs text-gray-500 mt-1">Tip: points = volume / 25</div>
  </div>

  <div>
    <label className="text-sm text-gray-500">Txn ID</label>
    <div className="flex gap-2">
      <input className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
        value={txnId} readOnly />
      <button className="btn-secondary" onClick={() => setTxnId(uuid())}>↻</button>
    </div>
  </div>
</div>

<div>
  <label className="text-sm text-gray-500">Brand (free text)</label>
  <input
    className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
    placeholder="e.g., BrandX, BrandY"
    value={brand}
    onChange={e => setBrand(e.target.value)}
  />
  <div className="text-xs text-gray-500 mt-1">Included in payload and signature.</div>
</div>


            <div>
              <label className="text-sm text-gray-500">Timestamp (ISO)</label>
              <input className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
                value={tsIso} readOnly />
            </div>

            <div>
              <label className="text-sm text-gray-500">Signing key (dev)</label>
              <input className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
                type="password" placeholder="Optional – leave blank for mock signature"
                value={signingKey} onChange={e => setSigningKey(e.target.value)} />
              <div className="text-xs text-gray-500 mt-1">HMAC-SHA256 over <code>stationId|productId|volumeMl|txnId|ts</code></div>
            </div>

            <div className="flex gap-2">
              <button className="btn" onClick={generate}>Generate</button>
              <button className="btn-secondary" onClick={downloadPng} disabled={!dataUrl}>Save PNG</button>
              {MOCK_ENABLED && (
                <button className="btn-secondary" onClick={() => testRedeem.mutate()}>
                  Test Redeem (mock)
                </button>
              )}
            </div>
          </div>

          {/* Right: previews */}
          <div className="space-y-3">
            <div className="card">
              <div className="text-sm text-gray-500 mb-1">Payload</div>
              <pre className="text-xs overflow-auto">{JSON.stringify(payload, null, 2)}</pre>
            </div>

            <div className="card">
              <div className="text-sm text-gray-500 mb-2">QR Preview</div>
              <canvas ref={canvasRef} className="rounded-xl border border-gray-200 dark:border-gray-800 mx-auto" />
            </div>

            <div className="text-xs text-gray-500">
              Signature: <code>{signature ? `${signature.slice(0, 10)}…${signature.slice(-6)}` : "(mock)"}</code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
