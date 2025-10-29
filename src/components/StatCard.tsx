type Props = { label: string; value: string; sub?: string; right?: React.ReactNode }
export default function StatCard({ label, value, sub, right }: Props) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="stat">{value}</div>
        {sub && <div className="text-xs text-gray-500">{sub}</div>}
      </div>
      {right}
    </div>
  )
}
