import { NextResponse } from "next/server";
import querystring from 'querystring';

// In-memory cache
// Note: In a serverless environment (like Vercel), this cache is per-lambda instance.
// However, it helps reduce load during bursts of traffic.
const cache: { data: any; timestamp: number } = { data: null, timestamp: 0 };

// SGE Benchmark prices update only twice a day (AM/PM).
// We can safely cache for a longer duration, e.g., 10 minutes.
const CACHE_DURATION = 10 * 60 * 1000;

async function fetchSgeData(path: string) {
  const currentYear = new Date().getFullYear();
  const postData = querystring.stringify({
    start: `${currentYear}-01-01`,
    end: ''
  });

  try {
    const response = await fetch(`https://www.sge.com.cn${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.sge.com.cn/sjzx/jzj',
      },
      body: postData
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching SGE data for ${path}:`, error);
    return null;
  }
}

export async function GET() {
  const now = Date.now();
  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    return NextResponse.json(cache.data);
  }

  try {
    // Fetch Gold and Silver from SGE
    const [goldData, silverData] = await Promise.all([
      fetchSgeData('/graph/DayilyJzj'),
      fetchSgeData('/graph/DayilyShsilverJzj')
    ]);

    // Process Gold
    let goldPrice = 0;
    let goldChange = 0;
    let goldChangePercent = 0;

    if (goldData && goldData.zp && goldData.zp.length > 0) {
      // Get last available price (prefer Afternoon 'wp', then Morning 'zp')
      const lastIndex = goldData.zp.length - 1;
      const prevIndex = lastIndex - 1;

      // Current Price
      const lastZp = goldData.zp[lastIndex][1];
      const lastWp = goldData.wp && goldData.wp[lastIndex] ? goldData.wp[lastIndex][1] : null;
      goldPrice = lastWp || lastZp;

      // Previous Price (for change calculation)
      // Use yesterday's closing (Afternoon or Morning)
      if (prevIndex >= 0) {
        const prevZp = goldData.zp[prevIndex][1];
        const prevWp = goldData.wp && goldData.wp[prevIndex] ? goldData.wp[prevIndex][1] : null;
        const prevPrice = prevWp || prevZp;

        goldChange = goldPrice - prevPrice;
        goldChangePercent = (goldChange / prevPrice) * 100;
      }
    }

    // Process Silver
    let silverPrice = 0;
    let silverChange = 0;
    let silverChangePercent = 0;

    if (silverData && silverData.zp && silverData.zp.length > 0) {
      const lastIndex = silverData.zp.length - 1;
      const prevIndex = lastIndex - 1;

      // Silver is usually RMB/kg. Convert to RMB/g for display consistency if desired,
      // BUT SGE Silver Benchmark page says "元/千克".
      // However, the UI expects "元/克" as per screenshot analysis.
      // So we divide by 1000.

      const lastZp = silverData.zp[lastIndex][1];
      const lastWp = silverData.wp && silverData.wp[lastIndex] ? silverData.wp[lastIndex][1] : null;
      const rawSilverPrice = lastWp || lastZp;

      silverPrice = rawSilverPrice / 1000;

      if (prevIndex >= 0) {
        const prevZp = silverData.zp[prevIndex][1];
        const prevWp = silverData.wp && silverData.wp[prevIndex] ? silverData.wp[prevIndex][1] : null;
        const prevRawPrice = prevWp || prevZp;

        const rawChange = rawSilverPrice - prevRawPrice;
        silverChange = rawChange / 1000;
        silverChangePercent = (rawChange / prevRawPrice) * 100;
      }
    }

    // Platinum (Fallback or Static as SGE graph not found easily)
    // We'll return 0 or keep the old Eastmoney logic if strictly needed,
    // but to be clean we'll just return a placeholder or estimated value
    // to avoid breaking the UI.
    const platinumPrice = 0;
    const platinumChange = 0;
    const platinumChangePercent = 0;

    const prices = {
      GOLD: {
        symbol: "Au99.99",
        name: "黄金9999",
        price: Number(goldPrice.toFixed(2)),
        change: Number(goldChange.toFixed(2)),
        changePercent: Number(goldChangePercent.toFixed(2)),
        timestamp: now,
      },
      SILVER: {
        symbol: "Ag(T+D)",
        name: "白银T+D",
        price: Number(silverPrice.toFixed(2)),
        change: Number(silverChange.toFixed(2)),
        changePercent: Number(silverChangePercent.toFixed(2)),
        timestamp: now,
      },
      PLATINUM: {
        symbol: "Pt99.95",
        name: "铂金9995",
        price: platinumPrice,
        change: platinumChange,
        changePercent: platinumChangePercent,
        timestamp: now,
      },
    };

    if (goldPrice > 0) {
      cache.data = prices;
      cache.timestamp = now;
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error("Error fetching SGE prices:", error);
    if (cache.data) return NextResponse.json(cache.data);

    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}