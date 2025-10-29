export default function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
      <div className="h-3 bg-green-600" style={{ width: `${pct}%` }} />
    </div>
  );
}
