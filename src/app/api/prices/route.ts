import { NextResponse } from "next/server";

export async function GET() {
  // Mock data with slight randomization
  const randomVariation = (base: number) => {
    const percent = (Math.random() - 0.5) * 0.005; // +/- 0.25%
    return base * (1 + percent);
  };

  const prices = {
    GOLD: {
      symbol: "XAU",
      name: "现货黄金",
      price: randomVariation(1107.66),
      change: 13.44,
      changePercent: 1.23,
      timestamp: Date.now(),
    },
    SILVER: {
      symbol: "XAG",
      name: "现货白银",
      price: randomVariation(12.85),
      change: -0.12,
      changePercent: -0.92,
      timestamp: Date.now(),
    },
    PLATINUM: {
      symbol: "XPT",
      name: "现货铂金",
      price: randomVariation(235.40),
      change: 1.85,
      changePercent: 0.79,
      timestamp: Date.now(),
    },
  };

  return NextResponse.json(prices);
}
