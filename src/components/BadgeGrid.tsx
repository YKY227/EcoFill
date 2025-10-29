type Badge = { id: string; label: string; earned: boolean; }
export default function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {badges.map(b => (
        <div key={b.id} className={`card flex items-center gap-3 ${b.earned ? '' : 'opacity-60'}`}>
          <div className="text-2xl">{b.earned ? '🏅' : '🔒'}</div>
          <div>
            <div className="font-medium">{b.label}</div>
            {!b.earned && <div className="text-sm text-gray-500">Locked</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
