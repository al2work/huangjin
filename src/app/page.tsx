"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowRight, TrendingUp, BarChart3, Newspaper } from "lucide-react";
import Link from "next/link";
import { ChartSection } from "@/components/ChartSection";
import { PriceCards } from "@/components/PriceCards";

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState("GOLD");

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-red/5 to-transparent py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            <span className="text-primary-red">信</span> <span className="text-primary-gold">黄金</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            相信黄金的价值
          </p>
        </div>
      </section>

      {/* Real-time Prices */}
      <section id="prices" className="container mx-auto px-4 md:px-6">
        <PriceCards selectedSymbol={selectedSymbol} onSelectSymbol={setSelectedSymbol} />
      </section>

      {/* Chart Section */}
      <section className="container mx-auto px-4 md:px-6">
        <ChartSection symbol={selectedSymbol} />
      </section>
    </div>
  );
}