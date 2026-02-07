import Link from "next/link"
import { Coins, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeatCounter } from "@/components/HeatCounter"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Coins className="h-6 w-6 text-primary-gold" />
            <span className="text-primary-red">信</span> <span className="text-primary-gold">黄金</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <HeatCounter />
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">菜单</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}