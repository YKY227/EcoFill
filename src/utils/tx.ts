// src/utils/tx.ts
import { z } from "zod";

const num = z.preprocess(
  (v) => (v === null || v === undefined || v === "" ? undefined : Number(v)),
  z.number().finite()
);

export const TxSchema = z.object({
  schemaVersion: z.literal(1).optional(), // optional, see simulator note
  transaction_id: z.string(),
  userId: z.string(),
  selection: z.object({
    product: z.string(),
    brand: z.string().optional().nullable(),
    volume: num,        // ml
  }),
  price: num,           // $
  ecoPoints: num,       // integer
  bottlesSaved: num,    // integer
  timestamp: z.string(), // ISO
});

export type Tx = z.infer<typeof TxSchema>;

export function parseTx(raw: unknown): Tx | null {
  const res = TxSchema.safeParse(raw);
  if (!res.success) {
    console.error("Invalid TX payload", res.error.format(), raw);
    return null;
  }
  return res.data;
}
