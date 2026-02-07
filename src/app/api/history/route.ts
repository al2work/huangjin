import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "24h";
  const symbol = searchParams.get("symbol") || "GOLD";

  // Generate mock data for the chart
  // Current price around 1107
  const currentPrice = 1107.66;
  const data = [];
  
  // Generate 100 data points
  let time = Math.floor(Date.now() / 1000) - (24 * 60 * 60); // Start from 24h ago
  const interval = (24 * 60 * 60) / 100; // 100 points in 24h
  
  let lastClose = currentPrice * 0.98; // Start slightly lower

  for (let i = 0; i < 100; i++) {
    const open = lastClose;
    const volatility = currentPrice * 0.005; // 0.5% volatility
    const change = (Math.random() - 0.45) * volatility; // Slight upward bias
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    data.push({
      time: time + i * interval,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    lastClose = close;
  }

  // Ensure the last price matches roughly the current price
  // (In a real app, we'd use real historical data)

  return NextResponse.json({
    symbol,
    period,
    data,
  });
}