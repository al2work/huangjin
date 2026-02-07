"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export function HeatCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Increment heat on component mount (page load)
    const incrementHeat = async () => {
      try {
        const res = await fetch("/api/heat", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
        }
      } catch (error) {
        console.error("Failed to update heat:", error);
      }
    };

    incrementHeat();
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-muted/20 px-3 py-1 rounded-full border border-border/50">
      <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
      <span>今日热度: {count.toLocaleString()}</span>
    </div>
  );
}
