import { NextResponse } from "next/server";
import querystring from 'querystring';

// --- Raw Data Cache ---
// Stores accumulated raw data from SGE (zp: morning, wp: afternoon)
// Key: Symbol (GOLD, SILVER)
interface RawData {
  zp: [number, number][]; // [timestamp_ms, price]
  wp: [number, number][]; // [timestamp_ms, price]
}

interface CacheEntry {
  data: RawData;
  lastFetchTime: number;
}

// Global cache to persist across requests (in a long-running process)
const rawCache: Record<string, CacheEntry> = {};

const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour
const BASE_START_DATE = '2024-01-01'; // Fetch history starting from here if cache is empty

async function fetchSgeData(path: string, startDate: string) {
  const postData = querystring.stringify({
    start: startDate,
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
    console.error(`Error fetching SGE history for ${path} from ${startDate}:`, error);
    return null;
  }
}

// Helper: Merge new data into existing raw data
// Uses a Map keyed by timestamp to handle deduplication and updates
function mergeRawData(existing: RawData, incoming: any): RawData {
  const map = new Map<number, { zp?: number; wp?: number }>();

  // Load existing
  existing.zp.forEach(([ts, price]) => {
    if (!map.has(ts)) map.set(ts, {});
    map.get(ts)!.zp = price;
  });
  existing.wp?.forEach(([ts, price]) => {
    if (!map.has(ts)) map.set(ts, {});
    map.get(ts)!.wp = price;
  });

  // Load incoming (overwrite existing for same timestamp)
  if (incoming.zp) {
    incoming.zp.forEach(([ts, price]: [number, number]) => {
      if (!map.has(ts)) map.set(ts, {});
      map.get(ts)!.zp = price;
    });
  }
  if (incoming.wp) {
    incoming.wp.forEach(([ts, price]: [number, number]) => {
      if (!map.has(ts)) map.set(ts, {});
      map.get(ts)!.wp = price;
    });
  }

  // Convert back to sorted arrays
  const sortedTimestamps = Array.from(map.keys()).sort((a, b) => a - b);
  const result: RawData = { zp: [], wp: [] };

  sortedTimestamps.forEach(ts => {
    const entry = map.get(ts)!;
    if (entry.zp !== undefined) result.zp.push([ts, entry.zp]);
    if (entry.wp !== undefined) result.wp.push([ts, entry.wp]);
  });

  return result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "24h";
  const symbol = searchParams.get("symbol") || "GOLD";

  try {
    let path = '';
    if (symbol === 'GOLD') path = '/graph/DayilyJzj';
    else if (symbol === 'SILVER') path = '/graph/DayilyShsilverJzj';
    else {
      return NextResponse.json({ symbol, period, data: [] });
    }

    const now = Date.now();
    let cacheEntry = rawCache[symbol];

    // Determine if we need to fetch
    let shouldFetch = false;
    let fetchStartDate = BASE_START_DATE;

    if (!cacheEntry) {
      // 1. No cache: Fetch full history
      shouldFetch = true;
      fetchStartDate = BASE_START_DATE;
    } else if (now - cacheEntry.lastFetchTime > REFRESH_INTERVAL) {
      // 2. Cache expired: Fetch incremental
      shouldFetch = true;
      // Use the last known date in cache as start date
      if (cacheEntry.data.zp.length > 0) {
        const lastMs = cacheEntry.data.zp[cacheEntry.data.zp.length - 1][0];
        fetchStartDate = new Date(lastMs).toISOString().split('T')[0];
      } else {
        fetchStartDate = BASE_START_DATE;
      }
    }

    if (shouldFetch) {
      const newData = await fetchSgeData(path, fetchStartDate);

      if (newData && newData.zp) {
        if (!cacheEntry) {
          // Initialize cache
          rawCache[symbol] = {
            data: { zp: newData.zp, wp: newData.wp || [] },
            lastFetchTime: now
          };
        } else {
          // Merge and update
          const merged = mergeRawData(cacheEntry.data, newData);
          rawCache[symbol] = {
            data: merged,
            lastFetchTime: now
          };
        }
      }
    }

    // Retrieve from cache (now updated or existing)
    cacheEntry = rawCache[symbol];
    if (!cacheEntry || !cacheEntry.data) {
      throw new Error("No data available");
    }

    const sgeData = cacheEntry.data;

    // Convert SGE format to K-line
    const klineData = sgeData.zp.map((item, index) => {
      // Convert SGE timestamp (00:00 CST) to correct date string (YYYY-MM-DD)
      // SGE timestamp item[0] is in ms, representing 00:00 CST of the trading day.
      // 00:00 CST = 16:00 UTC previous day.
      // To get the correct date string for the CST day, we add 8 hours (28800000 ms) to align it to 00:00 UTC of that day.
      const dateStr = new Date(item[0] + 28800000).toISOString().split('T')[0];

      const open = item[1]; // Morning

      // Look for matching Afternoon price (wp) with same timestamp
      const wpItem = sgeData.wp.find(w => w[0] === item[0]);

      let close = open;
      if (wpItem) {
        close = wpItem[1];
      }

      // Handle Silver unit conversion (kg -> g)
      const divisor = symbol === 'SILVER' ? 1000 : 1;

      const o = open / divisor;
      const c = close / divisor;
      const h = Math.max(o, c);
      const l = Math.min(o, c);

      return {
        time: dateStr, // Use string format YYYY-MM-DD
        open: o,
        high: h,
        low: l,
        close: c
      };
    });

    // Filter based on period
    let slicedData = klineData;
    const len = klineData.length;

    switch (period) {
      case '1w':
        slicedData = klineData.slice(Math.max(0, len - 5)); // 1 week ~ 5 trading days
        break;
      case '2w':
        slicedData = klineData.slice(Math.max(0, len - 10)); // 2 weeks ~ 10 trading days
        break;
      case '1m':
        slicedData = klineData.slice(Math.max(0, len - 30));
        break;
      case '3m':
        slicedData = klineData.slice(Math.max(0, len - 90));
        break;
      case '6m':
        slicedData = klineData.slice(Math.max(0, len - 180));
        break;
      case '1y':
        slicedData = klineData.slice(Math.max(0, len - 365));
        break;
      case 'All':
        slicedData = klineData;
        break;
      default:
        // Default to 1w if unknown or other legacy params
        slicedData = klineData.slice(Math.max(0, len - 5));
        break;
    }

    return NextResponse.json({
      symbol,
      period,
      data: slicedData,
    });

  } catch (error) {
    console.error("Error handling history request:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 }
    );
  }
}
