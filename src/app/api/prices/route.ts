import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

// Simple in-memory cache
const cache: { data: any; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_DURATION = 60 * 1000; // 1 minute

export async function GET() {
  const now = Date.now();
  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    return NextResponse.json(cache.data);
  }

  try {
    const results: any[] = await yahooFinance.quote(['GC=F', 'SI=F', 'PL=F', 'CNY=X']);

    const goldQuote = results.find(r => r.symbol === 'GC=F');
    const silverQuote = results.find(r => r.symbol === 'SI=F');
    const platinumQuote = results.find(r => r.symbol === 'PL=F');
    const cnyQuote = results.find(r => r.symbol === 'CNY=X');

    const usdToCny = cnyQuote?.regularMarketPrice || 7.2;
    const ozToGram = 31.1035;

    const convertPrice = (price: number) => Number(((price * usdToCny) / ozToGram).toFixed(2));
    const convertChange = (change: number) => Number(((change * usdToCny) / ozToGram).toFixed(2));

    const prices = {
      GOLD: {
        symbol: "XAU",
        name: "现货黄金",
        price: convertPrice(goldQuote?.regularMarketPrice || 0),
        change: convertChange(goldQuote?.regularMarketChange || 0),
        changePercent: Number((goldQuote?.regularMarketChangePercent || 0).toFixed(2)),
        timestamp: goldQuote?.regularMarketTime?.getTime() || now,
      },
      SILVER: {
        symbol: "XAG",
        name: "现货白银",
        price: convertPrice(silverQuote?.regularMarketPrice || 0),
        change: convertChange(silverQuote?.regularMarketChange || 0),
        changePercent: Number((silverQuote?.regularMarketChangePercent || 0).toFixed(2)),
        timestamp: silverQuote?.regularMarketTime?.getTime() || now,
      },
      PLATINUM: {
        symbol: "XPT",
        name: "现货铂金",
        price: convertPrice(platinumQuote?.regularMarketPrice || 0),
        change: convertChange(platinumQuote?.regularMarketChange || 0),
        changePercent: Number((platinumQuote?.regularMarketChangePercent || 0).toFixed(2)),
        timestamp: platinumQuote?.regularMarketTime?.getTime() || now,
      },
    };

    cache.data = prices;
    cache.timestamp = now;

    return NextResponse.json(prices);
  } catch (error) {
    console.error("Error fetching prices:", error);

    // If cache exists (even old), return it to avoid frontend crash
    if (cache.data) {
      return NextResponse.json(cache.data);
    }

    // Fallback data (all zeros) if no cache and fetch failed
    // This prevents frontend from crashing with "undefined" properties
    const now = Date.now();
    const fallbackPrices = {
      GOLD: { symbol: "XAU", name: "现货黄金", price: 0, change: 0, changePercent: 0, timestamp: now },
      SILVER: { symbol: "XAG", name: "现货白银", price: 0, change: 0, changePercent: 0, timestamp: now },
      PLATINUM: { symbol: "XPT", name: "现货铂金", price: 0, change: 0, changePercent: 0, timestamp: now },
      error: "Failed to fetch data"
    };

    return NextResponse.json(fallbackPrices);
  }
}