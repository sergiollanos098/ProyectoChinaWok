"use client"
import { Search, User, ShoppingCart, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context/cart-context"

export function Header() {
  const { total } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <div className="relative h-10 w-40">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/China_Wok_logo.svg/1200px-China_Wok_logo.svg.png"
              alt="China Wok"
              className="h-full w-full object-contain"
            />
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/menu"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-cw-red"
          >
            <img src="/bowl.jpg" alt="" className="h-6 w-6" />
            Menú
          </Link>
          <Link
            href="/menu"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-cw-red"
          >
            <img src="/discount-sign.png" alt="" className="h-6 w-6" />
            Promos exclusivas
          </Link>
          <Link
            href="/locales"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-cw-red"
          >
            <MapPin className="h-5 w-5" />
            Locales
          </Link>
          <button className="text-gray-700 hover:text-cw-red">
            <Search className="h-5 w-5" />
          </button>
        </nav>
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-2 text-sm md:flex">
            <Phone className="h-4 w-4" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-gray-500">Llámanos</span>
              <a href="tel:016128000" className="font-bold text-cw-green">
                01 - 612 - 8000
              </a>
            </div>
          </div>

          <Link
            href="/customer/account"
            className="hidden items-center gap-2 md:flex hover:opacity-80 transition-opacity"
          >
            <User className="h-6 w-6 text-gray-600" />
            <div className="flex flex-col leading-tight text-sm">
              <span className="text-gray-500">Hola,</span>
              <span className="font-bold text-cw-green">
                INICIAR SESIÓN
              </span>
            </div>
          </Link>

          <Link href="/checkout/cart">
            <Button className="bg-cw-green hover:bg-green-700 text-white rounded-full px-6">
              <ShoppingCart className="mr-2 h-4 w-4" />
              S/ {total.toFixed(2)}
            </Button>
          </Link>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <Button
              className="bg-cw-green hover:bg-green-700 text-white rounded-full h-8 text-xs px-4 font-normal"
            >
              <MapPin className="mr-2 h-3 w-3" />
              ¡Comienza tu pedido! Elige tu dirección
            </Button>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
            <button className="flex items-center gap-1 hover:text-cw-red">
              <span className="text-red-500">♡</span> Mis Favoritos
            </button>
            <Link
              href="/tracking/order"
              className="flex items-center gap-1 hover:text-cw-red"
            >
              <span>🕒</span> Sigue tu pedido
            </Link>
            <Link href="/orders" className="flex items-center gap-1 hover:text-cw-red">
              <span>📋</span> Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-cw-red py-1.5 text-center text-xs font-medium text-white">
        ENVIO GRATIS DE LUNES A JUEVES por compras mayores a S/24.90 | EXCLUSIVO POR WEB
      </div>
    </header>
  )
}
