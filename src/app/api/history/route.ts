import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "24h";
  const symbol = searchParams.get("symbol") || "GOLD";

  // Map our symbols to Yahoo Finance symbols
  const symbolMap: Record<string, string> = {
    GOLD: "GC=F",
    SILVER: "SI=F",
    PLATINUM: "PL=F",
  };

  const yfSymbol = symbolMap[symbol] || "GC=F";
  const cacheKey = `${yfSymbol}-${period}`;

  // Check cache
  const now = Date.now();
  if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_DURATION)) {
    return NextResponse.json(cache[cacheKey].data);
  }

  try {
    // Determine start date based on period
    // Yahoo Finance historical API works with dates
    // For 24h (intraday), we need a different approach or just get last few days of daily data
    // yahoo-finance2 `historical` returns daily data by default.
    // For intraday, we might need `chart` module if available or just show daily candles for longer periods.
    // Given the constraints and simplicity, let's fetch daily data for the last 30 days and slice as needed,
    // or specifically for 24h, we might not get minute-level data easily without premium.
    // Let's fallback to daily data for now, which is "real" but coarser.

    // Actually, `yahooFinance.chart` can provide granular data.
    // Let's try to use `yahooFinance.chart` if possible, otherwise `historical`.

    // We also need USD/CNY rate to convert.
    const cnyQuote: any = await yahooFinance.quote('CNY=X');
    const usdToCny = cnyQuote.regularMarketPrice || 7.2;
    const ozToGram = 31.1035;

    let queryPeriod1;
    let interval: "1m" | "5m" | "15m" | "1d" | "1h" = "15m";

    if (period === "24h") {
      queryPeriod1 = new Date(now - 24 * 60 * 60 * 1000); // 1 day ago
      interval = "15m"; // 15 min interval for 24h
    } else if (period === "7d") {
      queryPeriod1 = new Date(now - 7 * 24 * 60 * 60 * 1000);
      interval = "1h"; // 1 hour interval for 7d
    } else {
      queryPeriod1 = new Date(now - 30 * 24 * 60 * 60 * 1000);
      interval = "1d"; // Daily for longer
    }

    const result: any = await yahooFinance.chart(yfSymbol, {
      period1: queryPeriod1,
      interval: interval as any,
    });

    if (!result || !result.quotes || result.quotes.length === 0) {
      throw new Error("No historical data found");
    }

    const data = result.quotes.map((q: any) => ({
      time: Math.floor(new Date(q.date).getTime() / 1000),
      open: Number(((q.open * usdToCny) / ozToGram).toFixed(2)),
      high: Number(((q.high * usdToCny) / ozToGram).toFixed(2)),
      low: Number(((q.low * usdToCny) / ozToGram).toFixed(2)),
      close: Number(((q.close * usdToCny) / ozToGram).toFixed(2)),
    })).filter((item: any) => item.open && item.close); // Filter out empty candles

    const responseData = {
      symbol,
      period,
      data,
    };

    // Update cache
    cache[cacheKey] = {
      data: responseData,
      timestamp: now,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 }
    );
  }
}