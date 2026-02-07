import Link from "next/link"
import { Coins, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-red">
            <Coins className="h-6 w-6 text-primary-gold" />
            <span>黄金.xin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary-red">
              首页
            </Link>
            <Link href="/details/gold" className="transition-colors hover:text-primary-red">
              价格详情
            </Link>
            <Link href="/analysis" className="transition-colors hover:text-primary-red">
              市场分析
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="搜索品种..."
              className="h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">菜单</span>
          </Button>
        </div>
      </div>
    </header>
  )
}