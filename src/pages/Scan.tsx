// src/pages/scan.tsx
import { useState } from "react";
import QRScanner from "@/components/QRScanner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/api/endpoints";
import { qk } from "@/api/queryKeys";
import { useToast } from "@/ui/Toast";
import { z } from "zod";

/** ---------- Schemas (coerce numbers; reject null/empty) ---------- */
const num = z.preprocess(
  (v) => (v === null || v === undefined || v === "" ? undefined : Number(v)),
  z.number().finite()
);

// Simulator QR (TxPayload from the desktop app)
const SimTxSchema = z.object({
  schemaVersion: z.literal(1).optional(),
  transaction_id: z.string(),
  userId: z.string(),
  selection: z.object({
    product: z.string(),
    brand: z.string().optional().nullable(),
    volume: num, // ml
  }),
  price: num,           // $
  ecoPoints: num,       // e.g. 50
  bottlesSaved: num,    // e.g. 1
  timestamp: z.string() // ISO
}).passthrough();

// Mock/dev QR payload (your generator)
const MockTxSchema = z.object({
  stationId: z.string(),
  productId: z.string(),
  volumeMl: num,
  txnId: z.string(),
  ts: z.string(),
  signature: z.string(),
  brand: z.string().optional()
}).passthrough();

type SimTx = z.infer<typeof SimTxSchema>;
type MockTx = z.infer<typeof MockTxSchema>;

function parseScanned(
  text: string
): { kind: "sim"; data: SimTx } | { kind: "mock"; data: MockTx } | null {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return null; }

  const sim = SimTxSchema.safeParse(raw);
  if (sim.success) return { kind: "sim", data: sim.data };

  const mock = MockTxSchema.safeParse(raw);
  if (mock.success) return { kind: "mock", data: mock.data };

  return null;
}

// Normalize to the QRPayload your backend/mock expects
function toQrPayloadFromSim(sim: SimTx) {
  return {
    stationId: "STN-SIM", // map as needed
    productId: sim.selection.product,
    volumeMl: sim.selection.volume,
    brand: sim.selection.brand ?? undefined,
    txnId: sim.transaction_id,
    ts: sim.timestamp,
    signature: "sim",
  };
}

function toQrPayloadFromMock(mock: MockTx) {
  return {
    stationId: mock.stationId,
    productId: mock.productId,
    volumeMl: Number(mock.volumeMl),
    brand: mock.brand ?? undefined,
    txnId: mock.txnId,
    ts: mock.ts,
    signature: mock.signature,
  };
}

export default function Scan() {
  const qc = useQueryClient();
  const toast = useToast();

  // UI state: show a brief summary when a scan succeeds
  const [lastSummary, setLastSummary] = useState<{
    brand?: string;
    productId: string;
    volumeMl: number;
    points?: number; // optional: if your API returns
  } | null>(null);

  const redeem = useMutation({
    mutationFn: endpoints.redeemQR,
    onSuccess: (res: any) => {
      // Reshape a tiny summary for the UI (best-effort; works with mock)
      try {
        const p = res?.purchase ?? {};
        setLastSummary({
          brand: p.brand,
          productId: p.productId,
          volumeMl: p.volumeMl,
          points: p.points,
        });
      } catch {
        setLastSummary(null);
      }

      qc.invalidateQueries({ queryKey: qk.wallet });
      qc.invalidateQueries({ queryKey: qk.leaderboard });
      qc.invalidateQueries({ queryKey: qk.impact });
      toast?.push("🎉 Refill recorded! Points updated.");
    },
    onError: () => toast?.push("⚠️ Failed to redeem QR."),
  });

  const handleScan = (txt: string) => {
    const parsed = parseScanned(txt);
    if (!parsed) {
      toast?.push("❌ Invalid QR content");
      return;
    }
    const payload =
      parsed.kind === "sim"
        ? toQrPayloadFromSim(parsed.data)
        : toQrPayloadFromMock(parsed.data);

    redeem.mutate(payload as any);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Scan Refill QR</h1>

        {/* status chip */}
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            redeem.isPending
              ? "bg-amber-100 text-amber-700"
              : lastSummary
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {redeem.isPending ? "Processing…" : lastSummary ? "Last scan saved" : "Ready"}
        </span>
      </div>

      {/* Layout: scanner (left) + sidebar (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scanner card */}
        <section className="lg:col-span-2 card p-0">
          <header className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📷</span>
              <span className="font-semibold">Camera Scanner</span>
            </div>
            <span className="text-xs text-gray-500">Grant camera access to start</span>
          </header>

          {/* scanner canvas area with subtle grid bg */}
          <div className="p-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-black relative">
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                  color: "currentColor",
                }}
              />
              {/* Keep your QRScanner component untouched */}
              <div className="relative">
                <QRScanner onScan={handleScan} />
              </div>
            </div>

            {/* success summary strip */}
            {lastSummary && !redeem.isPending && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                {lastSummary.brand && (
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-semibold text-sm">
                    {lastSummary.brand}
                  </span>
                )}
                <span className="font-medium">
                  {lastSummary.productId} • {Math.round(lastSummary.volumeMl)}ml
                </span>
                {typeof lastSummary.points === "number" && (
                  <span className="ml-auto text-green-700 font-semibold">
                    +{lastSummary.points} pts
                  </span>
                )}
              </div>
            )}

            {/* action row */}
            <div className="mt-4 flex items-center gap-3">
              {import.meta.env.VITE_USE_MOCK === "1" && (
                <button
                  className="btn"
                  onClick={() => {
                    const payload = {
                      stationId: "STN-001",
                      productId: "shampoo-500",
                      volumeMl: 500,
                      brand: "EcoPure",
                      txnId: crypto.randomUUID?.() || String(Date.now()),
                      ts: new Date().toISOString(),
                      signature: "mock",
                    };
                    redeem.mutate(payload as any);
                  }}
                >
                  + Mock Refill (no QR)
                </button>
              )}
              {redeem.isPending && (
                <span className="text-sm text-gray-500">Processing…</span>
              )}
            </div>
          </div>
        </section>

        {/* Sidebar: tips / help */}
        <aside className="card space-y-4">
          <div>
            <div className="font-semibold mb-1">How it works</div>
            <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Allow camera access.</li>
              <li>Hold the QR in the frame until it beeps.</li>
              <li>Points & impact update instantly.</li>
            </ol>
          </div>

          <div>
            <div className="font-semibold mb-1">Troubleshooting</div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Bright lighting improves scan speed.</li>
              <li>Try “Scan an Image File” for screenshots.</li>
              <li>Make sure the QR isn’t cropped or blurry.</li>
            </ul>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/30 p-3">
            <div className="text-xs text-gray-500">
              Tip: In dev, use the <code>/dev/qr</code> generator to create signed test codes.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
