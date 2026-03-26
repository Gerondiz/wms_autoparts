import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Элемент корзины
 */
export interface CartItem {
  partId: number;
  partNumber: string;
  name: string;
  quantity: number;
  price?: string;
  image?: string;
}

/**
 * Расширенная информация о корзине
 */
export interface CartSummary {
  totalItems: number;
  totalParts: number;
  isEmpty: boolean;
}

/**
 * Состояние корзины
 */
interface CartState {
  items: CartItem[];
  
  // Действия
  addItem: (item: CartItem) => void;
  addItems: (items: CartItem[]) => void;
  removeItem: (partId: number) => void;
  updateQuantity: (partId: number, quantity: number) => void;
  clearCart: () => void;
  
  // Селекторы
  getTotalItems: () => number;
  getTotalParts: () => number;
  getItem: (partId: number) => CartItem | undefined;
  hasItem: (partId: number) => boolean;
  getSummary: () => CartSummary;
  
  // Оформление заказа
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isProcessing: false,

      // Добавить элемент
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(i => i.partId === item.partId);
          if (existingItem) {
            return {
              items: state.items.map(i =>
                i.partId === item.partId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      // Добавить несколько элементов
      addItems: (items) => {
        set((state) => {
          const newItems = [...state.items];
          for (const item of items) {
            const existingIndex = newItems.findIndex(i => i.partId === item.partId);
            if (existingIndex >= 0) {
              newItems[existingIndex] = {
                ...newItems[existingIndex],
                quantity: newItems[existingIndex].quantity + item.quantity,
              };
            } else {
              newItems.push(item);
            }
          }
          return { items: newItems };
        });
      },

      // Удалить элемент
      removeItem: (partId) => {
        set((state) => ({
          items: state.items.filter(i => i.partId !== partId),
        }));
      },

      // Обновить количество
      updateQuantity: (partId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(partId);
          return;
        }
        set((state) => ({
          items: state.items.map(i =>
            i.partId === partId ? { ...i, quantity } : i
          ),
        }));
      },

      // Очистить корзину
      clearCart: () => {
        set({ items: [] });
      },

      // Получить общее количество элементов
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Получить общее количество уникальных запчастей
      getTotalParts: () => {
        return get().items.length;
      },

      // Получить элемент по ID
      getItem: (partId) => {
        return get().items.find(i => i.partId === partId);
      },

      // Проверить наличие элемента
      hasItem: (partId) => {
        return get().items.some(i => i.partId === partId);
      },

      // Получить сводку по корзине
      getSummary: () => {
        const state = get();
        return {
          totalItems: state.getTotalItems(),
          totalParts: state.getTotalParts(),
          isEmpty: state.items.length === 0,
        };
      },

      // Установить статус обработки
      setIsProcessing: (processing) => {
        set({ isProcessing: processing });
      },
    }),
    {
      name: 'cart-storage',
      // Сериализация для localStorage
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

/**
 * Хук для получения состояния корзины
 */
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartTotalItems = () => useCartStore((state) => state.getTotalItems());
export const useCartSummary = () => useCartStore((state) => state.getSummary());
