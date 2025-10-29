type Props = {
  /** % from the left edge of the image where the bottle box starts */
  xPct?: number;   // e.g. 62
  /** % from the top edge of the image where the bottle box starts */
  yPct?: number;   // e.g. 50
  /** % of the image width used by the bottle box */
  wPct?: number;   // e.g. 10
  /** % of the image height used by the bottle box */
  hPct?: number;   // e.g. 34
  /** optional: show a thin outline to help calibrate */
  debug?: boolean;
};

export default function RefillVisual({
  xPct = 61.5,
  yPct = 56,
  wPct = 10.2,
  hPct = 33.5,
  debug = false,
}: Props) {
  return (
    <div className="relative max-w-[640px] w-full">
      {/* The illustration */}
      <img
        src="/assets/refill-visual.png"
        alt="EcoRewards Refill Station"
        className="w-full h-auto block rounded-xl"
      />

      {/* Bottle frame aligned by percentages */}
      <div
        className="absolute rounded-[10px] overflow-hidden bg-white/90"
        style={{
          left: `${xPct}%`,
          top: `${yPct}%`,
          width: `${wPct}%`,
          height: `${hPct}%`,
           backgroundColor: "rgba(255,255,255,1.0)",  // 👈 semi-transparent white
          border: debug ? "2px dashed rgba(0,0,0,0.3)" : "2px solid rgba(0,0,0,0.75)",
          boxShadow: "0 2px 0 rgba(0,0,0,0.15) inset",
        }}
      >
        {/* Animated fill */}
        <div className="absolute bottom-0 w-full bg-green-400 animate-fillBottle" style={{ backgroundColor: "rgb(209,79,255)" }} />
      </div>
    </div>
  );
}
