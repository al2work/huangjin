import { NextResponse } from "next/server";

// Simple in-memory cache
const cache: { data: any; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_DURATION = 30 * 1000; // 30 seconds

interface EastmoneyPriceData {
  f43: number; // Latest Price
  f44: number; // High
  f46: number; // Open
  f57: string; // Code
  f58: string; // Name
  f169: number; // Change Amount
  f170: number; // Change Percent
}

async function fetchEastmoneyPrice(secid: string): Promise<EastmoneyPriceData | null> {
  try {
    const url = `https://push2.eastmoney.com/api/qt/stock/get?invt=2&fltt=2&fields=f43,f57,f58,f46,f44,f169,f170&secid=${secid}`;
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) return null;
    
    const json = await response.json();
    if (json && json.data) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching Eastmoney data for ${secid}:`, error);
    return null;
  }
}

export async function GET() {
  const now = Date.now();
  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    return NextResponse.json(cache.data);
  }

  try {
    // 118.AU9999 (Gold 9999), 118.AGTD (Silver T+D), 118.PT9995 (Platinum 9995)
    // SGE market code in Eastmoney is usually 118 (Shanghai Gold Exchange)
    const [goldData, silverData, platinumData] = await Promise.all([
      fetchEastmoneyPrice('118.AU9999'),
      fetchEastmoneyPrice('118.AGTD'),
      fetchEastmoneyPrice('118.PT9995')
    ]);

    // Fallback logic handled below
    const prices = {
      GOLD: {
        symbol: "Au99.99",
        name: "黄金9999",
        price: goldData?.f43 ?? 0,
        change: goldData?.f169 ?? 0,
        changePercent: goldData?.f170 ?? 0,
        timestamp: now,
      },
      SILVER: {
        symbol: "Ag(T+D)",
        name: "白银T+D",
        price: silverData?.f43 ?? 0,
        change: silverData?.f169 ?? 0,
        changePercent: silverData?.f170 ?? 0,
        timestamp: now,
      },
      PLATINUM: {
        symbol: "Pt99.95",
        name: "铂金9995",
        price: platinumData?.f43 ?? 0,
        change: platinumData?.f169 ?? 0,
        changePercent: platinumData?.f170 ?? 0,
        timestamp: now,
      },
    };

    // If all failed, check if we have old cache
    if ((!goldData || !silverData || !platinumData) && cache.data) {
        // If some succeeded, update cache partly? No, simple strategy: use fresh if mostly good, or old cache.
        // But here we return what we got.
    }

    // Only update cache if we got at least Gold data
    if (goldData) {
      cache.data = prices;
      cache.timestamp = now;
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error("Error fetching prices:", error);
    
    if (cache.data) {
      return NextResponse.json(cache.data);
    }

    // Fallback static data
    const fallbackPrices = {
       GOLD: { symbol: "Au99.99", name: "黄金9999", price: 1110.00, change: 16.15, changePercent: 1.48, timestamp: now },
       SILVER: { symbol: "Ag(T+D)", name: "白银T+D", price: 18848.00, change: 719.0, changePercent: 3.97, timestamp: now },
       PLATINUM: { symbol: "Pt99.95", name: "铂金9995", price: 536.20, change: 8.21, changePercent: 1.55, timestamp: now },
       _isFallback: true 
    };

    return NextResponse.json(fallbackPrices);
  }
}