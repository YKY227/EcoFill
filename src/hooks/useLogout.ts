import { useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/api/endpoints";
import { qk } from "@/api/queryKeys";
import { useNavigate } from "react-router-dom";

export function useLogout() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => endpoints.logout(),
    onSuccess: () => {
      qc.clear(); // clear all queries (wallet, leaderboard, etc.)
      navigate("/login");
    }
  });
}
