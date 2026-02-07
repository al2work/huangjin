import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowRight, TrendingUp, BarChart3, Newspaper } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-red/5 to-transparent py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            把握<span className="text-primary-red">黄金</span>脉搏，洞悉财富先机
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            实时精准的贵金属报价，专业的市场深度分析，助您在瞬息万变的金融市场中运筹帷幄。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-red hover:bg-primary-red/90 text-white border-none">
              查看实时行情 <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              阅读市场周报 <Newspaper className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Real-time Prices */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gold Card */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-2 h-8 bg-primary-gold rounded-full"></span>
                现货黄金 (XAU)
              </h3>
              <span className="text-sm text-muted-foreground">实时</span>
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-4xl font-bold text-primary-red">485.50</span>
              <span className="text-sm text-muted-foreground mb-1">元/克</span>
            </div>
            <div className="flex items-center text-primary-red text-sm font-medium">
              <ArrowUp className="h-4 w-4 mr-1" />
              +2.30 (+0.48%)
            </div>
          </div>

          {/* Silver Card */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-2 h-8 bg-gray-400 rounded-full"></span>
                现货白银 (XAG)
              </h3>
              <span className="text-sm text-muted-foreground">实时</span>
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-4xl font-bold text-green-600">5.82</span>
              <span className="text-sm text-muted-foreground mb-1">元/克</span>
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUp className="h-4 w-4 mr-1 rotate-180" />
              -0.05 (-0.85%)
            </div>
          </div>

          {/* Platinum Card */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-400 rounded-full"></span>
                现货铂金 (XPT)
              </h3>
              <span className="text-sm text-muted-foreground">实时</span>
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-4xl font-bold text-primary-red">215.30</span>
              <span className="text-sm text-muted-foreground mb-1">元/克</span>
            </div>
            <div className="flex items-center text-primary-red text-sm font-medium">
              <ArrowUp className="h-4 w-4 mr-1" />
              +1.20 (+0.56%)
            </div>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-gold" />
              24小时价格走势
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">24H</Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs">7D</Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs">30D</Button>
            </div>
          </div>
          <div className="h-[400px] bg-muted/20 flex items-center justify-center text-muted-foreground">
            {/* Chart Component Placeholder */}
            <div className="text-center">
              <p>图表加载中...</p>
              <p className="text-xs mt-2">（此处将集成TradingView图表）</p>
            </div>
          </div>
        </div>
      </section>

      {/* Market News */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">市场分析</h2>
          <Link href="/analysis" className="text-sm text-primary-red hover:underline flex items-center">
            查看更多 <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="space-y-2">
                <span className="text-xs text-primary-red font-medium">专家观点</span>
                <h3 className="font-semibold group-hover:text-primary-red transition-colors">
                  本周黄金价格能否突破2100美元大关？美联储最新纪要解读
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  随着通胀数据回落，市场对降息预期升温，黄金作为避险资产再次受到追捧...
                </p>
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                  <span>张分析师</span>
                  <span>•</span>
                  <span>2小时前</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}