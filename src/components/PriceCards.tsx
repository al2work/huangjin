"use client";

import useSWR from "swr";
import { ArrowUp, ArrowDown } from "lucide-react";
import { clsx } from "clsx";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PriceData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

interface PricesResponse {
  GOLD: PriceData;
  SILVER: PriceData;
}

export function PriceCards({
  onSelectSymbol,
  selectedSymbol,
}: {
  onSelectSymbol?: (symbol: string) => void;
  selectedSymbol?: string;
}) {
  const { data, error, isLoading } = useSWR<PricesResponse>("/api/prices", fetcher, {
    refreshInterval: 5000,
  });

  if (error || (data && "error" in data)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-center h-40">
            <div className="text-muted-foreground text-center">
              <p>数据获取失败</p>
              <p className="text-xs mt-1">请稍后重试</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isLoading || !data || !data.GOLD || !data.SILVER) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-muted"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      key: "GOLD",
      color: "text-primary-red",
      barColor: "bg-primary-gold",
      data: data.GOLD,
    },
    {
      key: "SILVER",
      color: "text-green-600",
      barColor: "bg-gray-400",
      data: data.SILVER,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card) => {
        // Defensive check: ensure card.data exists
        if (!card.data) return null;

        const change = card.data.change ?? 0;
        const changePercent = card.data.changePercent ?? 0;
        const price = card.data.price ?? 0;

        const isUp = change >= 0;
        const ColorClass = isUp ? "text-primary-red" : "text-green-600";
        const Icon = isUp ? ArrowUp : ArrowDown;

        return (
          <div
            key={card.key}
            onClick={() => onSelectSymbol?.(card.key)}
            className={`rounded-xl border bg-card text-card-foreground shadow-sm p-6 cursor-pointer transition-all ${selectedSymbol === card.key ? "ring-2 ring-primary-gold" : "hover:border-primary-gold/50"
              }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className={`w-2 h-8 rounded-full ${card.barColor}`}></span>
                {card.data.name} ({card.data.symbol})
              </h3>
              <span className="text-sm text-muted-foreground">实时</span>
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className={`text-4xl font-bold ${ColorClass}`}>
                {price.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground mb-1">元/克</span>
            </div>
            <div className={`flex items-center text-sm font-medium ${ColorClass}`}>
              <Icon className="h-4 w-4 mr-1" />
              {change > 0 ? "+" : ""}
              {change.toFixed(2)} ({change > 0 ? "+" : ""}
              {changePercent.toFixed(2)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
}
