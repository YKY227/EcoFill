// src/hooks/useRewards.ts
import { rewards, type Reward } from "@/data/rewards";
import { useMemo } from "react";

export function useRewards() {
  // In future: replace with TanStack Query call to backend
  // e.g., useQuery({ queryKey: ['rewards'], queryFn: endpoints.getRewards })
  const list = useMemo<Reward[]>(() => rewards, []);
  return { rewards: list };
}
