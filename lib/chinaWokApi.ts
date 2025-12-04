import { fetchAuthSession } from "aws-amplify/auth";

// URL base de tu API Gateway
const API_BASE_URL = "https://tjutjvm10b.execute-api.us-east-1.amazonaws.com";

// --- Tipos de Datos ---
// Define las estructuras de datos para mayor claridad y seguridad de tipos.

interface Address {
  name: string;
  address: string;
}

interface UserProfile {
  userId: string;
  name: string;
  addresses: Address[];
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderData {
  tenantId: string;
  items: OrderItem[];
  total: number;
  customer: {
    userId: string;
    name: string;
    address: string;
  };
}

// --- Helper para Autenticación ---

/**
 * Obtiene el token de autenticación (JWT) de la sesión del usuario actual.
 * Lanza un error si el usuario no está autenticado.
 * @returns {Promise<string>} El token de ID del usuario.
 */
async function getAuthToken(): Promise<string> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    return token;
  } catch (error) {
    console.error("Error al obtener la sesión de autenticación:", error);
    throw new Error("Usuario no autenticado.");
  }
}

// --- Funciones de la API ---

/**
 * Obtiene el perfil de un usuario, incluyendo sus direcciones guardadas.
 * @param {string} userId - El ID del usuario (usualmente `user.username` de Amplify).
 * @returns {Promise<UserProfile>} El perfil del usuario.
 */
export async function getProfile(userId: string): Promise<UserProfile> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/profile?userId=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener el perfil.");
  }
  return response.json();
}

/**
 * Guarda una nueva dirección para un usuario.
 * @param {string} userId - El ID del usuario.
 * @param {string} address - La dirección a guardar.
 * @param {string} name - Un nombre o alias para la dirección (ej: "Casa", "Oficina").
 * @returns {Promise<any>} La respuesta del servidor.
 */
export async function saveAddress(userId: string, address: string, name: string): Promise<any> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, address, name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al guardar la dirección.");
  }
  return response.json();
}

/**
 * Crea un nuevo pedido, asociándolo a un cliente autenticado.
 * @param {OrderData} orderData - El objeto completo del pedido.
 * @returns {Promise<any>} La respuesta del servidor, incluyendo el `orderId`.
 */
export async function createOrder(orderData: OrderData): Promise<any> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear el pedido.");
  }
  return response.json();
}

/**
 * Obtiene todos los pedidos para un usuario específico.
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<any[]>} Una lista de los pedidos del usuario.
 */
export async function getMyOrders(userId: string): Promise<any[]> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/orders?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los pedidos.');
    }
    return response.json();
}
