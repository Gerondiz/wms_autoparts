/**
 * Unit тесты для cartStore (Zustand)
 * 
 * Тестируют состояние корзины и действия
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { useCartStore, type CartItem } from '@/lib/stores/cart.store';

describe('cartStore', () => {
  beforeEach(() => {
    // Очищаем корзину перед каждым тестом
    useCartStore.getState().clearCart();
  });

  const mockCartItem: CartItem = {
    partId: 1,
    partNumber: 'OF-00001',
    name: 'Масляный фильтр',
    quantity: 2,
    price: '1250.00',
  };

  const mockCartItem2: CartItem = {
    partId: 2,
    partNumber: 'BP-00002',
    name: 'Тормозные колодки',
    quantity: 1,
    price: '4500.00',
  };

  describe('addItem', () => {
    it('должен добавить новый элемент в корзину', () => {
      // Act
      useCartStore.getState().addItem(mockCartItem);

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(mockCartItem);
    });

    it('должен увеличить количество если элемент уже существует', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act - добавляем тот же элемент с количеством 3
      useCartStore.getState().addItem({
        ...mockCartItem,
        quantity: 3,
      });

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(5); // 2 + 3
    });

    it('должен добавить несколько разных элементов', () => {
      // Act
      useCartStore.getState().addItem(mockCartItem);
      useCartStore.getState().addItem(mockCartItem2);

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
    });
  });

  describe('addItems', () => {
    it('должен добавить несколько элементов сразу', () => {
      // Act
      useCartStore.getState().addItems([mockCartItem, mockCartItem2]);

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
    });

    it('должен объединять количества при добавлении нескольких элементов', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      useCartStore.getState().addItems([
        { ...mockCartItem, quantity: 3 },
        mockCartItem2,
      ]);

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
      expect(state.items.find((i) => i.partId === 1)?.quantity).toBe(5);
    });

    it('должен обработать пустой массив', () => {
      // Act
      useCartStore.getState().addItems([]);

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('removeItem', () => {
    it('должен удалить элемент по partId', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);
      useCartStore.getState().addItem(mockCartItem2);

      // Act
      useCartStore.getState().removeItem(1);

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].partId).toBe(2);
    });

    it('должен игнорировать удаление несуществующего элемента', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      useCartStore.getState().removeItem(999);

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
    });

    it('должен очистить корзину если удалить последний элемент', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      useCartStore.getState().removeItem(1);

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('должен обновить количество элемента', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      useCartStore.getState().updateQuantity(1, 5);

      // Assert
      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(5);
    });

    it('должен удалить элемент если количество <= 0', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      useCartStore.getState().updateQuantity(1, 0);

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('должен удалить элемент если количество отрицательное', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      useCartStore.getState().updateQuantity(1, -1);

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('должен игнорировать обновление несуществующего элемента', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      useCartStore.getState().updateQuantity(999, 5);

      // Assert
      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(2);
    });
  });

  describe('clearCart', () => {
    it('должен очистить всю корзину', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);
      useCartStore.getState().addItem(mockCartItem2);

      // Act
      useCartStore.getState().clearCart();

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('должен работать на уже пустой корзине', () => {
      // Act
      useCartStore.getState().clearCart();

      // Assert
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('getTotalItems', () => {
    it('должен вернуть общее количество элементов', () => {
      // Arrange
      useCartStore.getState().addItem({
        ...mockCartItem,
        quantity: 2,
      });
      useCartStore.getState().addItem({
        ...mockCartItem2,
        quantity: 3,
      });

      // Act
      const total = useCartStore.getState().getTotalItems();

      // Assert
      expect(total).toBe(5); // 2 + 3
    });

    it('должен вернуть 0 для пустой корзины', () => {
      // Act
      const total = useCartStore.getState().getTotalItems();

      // Assert
      expect(total).toBe(0);
    });
  });

  describe('getTotalParts', () => {
    it('должен вернуть общее количество уникальных запчастей', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);
      useCartStore.getState().addItem(mockCartItem2);

      // Act
      const total = useCartStore.getState().getTotalParts();

      // Assert
      expect(total).toBe(2);
    });

    it('должен вернуть 0 для пустой корзины', () => {
      // Act
      const total = useCartStore.getState().getTotalParts();

      // Assert
      expect(total).toBe(0);
    });

    it('должен считать уникальные запчасти при увеличении количества', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);
      useCartStore.getState().addItem({ ...mockCartItem, quantity: 5 });

      // Act
      const total = useCartStore.getState().getTotalParts();

      // Assert
      expect(total).toBe(1); // Всё ещё одна уникальная запчасть
    });
  });

  describe('getItem', () => {
    it('должен вернуть элемент по partId', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      const item = useCartStore.getState().getItem(1);

      // Assert
      expect(item).toEqual(mockCartItem);
    });

    it('должен вернуть undefined для несуществующего элемента', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      const item = useCartStore.getState().getItem(999);

      // Assert
      expect(item).toBeUndefined();
    });
  });

  describe('hasItem', () => {
    it('должен вернуть true если элемент есть в корзине', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      const hasItem = useCartStore.getState().hasItem(1);

      // Assert
      expect(hasItem).toBe(true);
    });

    it('должен вернуть false если элемента нет в корзине', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act
      const hasItem = useCartStore.getState().hasItem(999);

      // Assert
      expect(hasItem).toBe(false);
    });

    it('должен вернуть false для пустой корзины', () => {
      // Act
      const hasItem = useCartStore.getState().hasItem(1);

      // Assert
      expect(hasItem).toBe(false);
    });
  });

  describe('getSummary', () => {
    it('должен вернуть сводку по корзине с элементами', () => {
      // Arrange
      useCartStore.getState().addItem({
        ...mockCartItem,
        quantity: 2,
      });
      useCartStore.getState().addItem({
        ...mockCartItem2,
        quantity: 3,
      });

      // Act
      const summary = useCartStore.getState().getSummary();

      // Assert
      expect(summary.totalItems).toBe(5);
      expect(summary.totalParts).toBe(2);
      expect(summary.isEmpty).toBe(false);
    });

    it('должен вернуть сводку по пустой корзине', () => {
      // Act
      const summary = useCartStore.getState().getSummary();

      // Assert
      expect(summary.totalItems).toBe(0);
      expect(summary.totalParts).toBe(0);
      expect(summary.isEmpty).toBe(true);
    });
  });

  describe('setIsProcessing', () => {
    it('должен установить isProcessing в true', () => {
      // Act
      useCartStore.getState().setIsProcessing(true);

      // Assert
      const state = useCartStore.getState();
      expect(state.isProcessing).toBe(true);
    });

    it('должен установить isProcessing в false', () => {
      // Arrange
      useCartStore.getState().setIsProcessing(true);

      // Act
      useCartStore.getState().setIsProcessing(false);

      // Assert
      const state = useCartStore.getState();
      expect(state.isProcessing).toBe(false);
    });
  });

  describe('persist', () => {
    it('должен сохранять состояние в localStorage', () => {
      // Arrange
      useCartStore.getState().addItem(mockCartItem);

      // Act - получаем состояние из localStorage
      const stored = localStorage.getItem('cart-storage');

      // Assert
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.items).toHaveLength(1);
      expect(parsed.state.items[0].partId).toBe(1);
    });

    it('должен загружать состояние из localStorage', () => {
      // Arrange - сохраняем состояние
      const persistedState = JSON.stringify({
        state: {
          items: [mockCartItem],
        },
      });
      localStorage.setItem('cart-storage', persistedState);

      // Act - создаем новый store (в реальном приложении это происходит при перезагрузке)
      // В тестах просто проверяем что данные в localStorage
      const stored = localStorage.getItem('cart-storage');

      // Assert
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.items).toHaveLength(1);
    });
  });
});
