import { NextResponse } from "next/server";
import querystring from 'querystring';

// In-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};

// SGE Benchmark history doesn't change for past dates.
// We can cache this for a long time, e.g., 1 hour.
const CACHE_DURATION = 60 * 60 * 1000;

async function fetchSgeData(path: string) {
  const currentYear = new Date().getFullYear();
  // Fetch from 2024 to ensure enough history for charts
  const postData = querystring.stringify({
    start: `2024-01-01`,
    end: ''
  });

  try {
    const response = await fetch(`https://www.sge.com.cn${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.sge.com.cn/sjzx/jzj',
      },
      body: postData
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching SGE history for ${path}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "24h";
  const symbol = searchParams.get("symbol") || "GOLD";

  const cacheKey = `${symbol}-${period}`;
  const now = Date.now();
  if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_DURATION)) {
    return NextResponse.json(cache[cacheKey].data);
  }

  try {
    let path = '';
    if (symbol === 'GOLD') path = '/graph/DayilyJzj';
    else if (symbol === 'SILVER') path = '/graph/DayilyShsilverJzj';
    else {
      // Return empty for others
      return NextResponse.json({ symbol, period, data: [] });
    }

    const sgeData = await fetchSgeData(path);
    if (!sgeData || !sgeData.zp) {
      throw new Error("No data from SGE");
    }

    // Convert SGE format to K-line
    // SGE: zp = [[timestamp, price], ...], wp = [[timestamp, price], ...]
    const klineData = sgeData.zp.map((item: any, index: number) => {
      const timestamp = item[0] / 1000; // Convert ms to seconds
      const open = item[1]; // Morning

      // Try to get Afternoon
      let close = open;
      if (sgeData.wp && sgeData.wp[index]) {
        // Ensure timestamps match or align roughly?
        // SGE arrays usually align by index for the same day.
        close = sgeData.wp[index][1];
      }

      // Handle Silver unit conversion (kg -> g)
      const divisor = symbol === 'SILVER' ? 1000 : 1;

      const o = open / divisor;
      const c = close / divisor;
      const h = Math.max(o, c);
      const l = Math.min(o, c);

      return {
        time: timestamp,
        open: o,
        high: h,
        low: l,
        close: c
      };
    });

    // Filter based on period?
    // SGE data is daily.
    // 24h -> Last 2 days?
    // 7d -> Last 7 entries
    // 30d -> Last 30 entries

    let slicedData = klineData;
    const len = klineData.length;

    if (period === '24h') {
      slicedData = klineData.slice(Math.max(0, len - 5)); // Show last 5 days so it's not empty
    } else if (period === '7d') {
      slicedData = klineData.slice(Math.max(0, len - 7));
    } else {
      slicedData = klineData.slice(Math.max(0, len - 30));
    }

    const responseData = {
      symbol,
      period,
      data: slicedData,
    };

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