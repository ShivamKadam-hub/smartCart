const DEFAULT_API_URL = 'http://localhost:5000';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

type ApiErrorBody = {
  message?: string;
  details?: string[];
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Check your network connection.');
    }
    throw new Error('Network error. Make sure the backend is running and reachable.');
  } finally {
    clearTimeout(timeoutId);
  }

  const data = (await response.json().catch(() => null)) as T & ApiErrorBody | null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.details?.[0] ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  message?: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
};

export type SessionResponse = {
  message?: string;
  data: AuthUser;
};

export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  tags: string[];
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string;
  images?: Array<{
    url: string;
  }>;
  rating: number;
  metadata?: Record<string, unknown>;
};

export type MlRecommendationInput = {
  name: string;
  description: string;
  price: number;
  label?: string;
  category?: string;
  brand?: string;
  backendProductId?: string;
};

export type MlChatResponse = {
  message?: string;
  data: {
    reply: string;
    items: ProductRecord[];
    intent?: Record<string, unknown> | null;
  };
};

export type WishlistResponse = {
  message?: string;
  data: {
    id: string;
    userId: string;
    items: ProductRecord[];
    summary?: {
      itemCount: number;
    };
  };
};

export type CartItemRecord = {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    category: string;
    brand: string;
    imageUrl: string;
    tags: string[];
    rating: number;
    description?: string;
  };
  quantity: number;
  name: string;
  price: number;
  selected?: boolean;
  addedAt?: string;
  lineTotal?: number;
};

export type SavedItemRecord = {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    category: string;
    brand: string;
    imageUrl: string;
    tags: string[];
    rating: number;
    description?: string;
  };
  quantity: number;
  name: string;
  price: number;
  savedAt?: string;
};

export type CartResponse = {
  message?: string;
  data: {
    id: string;
    userId: string;
    items: CartItemRecord[];
    savedForLater: SavedItemRecord[];
    summary?: {
      itemCount: number;
      subtotal: number;
    };
    recommendations?: ProductRecord[];
  };
};

export async function signup(payload: { name: string; email: string; password: string }) {
  return request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe(accessToken: string) {
  return request<SessionResponse>('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getProducts(params?: { category?: string; q?: string }) {
  const searchParams = new URLSearchParams();

  if (params?.category) {
    searchParams.set('category', params.category);
  }

  if (params?.q) {
    searchParams.set('q', params.q);
  }

  const query = searchParams.toString();
  return request<{ message?: string; data: ProductRecord[] }>(
    `/api/products${query ? `?${query}` : ''}`
  );
}

export async function getProductBySlug(slug: string) {
  return request<{ message?: string; data: ProductRecord }>(`/api/products/${encodeURIComponent(slug)}`);
}

export async function getMlRecommendations(payload: {
  cartItems: MlRecommendationInput[];
  text?: string;
  topK?: number;
}) {
  return request<{ message?: string; data: ProductRecord[] }>('/api/ml/recommendations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMlChat(payload: {
  cartItems: MlRecommendationInput[];
  text: string;
  topK?: number;
}) {
  return request<MlChatResponse>('/api/ml/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getWishlist(accessToken: string) {
  return request<WishlistResponse>('/api/wishlist', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function addWishlistItem(accessToken: string, productId: string) {
  return request<WishlistResponse>('/api/wishlist/items', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ productId }),
  });
}

export async function removeWishlistItem(accessToken: string, productId: string) {
  return request<WishlistResponse>(`/api/wishlist/items/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function clearWishlist(accessToken: string) {
  return request<WishlistResponse>('/api/wishlist', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getCart(accessToken: string) {
  return request<CartResponse>('/api/cart', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function addCartItem(accessToken: string, payload: { productId: string; quantity?: number }) {
  return request<CartResponse>('/api/cart/items', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      productId: payload.productId,
      quantity: payload.quantity ?? 1,
    }),
  });
}

export async function updateCartItem(
  accessToken: string,
  itemId: string,
  payload: { quantity: number }
) {
  return request<CartResponse>(`/api/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function removeCartItem(accessToken: string, itemId: string) {
  return request<CartResponse>(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function saveCartItemForLater(accessToken: string, itemId: string) {
  return request<CartResponse>(`/api/cart/items/${itemId}/save-for-later`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function moveSavedItemToCart(accessToken: string, savedItemId: string) {
  return request<CartResponse>(`/api/cart/saved-items/${savedItemId}/move-to-cart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function removeSavedCartItem(accessToken: string, savedItemId: string) {
  return request<CartResponse>(`/api/cart/saved-items/${savedItemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function clearCart(accessToken: string) {
  return request<CartResponse>('/api/cart', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
