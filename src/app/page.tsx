import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowRight, TrendingUp, BarChart3, Newspaper } from "lucide-react";
import Link from "next/link";
import { PriceChart } from "@/components/PriceChart";
import { PriceCards } from "@/components/PriceCards";

export default function Home() {
  const news = [
    {
      id: 1,
      tag: "市场热点",
      title: "金价站稳1100元关口，多头目标直指1200元？",
      summary: "随着全球央行持续购金及地缘政治避险需求升温，国内现货黄金价格本周强势突破1100元/克大关，创下历史新高...",
      author: "张分析师",
      time: "2小时前"
    },
    {
      id: 2,
      tag: "机构观点",
      title: "高盛上调2026年黄金目标价：超级周期尚未结束",
      summary: "高盛最新研报指出，在实际利率下行和美元信用重构的双重驱动下，黄金牛市仍有下半场，建议投资者逢低布局...",
      author: "李研究员",
      time: "4小时前"
    },
    {
      id: 3,
      tag: "宏观分析",
      title: "美联储降息路径渐明，贵金属市场迎来新一轮爆发期",
      summary: "最新的通胀数据为美联储降息扫清了障碍，市场普遍预期下月将开启降息周期，这将为零息资产黄金提供强劲支撑...",
      author: "王宏观",
      time: "6小时前"
    }
  ];

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
        <PriceCards />
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
          <div className="h-[400px] bg-card flex items-center justify-center text-muted-foreground relative">
            <PriceChart />
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
          {news.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center text-muted-foreground/20">
                  <Newspaper className="h-12 w-12" />
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs text-primary-red font-medium px-2 py-0.5 bg-primary-red/10 rounded-full">{item.tag}</span>
                <h3 className="font-semibold group-hover:text-primary-red transition-colors line-clamp-2 min-h-[3rem]">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.summary}
                </p>
                <div className="flex items-center text-xs text-muted-foreground gap-2 mt-2">
                  <span>{item.author}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}