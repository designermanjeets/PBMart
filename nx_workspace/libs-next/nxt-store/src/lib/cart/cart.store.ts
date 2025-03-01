import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      addItem: async (item) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          set((state) => {
            const existingItem = state.items.find((i) => i.id === item.id);
            if (existingItem) {
              return {
                items: state.items.map((i) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                ),
                isLoading: false,
              };
            }
            return { 
              items: [...state.items, item],
              isLoading: false,
            };
          });
        } catch (err) {
          set({ error: 'Failed to add item to cart', isLoading: false });
        }
      },
      removeItem: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Failed to remove item from cart', isLoading: false });
        }
      },
      updateQuantity: async (id, quantity) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({ error: 'Failed to update quantity', isLoading: false });
        }
      },
      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ items: [], isLoading: false });
        } catch (err) {
          set({ error: 'Failed to clear cart', isLoading: false });
        }
      },
      getTotal: () => {
        const items = get().items;
        return items.reduce(
          (total, item) => total + parseFloat(item.price.replace('$', '')) * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
); 