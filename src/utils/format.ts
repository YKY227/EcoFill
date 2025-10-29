// utils/format.ts
export const money = (v: unknown, d = 2) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(d) : "—";
};
export const int = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? String(Math.round(n)) : "—";
};
