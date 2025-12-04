import type React from "react"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Analytics } from "@vercel/analytics/react"
import { TenantProvider } from "@/lib/context/tenant-context"
import { CartProvider } from "@/lib/context/cart-context"
import ConfigureAmplifyClientSide from "@/components/auth/configure-amplify-client-side"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased min-h-screen flex flex-col`}>
        <TenantProvider>
          <ConfigureAmplifyClientSide />
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Analytics />
          </CartProvider>
        </TenantProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
