import { NextResponse } from "next/server";

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

async function fetchEastmoneyKline(secid: string, klt: string, limit: number): Promise<KlineData[]> {
  // klt: 101=Day, 102=Week, 103=Month, 1=1min, 5=5min, 15=15min, 30=30min, 60=60min
  // fields1: f1,f2,f3,f4,f5,f6
  // fields2: f51(Time), f52(Open), f53(Close), f54(High), f55(Low), f56(Vol), f57(Amt), f58(Amp)
  const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55&klt=${klt}&fqt=1&end=20500101&lmt=${limit}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const json = await response.json();
    if (!json || !json.data || !json.data.klines) return [];

    return json.data.klines.map((item: string) => {
      const parts = item.split(",");
      // parts[0] is time string, e.g., "2023-10-27" or "2023-10-27 10:15"
      // lightweight-charts expects seconds for time
      const timeStr = parts[0];
      const time = Math.floor(new Date(timeStr).getTime() / 1000);
      
      return {
        time,
        open: parseFloat(parts[1]),
        close: parseFloat(parts[2]),
        high: parseFloat(parts[3]),
        low: parseFloat(parts[4]),
      };
    });
  } catch (error) {
    console.error(`Error fetching Eastmoney kline for ${secid}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "24h";
  const symbol = searchParams.get("symbol") || "GOLD";

  // Map symbols to Eastmoney secids
  // 118 is the market code for SGE in Eastmoney
  const symbolMap: Record<string, string> = {
    GOLD: "118.AU9999",
    SILVER: "118.AGTD",
    PLATINUM: "118.PT9995",
  };

  const secid = symbolMap[symbol] || "118.AU9999";
  const cacheKey = `${secid}-${period}`;

  // Check cache
  const now = Date.now();
  if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_DURATION)) {
    return NextResponse.json(cache[cacheKey].data);
  }

  try {
    let klt = "15"; // Default 15 min
    let limit = 96; // Default ~1 day (24h * 4)

    if (period === "24h") {
      klt = "15"; // 15 min
      limit = 100; // ~24h
    } else if (period === "7d") {
      klt = "60"; // 60 min
      limit = 170; // 7 * 24 approx
    } else {
      klt = "101"; // Daily
      limit = 60; // 30-60 days
    }

    const data = await fetchEastmoneyKline(secid, klt, limit);

    if (!data || data.length === 0) {
       // Return empty or fallback if needed, but preferably empty so UI knows
       // However, to prevent crashes, we might want to return at least something or handle empty in UI
    }

    const responseData = {
      symbol,
      period,
      data,
    };

    // Update cache
    if (data.length > 0) {
        cache[cacheKey] = {
            data: responseData,
            timestamp: now,
        };
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 }
    );
  }
}
