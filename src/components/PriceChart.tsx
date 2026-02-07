"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, Time, LineSeries } from "lightweight-charts";

export function PriceChart({
  period = "1m",
  symbol = "GOLD",
  onDateRangeChange,
}: {
  period?: string;
  symbol?: string;
  onDateRangeChange?: (range: { from: string; to: string }) => void;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const morningSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const afternoonSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tooltipRef = useRef<HTMLDivElement>(null);

  // Helper to format date
  const formatDate = (time: Time) => {
    if (typeof time === "string") return time;
    if (typeof time === "number") {
      // Convert to China Standard Time (UTC+8)
      // The timestamp from API is seconds. SGE timestamps are 00:00 CST (16:00 UTC previous day).
      // We want to display the CST date.
      const date = new Date(time * 1000);
      return date.toLocaleDateString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');
    }
    // Handle BusinessDay object if needed, though we use timestamps here
    return "";
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#737373",
        attributionLogo: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: "rgba(197, 203, 206, 0.1)" },
        horzLines: { color: "rgba(197, 203, 206, 0.1)" },
      },
      rightPriceScale: {
        visible: true, // Show right scale
        borderColor: "rgba(197, 203, 206, 0.4)",
      },
      leftPriceScale: {
        visible: true, // Show left scale
        borderColor: "rgba(197, 203, 206, 0.4)",
      },
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.4)",
        timeVisible: true,
      },
    });

    // Create Line Series for Morning Price (Early Trading)
    const morningSeries = chart.addSeries(LineSeries, {
      color: "#ef4444", // red-500
      lineWidth: 2,
      title: "早盘价",
      priceScaleId: 'left',
    });

    // Create Line Series for Afternoon Price (Midday Trading)
    const afternoonSeries = chart.addSeries(LineSeries, {
      color: "#3b82f6", // blue-500
      lineWidth: 2,
      title: "午盘价",
      priceScaleId: 'right',
    });

    // Subscribe to crosshair move
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        if (tooltipRef.current) {
          tooltipRef.current.style.display = "none";
        }
        return;
      }

      if (tooltipRef.current) {
        const dateStr = formatDate(param.time);

        const morningData = param.seriesData.get(morningSeries);
        const afternoonData = param.seriesData.get(afternoonSeries);

        const morningPrice = morningData && 'value' in morningData ? morningData.value : undefined;
        const afternoonPrice = afternoonData && 'value' in afternoonData ? afternoonData.value : undefined;

        tooltipRef.current.style.display = "block";
        tooltipRef.current.style.left = param.point.x + "px";
        tooltipRef.current.style.top = param.point.y + "px";

        let tooltipContent = `<div class="font-medium mb-1">${dateStr}</div>`;

        if (morningPrice !== undefined) {
          tooltipContent += `
            <div class="flex items-center gap-2 text-sm">
              <span class="w-2 h-2 rounded-full bg-[#ef4444]"></span>
              <span class="text-muted-foreground">早盘:</span>
              <span class="font-mono font-medium">${(morningPrice as number).toFixed(2)}</span>
            </div>
          `;
        }

        if (afternoonPrice !== undefined) {
          tooltipContent += `
            <div class="flex items-center gap-2 text-sm">
              <span class="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
              <span class="text-muted-foreground">午盘:</span>
              <span class="font-mono font-medium">${(afternoonPrice as number).toFixed(2)}</span>
            </div>
          `;
        }

        tooltipRef.current.innerHTML = tooltipContent;
      }
    });

    chartRef.current = chart;
    morningSeriesRef.current = morningSeries;
    afternoonSeriesRef.current = afternoonSeries;

    // Subscribe to visible logical range changes
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      const timeScale = chart.timeScale();
      const logicalRange = timeScale.getVisibleLogicalRange();
      if (logicalRange) {
        const fromLogical = logicalRange.from;
        const toLogical = logicalRange.to;
        // Since we can't easily convert logical index to time without data access,
        // we rely on the visible time range if available or just update on data load.
        // lightweight-charts v4+ has getVisibleRange() returning time range?
        // No, standard API uses getVisibleLogicalRange().
        // However, we can use coordinateToTime? No.
        // Best is to update range when data is loaded, and maybe on scroll if we want strict sync.
        // For now, let's stick to updating when data is loaded as per user request (showing the loaded period).
      }
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
  }, []); // Only run once on mount for chart creation

  // Fetch data when period or symbol changes
  useEffect(() => {
    if (!chartRef.current || !morningSeriesRef.current || !afternoonSeriesRef.current) return;

    setIsLoading(true);
    fetch(`/api/history?symbol=${symbol}&period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          // Transform K-line data back to separate line series data
          const morningData = data.data.map((item: any) => ({
            time: item.time,
            value: item.open, // Using 'open' as Morning price
          }));

          const afternoonData = data.data
            .filter((item: any) => item.close !== undefined && item.close !== item.open) // Only if close exists/differs? SGE logic says close is afternoon.
            .map((item: any) => ({
              time: item.time,
              value: item.close, // Using 'close' as Afternoon price
            }));

          morningSeriesRef.current?.setData(morningData);
          afternoonSeriesRef.current?.setData(afternoonData);

          chartRef.current?.timeScale().fitContent();

          // Update date range
          if (data.data.length > 0) {
            const first = data.data[0].time;
            const last = data.data[data.data.length - 1].time;
            onDateRangeChange?.({
              from: formatDate(first),
              to: formatDate(last),
            });
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch chart data:", err);
        setIsLoading(false);
      });
  }, [period, symbol]); // Re-run when period or symbol changes

  return (
    <div ref={chartContainerRef} className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
          <div className="text-muted-foreground animate-pulse">数据加载中...</div>
        </div>
      )}
      <div
        ref={tooltipRef}
        className="absolute hidden pointer-events-none bg-background/95 border rounded-lg shadow-lg p-3 z-20 min-w-[160px] transform -translate-x-1/2 -translate-y-[120%]"
        style={{ left: 0, top: 0 }}
      />
    </div>
  );
}