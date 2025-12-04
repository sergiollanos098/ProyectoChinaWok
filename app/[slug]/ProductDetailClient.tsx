// app/[slug]/ProductDetailClient.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductDetailClient({ slug }: { slug: string }) {
  // Datos Mock (Aquí podrías usar useEffect para cargar datos reales si quisieras)
  const product = {
    title: slug === 'chaufa' ? "Arroz Chaufa de Pollo" : "Combo Especial ChinaWok",
    description: "Delicioso arroz chaufa de pollo salteado al wok con la receta secreta, acompañado de 2 wantanes fritos y gaseosa personal.",
    price: 24.9,
    originalPrice: 35.9,
    image: "/chinese-food-combo.jpg", // Asegúrate que esta imagen exista en /public o fallará
    rating: 4.8,
    reviews: 124,
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagen */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
             {/* Usamos img estándar para evitar líos con Image de Next en static export */}
            <img
              src="https://www.chinawok.com.pe/assets/images/home/promociones/desktop/duo-sopa-al-wok.jpg" 
              alt={product.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Detalles */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-red-600 hover:bg-red-700">Promoción</Badge>
              <div className="flex items-center text-yellow-500 text-sm font-medium">
                <Star className="w-4 h-4 fill-current mr-1" />
                {product.rating} ({product.reviews} reseñas)
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
            <p className="text-gray-500 text-lg leading-relaxed">{product.description}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Personaliza tu pedido</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-sm font-medium">Agrandar papas</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">+ S/4.90</span>
                  <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 line-through">S/{product.originalPrice.toFixed(2)}</span>
                <span className="text-4xl font-black text-gray-900">S/{product.price.toFixed(2)}</span>
              </div>
              
              {/* Controles de Cantidad */}
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white">
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-bold text-lg">1</span>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-200/50 text-white">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Agregar al Carrito
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}