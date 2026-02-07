import Link from "next/link"
import { Coins } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-red">
              <Coins className="h-6 w-6 text-primary-gold" />
              <span>黄金.xin</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              专业的实时黄金价格展示平台，为您提供准确的市场数据和深度的行情分析。
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">快速链接</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary-red">首页</Link></li>
              <li><Link href="/details/gold" className="hover:text-primary-red">价格详情</Link></li>
              <li><Link href="/analysis" className="hover:text-primary-red">市场分析</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">关于我们</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary-red">关于网站</Link></li>
              <li><Link href="/contact" className="hover:text-primary-red">联系我们</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-red">隐私政策</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">关注我们</h3>
            <p className="text-sm text-muted-foreground mb-2">
              扫描二维码关注公众号
            </p>
            <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
              二维码占位
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 黄金.xin (HuangJin.xin). All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}