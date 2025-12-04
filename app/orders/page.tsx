"use client";

import React, { useState, useEffect } from "react";
import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react";
import * as chinaWokApi from "@/lib/chinaWokApi"; // Asegúrate que esta ruta sea correcta
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBasket, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// 1. DEFINICIÓN ROBUSTA DE TIPOS (Para aceptar formato DynamoDB y Normal)
type OrderStatus = 'EN_COCINA' | 'EMPACADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

// Interfaz flexible para los items
interface OrderItem {
  // Formato limpio
  name?: string;
  price?: number;
  
  // Formato DynamoDB (Marshalled)
  M?: {
    productId?: { S: string };
    price?: { N: string };
    quantity?: { N: string };
  };
}

interface Order {
  orderId: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  customer: { address: string };
  updatedAt?: string; // Opcional porque pedidos viejos quizás no lo tengan
}

// 2. COMPONENTE DE LISTA
function MyOrdersList() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.username) return;

    const fetchOrders = async () => {
      try {
        setError(null);
        // Asegúrate que getMyOrders acepte el username correctamente
        const userOrders = await chinaWokApi.getMyOrders(user.username);
        
        // Ordenamiento seguro (evita error si updatedAt no existe)
        userOrders.sort((a: Order, b: Order) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
        });
        
        setOrders(userOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("No se pudieron cargar los pedidos.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // Polling cada 5 segundos
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, [user]);

  // Función auxiliar para colores de estado
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'EN_COCINA': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EMPACADO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EN_CAMINO': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'ENTREGADO': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <p className="ml-3 text-gray-600 font-medium">Sincronizando con cocina...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-red-500">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <ShoppingBasket className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Sin pedidos recientes</h3>
        <p className="text-gray-500 text-sm mt-1">¡Pide algo rico hoy!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.orderId} className="overflow-hidden border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="bg-gray-50/50 pb-3">
            <div className="flex justify-between items-start">
              <div>
                {/* ID COMPLETO SIN CORTES */}
                <CardTitle className="text-base font-bold text-gray-800">
                  Pedido #{order.orderId}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-1">
                  {order.updatedAt 
                    ? new Date(order.updatedAt).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'Fecha pendiente'}
                </CardDescription>
              </div>
              <Badge className={`${getStatusBadgeClass(order.status)} px-3 py-1`}>
                {order.status ? order.status.replace('_', ' ') : 'PROCESANDO'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="space-y-3">
              {/* LISTA DE PLATOS */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detalle del pedido</p>

<ul className="space-y-2">
  {order.items && order.items.length > 0 ? (
    order.items.map((item: any, index: number) => {
      let displayName = "Producto desconocido";
      let displayPrice = "0.00";

      // CASO 1: Formato DynamoDB Crudo (M, S, N)
      if (item.M) {
        displayName = item.M.productId?.S || item.M.name?.S || "Item sin nombre";
        displayPrice = item.M.price?.N || "0";
      } 
      // CASO 2: Formato Limpio (Lo más probable ahora)
      else {
        // Puede venir como 'name' O como 'productId'
        displayName = item.name || item.productId || "Item sin nombre";
        displayPrice = item.price?.toString() || "0";
      }

      // Limpieza visual: quitar guiones y mayúsculas
      displayName = displayName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase());

      const finalPrice = parseFloat(displayPrice).toFixed(2);

      return (
        <li key={index} className="flex justify-between text-sm text-gray-700 border-b border-gray-100 pb-1 last:border-0">
          <span>• {displayName}</span>
          <span className="font-semibold text-gray-900">S/ {finalPrice}</span>
        </li>
      );
    })
  ) : (
    <li className="text-sm text-gray-400 italic">Procesando detalles...</li>
  )}
</ul>
              </div>

              {/* DIRECCIÓN Y TOTAL */}
              <div className="flex justify-between items-end pt-2 mt-2 bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">
                  <span className="font-bold">Envío a:</span><br/>
                  {order.customer?.address || "Retiro en tienda"}
                </div>
                <div className="text-right">
                   <span className="text-xs text-gray-400">Total</span><br/>
                   <span className="text-lg font-bold text-red-600">S/ {order.total ? Number(order.total).toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 3. COMPONENTE PRINCIPAL (PÁGINA)
export default function OrdersPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
           📦 Mis Pedidos
        </h1>
      </div>
      
      {/* El Authenticator envuelve todo para asegurar login */}
      <Authenticator>
        {({ signOut, user }) => (
          <div className="space-y-6">
            {/* Opcional: Mostrar quién está logueado */}
            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                <span>Hola, <strong>{user?.username}</strong></span>
                <button onClick={signOut} className="underline hover:text-blue-600">Cerrar Sesión</button>
            </div>

            <MyOrdersList />
          </div>
        )}
      </Authenticator>
    </main>
  );
}