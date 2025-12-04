// Definición de tipos para una mayor claridad y seguridad
interface OrderItem {
  // Define la estructura de un item en el pedido, por ejemplo:
  productId: string;
  quantity: number;
  price: number;
}

interface CreateOrderPayload {
  tenantId: string;
  items: OrderItem[];
  total: number;
}

interface CreateOrderResponse {
  orderId: string;
  message: string;
}

interface OrderStatus {
  orderId: string;
  status: 'EN_COCINA' | 'EMPACADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  // ... otras propiedades que pueda tener el objeto de estado del pedido
}

const API_BASE_URL = 'https://tjutjvm10b.execute-api.us-east-1.amazonaws.com';

/**
 * Crea un nuevo pedido enviando los datos al API Gateway.
 * @param {OrderItem[]} items - Array de productos en el pedido.
 * @param {number} total - El monto total del pedido.
 * @returns {Promise<CreateOrderResponse>} - La respuesta de la API con el ID del pedido.
 */
export const createOrder = async (items: OrderItem[], total: number): Promise<CreateOrderResponse> => {
  const payload: CreateOrderPayload = {
    tenantId: 'sede-central', // Tal como se requiere en el body
    items,
    total,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Si la respuesta no es 2xx, lanza un error que será capturado por el bloque catch.
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el pedido.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createOrder:', error);
    // Re-lanza el error para que el componente que llama pueda manejarlo.
    throw error;
  }
};

/**
 * Obtiene la lista de todos los pedidos y sus estados.
 * @returns {Promise<OrderStatus[]>} - Un array con los estados de los pedidos.
 */
export const getOrders = async (): Promise<OrderStatus[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener los pedidos.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getOrders:', error);
    throw error;
  }
};