import { useQuery } from '@tanstack/react-query'
import { endpoints } from '@/api/endpoints'
import { qk } from '@/api/queryKeys'

export function useLiveWallet() {
  return useQuery({ queryKey: qk.wallet, queryFn: endpoints.getWallet, staleTime: 5_000 })
}
