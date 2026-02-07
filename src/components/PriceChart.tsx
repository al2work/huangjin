"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, Time, CandlestickSeries } from "lightweight-charts";

export function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#737373",
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: "rgba(197, 203, 206, 0.1)" },
        horzLines: { color: "rgba(197, 203, 206, 0.1)" },
      },
      rightPriceScale: {
        borderColor: "rgba(197, 203, 206, 0.4)",
      },
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.4)",
        timeVisible: true,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444", // red-500
      downColor: "#22c55e", // green-500
      borderVisible: false,
      wickUpColor: "#ef4444",
      wickDownColor: "#22c55e",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Fetch data
    fetch("/api/history?symbol=GOLD&period=24h")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          series.setData(data.data);
          chart.timeScale().fitContent();
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch chart data:", err);
        setIsLoading(false);
      });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  return (
    <div ref={chartContainerRef} className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
          <div className="text-muted-foreground animate-pulse">数据加载中...</div>
        </div>
      )}
    </div>
  );
}