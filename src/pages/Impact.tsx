import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/api/endpoints";
import { qk } from "@/api/queryKeys";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import Skeleton from "@/ui/Skeleton";
import { useMemo, useState } from "react";

export default function Impact() {
  const { data, isLoading } = useQuery({ queryKey: qk.impact, queryFn: endpoints.getImpact });
  const [view, setView] = useState<"monthly"|"cumulative">("monthly");

  const chartData = useMemo(() => {
    const rows = data?.byMonth ?? [];
    const community = data?.communityAvgByMonth ?? [];
    if (view === "monthly") {
      // join by month key
      return rows.map((r, i) => ({
        month: r.month,
        plasticSavedG: r.plasticSavedG,
        co2SavedG: r.co2SavedG,
        c_plasticSavedG: community[i]?.plasticSavedG ?? null,
        c_co2SavedG: community[i]?.co2SavedG ?? null,
      }));
    }
    // cumulative
    let p = 0, c = 0, cp = 0, cc = 0;
    return rows.map((r, i) => {
      p += r.plasticSavedG; c += r.co2SavedG;
      cp += (community[i]?.plasticSavedG ?? 0);
      cc += (community[i]?.co2SavedG ?? 0);
      return {
        month: r.month,
        plasticSavedG: p,
        co2SavedG: c,
        c_plasticSavedG: cp,
        c_co2SavedG: cc,
      };
    });
  }, [data, view]);

  // milestones (simple: 1kg, 5kg plastic saved cumulative)
  const milestones = useMemo(() => {
    if (!chartData?.length || view !== "cumulative") return [];
    const marks = [1000, 5000]; // grams
    return marks.map(m => {
      const idx = chartData.findIndex(r => (r.plasticSavedG ?? 0) >= m);
      return idx >= 0 ? { month: chartData[idx].month, g: m } : null;
    }).filter(Boolean) as { month:string; g:number }[];
  }, [chartData, view]);

  if (isLoading) return <Skeleton className="h-72" />;

  const latest = chartData?.[chartData.length-1];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Impact Dashboard</h1>
        <div className="flex gap-2">
          <button className={`btn-secondary ${view==='monthly'?'ring-2 ring-green-500':''}`} onClick={()=>setView('monthly')}>Monthly</button>
          <button className={`btn-secondary ${view==='cumulative'?'ring-2 ring-green-500':''}`} onClick={()=>setView('cumulative')}>Cumulative</button>
        </div>
      </div>

      {/* headline stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card">
          <div className="text-sm text-gray-500">Your plastic saved</div>
          <div className="stat">{((latest?.plasticSavedG ?? 0)/1000).toFixed(2)} kg</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Your CO₂ avoided</div>
          <div className="stat">{((latest?.co2SavedG ?? 0)/1000).toFixed(2)} kg</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">vs campus average</div>
          <div className="stat">
            {latest?.c_plasticSavedG
              ? `${((latest.c_plasticSavedG)/1000).toFixed(2)} kg plastic`
              : '—'}
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="card h-96">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left"  type="monotone" dataKey="plasticSavedG" name={view==='monthly'?'Plastic (g)':'Plastic cum. (g)'} />
            <Line yAxisId="right" type="monotone" dataKey="co2SavedG"     name={view==='monthly'?'CO₂ (g)':'CO₂ cum. (g)'} strokeDasharray="4 2" />
            {/* community comparison */}
            <Line yAxisId="left"  type="monotone" dataKey="c_plasticSavedG" name={view==='monthly'?'Campus avg plastic (g)':'Campus avg plastic cum. (g)'} strokeDasharray="2 2" />
            {/* simple milestone markers: label below the chart */}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {view === 'cumulative' && milestones.length > 0 && (
        <div className="card">
          <div className="font-semibold mb-2">Milestones reached</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {milestones.map(m => (
              <li key={m.month}>
                Reached {(m.g/1000).toFixed(1)} kg plastic saved in <span className="font-medium">{m.month}</span> 🎉
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
