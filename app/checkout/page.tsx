"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/lib/context/cart-context";
import * as chinaWokApi from "@/lib/chinaWokApi";
import { getOrders } from "@/lib/services/orders-service"; // Reutilizamos el servicio de polling
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  User,
  Loader2,
  PackageCheck,
  ShoppingCart,
  LogOut,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";

// Tipos locales
type OrderStatus = "EN_COCINA" | "EMPACADO" | "EN_CAMINO" | "ENTREGADO" | "CANCELADO";
interface Address {
  name: string;
  address: string;
}

/**
 * Componente principal de la página de Checkout.
 * Gestiona la autenticación, direcciones y creación de pedidos.
 */
function CheckoutFlow() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const { items, total, clearCart } = useCart();

  // Estados del componente
  const [loading, setLoading] = useState({ profile: true, order: false, address: false });
  const [error, setError] = useState<string | null>(null);

  // Estados para la gestión de direcciones
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: "", address: "" });

  // Estados para el seguimiento del pedido
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);

  // --- EFECTOS ---

  // 1. Cargar perfil del usuario (direcciones)
  useEffect(() => {
    if (user?.username) {
      fetchProfile();
    }
  }, [user]);

  // 2. Polling para el estado del pedido (reutilizado de la implementación anterior)
  useEffect(() => {
    if (!orderId) return;
    const intervalId = setInterval(async () => {
      try {
        const allOrders = await getOrders();
        const currentOrder = allOrders.find((o) => o.orderId === orderId);
        if (currentOrder) {
          setOrderStatus(currentOrder.status);
          if (["ENTREGADO", "CANCELADO"].includes(currentOrder.status)) {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error("Error durante el polling:", err);
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [orderId]);

  // --- MANEJADORES DE DATOS ---

  const fetchProfile = async () => {
    if (!user?.username) return;
    setLoading(prev => ({ ...prev, profile: true }));
    try {
      const profile = await chinaWokApi.getProfile(user.username);
      
      // Transformar el array de strings de la API a un array de objetos
      const addressesFromApi = profile.addresses || [];
      const formattedAddresses = Array.isArray(addressesFromApi)
        ? addressesFromApi.map((addrStr: string) => ({
            name: addrStr, // Usar el string de la dirección como nombre
            address: addrStr, // y como la dirección misma
          }))
        : [];

      setAddresses(formattedAddresses);
      
      // Si hay direcciones formateadas, selecciona la primera por defecto
      if (formattedAddresses.length > 0) {
        setSelectedAddress(formattedAddresses[0].address);
      }

    } catch (err) {
      console.warn("No se pudo obtener el perfil, puede que sea un usuario nuevo.", err);
      setAddresses([]); // Asegurarse de que las direcciones estén vacías si falla
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.username || !newAddress.name || !newAddress.address) {
      setError("El nombre y la dirección son requeridos.");
      return;
    }
    setLoading(prev => ({ ...prev, address: true }));
    setError(null);
    try {
      await chinaWokApi.saveAddress(user.username, newAddress.address, newAddress.name);
      setNewAddress({ name: "", address: "" });
      setShowNewAddressForm(false);
      await fetchProfile(); // Recargar direcciones
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la dirección.");
    } finally {
      setLoading(prev => ({ ...prev, address: false }));
    }
  };

  const handleCreateOrder = async () => {
    if (!user?.username || !selectedAddress) {
      setError("Debes seleccionar una dirección de envío.");
      return;
    }
    setLoading(prev => ({ ...prev, order: true }));
    setError(null);

    const orderData = {
      tenantId: "chinawok-surco",
      items: items.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
      total: total,
      customer: {
        userId: user.username,
        name: user.attributes?.name || user.username,
        address: selectedAddress,
      },
    };

    try {
      const response = await chinaWokApi.createOrder(orderData);
      if (response && response.orderId) {
        clearCart();
        setOrderId(response.orderId);
        setOrderStatus("EN_COCINA");
      } else {
        setError("Hubo un problema al crear tu pedido.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pedido.");
    } finally {
      setLoading(prev => ({ ...prev, order: false }));
    }
  };

  // --- RENDERIZADO CONDICIONAL ---

  if (items.length === 0 && !orderId) {
    return (
      <div className="text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <p className="text-lg text-gray-600 mb-4">Tu carrito está vacío</p>
        <Button asChild className="bg-cw-green hover:bg-green-700">
          <Link href="/">Volver al menú</Link>
        </Button>
      </div>
    );
  }

  if (orderId) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex flex-col items-center gap-2">
            <PackageCheck className="h-10 w-10 text-cw-green" />
            ¡Gracias por tu pedido!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>ID de tu pedido: <span className="font-mono bg-gray-100 p-1 rounded">{orderId}</span></p>
          <div className="flex items-center justify-center gap-2 text-xl font-bold text-cw-green">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{orderStatus?.replace("_", " ") || "CONSULTANDO..."}</span>
          </div>
          {orderStatus === "ENTREGADO" && <p className="mt-4 text-green-600 font-bold">¡Tu pedido ha sido entregado!</p>}
          <Button asChild className="mt-6 bg-cw-green hover:bg-green-700">
            <Link href="/">Hacer otro pedido</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {/* Columna principal: Direcciones y Usuario */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2"><User className="h-5 w-5" /> Usuario</div>
              <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-2" />Cerrar sesión</Button>
            </CardTitle>
            <p className="text-sm text-gray-600 pt-1">Conectado como: {user.attributes?.email || user.username}</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Dirección de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.profile ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <div className="space-y-4">
                {addresses.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar dirección</label>
                    <select
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      {addresses
                        .filter((addr) => addr && addr.name && addr.address)
                        .map((addr) => (
                          <option key={`${addr.name}-${addr.address}`} value={addr.address}>
                            {addr.name} - {addr.address}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowNewAddressForm(!showNewAddressForm)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {showNewAddressForm ? "Cancelar" : "Añadir nueva dirección"}
                </Button>
                {showNewAddressForm && (
                  <form onSubmit={handleSaveAddress} className="space-y-4 pt-4 border-t">
                    <input type="text" placeholder="Nombre (ej. Casa)" value={newAddress.name} onChange={(e) => setNewAddress(p => ({ ...p, name: e.target.value }))} className="w-full input" required />
                    <input type="text" placeholder="Dirección completa" value={newAddress.address} onChange={(e) => setNewAddress(p => ({ ...p, address: e.target.value }))} className="w-full input" required />
                    <Button type="submit" disabled={loading.address} className="w-full">
                      {loading.address && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Dirección
                    </Button>
                  </form>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Columna lateral: Resumen de Pedido */}
      <div className="md:col-span-1">
        <Card className="sticky top-24">
          <CardHeader><CardTitle>Resumen de Pedido</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* ... (código del resumen de pedido existente) ... */}
            <div className="pt-4 border-t">
              <Button onClick={handleCreateOrder} disabled={loading.order || !selectedAddress} className="w-full bg-cw-green hover:bg-green-700 text-white text-lg h-12">
                {loading.order ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creando pedido...</>) : ("Confirmar Pedido")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Componente contenedor que envuelve el flujo de checkout con el Authenticator de Amplify.
 */
export default function CheckoutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>
      <Authenticator>
        <CheckoutFlow />
      </Authenticator>
    </main>
  );
}