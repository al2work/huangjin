"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { PriceChart } from "@/components/PriceChart";

export function ChartSection({ symbol = "GOLD" }: { symbol?: string }) {
  const [period, setPeriod] = useState("1w");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-gold" />
            {symbol === "GOLD" ? "黄金定价值" : "白银定价值"}
          </h3>
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            时间周期:
            <div className="flex bg-muted rounded-sm p-0.5">
              {["1w", "2w", "1m", "3m", "6m", "1y", "All"].map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className={`h-6 px-2 text-xs hover:bg-background hover:text-primary-blue shadow-none ${period === p
                    ? "bg-background text-primary-blue"
                    : "text-muted-foreground"
                    }`}
                  data-state={period === p ? "active" : "inactive"}
                >
                  {p}
                </Button>
              ))}
            </div>
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>From</span>
          <div className="bg-muted px-2 py-1 rounded text-xs border min-w-[80px] text-center">
            {dateRange.from || "-"}
          </div>
          <span>To</span>
          <div className="bg-muted px-2 py-1 rounded text-xs border min-w-[80px] text-center">
            {dateRange.to || "-"}
          </div>
        </div>
      </div>
      <div className="h-[400px] bg-card flex items-center justify-center text-muted-foreground relative">
        <PriceChart key={symbol} symbol={symbol} period={period} onDateRangeChange={setDateRange} />
      </div>
    </div>
  );
}
