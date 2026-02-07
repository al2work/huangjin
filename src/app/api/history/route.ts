import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "24h";
  const symbol = searchParams.get("symbol") || "GOLD";

  // Generate mock candlestick data
  const now = Math.floor(Date.now() / 1000);
  const data = [];
  let price = 1100.0;

  // 24h = 24 * 60 minutes. Let's generate one point per 15 mins = 96 points
  const points = 96;
  const interval = 15 * 60; // 15 mins in seconds

  for (let i = points; i >= 0; i--) {
    const time = now - i * interval;
    const volatility = 2.0;

    const open = price;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    data.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    price = close;
  }

  return NextResponse.json({
    symbol,
    period,
    data,
  });
}
