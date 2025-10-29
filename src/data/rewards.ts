// src/data/rewards.ts
export type Reward = {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  image?: string;           // optional (can use placeholder)
  category: "Refill" | "Voucher" | "Merch" | "Event";
  valueSgd?: number;        // for vouchers
};

export const rewards: Reward[] = [
  {
    id: "free-refill-250",
    title: "Free 250ml Refill",
    description: "Redeem a free 250ml refill at any Eco station.",
    pointsRequired: 500,
    category: "Refill",
  },
  {
    id: "ntuc-5",
    title: "S$5 NTUC Voucher",
    description: "Digital NTUC voucher sent to your email.",
    pointsRequired: 1000,
    category: "Voucher",
    valueSgd: 5,
  },
  {
    id: "food-10",
    title: "S$10 Food Voucher",
    description: "Use at participating campus canteens.",
    pointsRequired: 2000,
    category: "Voucher",
    valueSgd: 10,
  },
  {
    id: "tote-bag",
    title: "Eco Tote Bag",
    description: "Durable tote made from recycled fabric.",
    pointsRequired: 3000,
    category: "Merch",
  },
  {
    id: "event-ticket",
    title: "Eco Expo Ticket",
    description: "VIP access to the campus Eco Expo event.",
    pointsRequired: 5000,
    category: "Event",
  },
];
