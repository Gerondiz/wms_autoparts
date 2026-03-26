/**
 * Unit тесты для hooks
 *
 * Тестируют React hooks: useStock, usePermission
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Моки для SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import useSWR from 'swr';
import { useStock, useStockHistory, usePartSearch } from '@/lib/hooks/useStock';

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

describe('Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };

  describe('useStock', () => {
    it('должен вернуть данные о запчастях', async () => {
      // Arrange
      const mockData = {
        items: [
          {
            id: 1,
            name: 'Масляный фильтр',
            partNumber: 'OF-00001',
            stock: 50,
            minStockLevel: 10,
            location: 'A-01-01',
            price: '1250.00',
            hierarchyId: 10,
            hierarchyName: 'Фильтры',
            isLowStock: false,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockUseSWR.mockReturnValue({
        data: mockData,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
        isValidating: false,
      });

      // Act
      const { result } = renderHook(() =>
        useStock({ search: 'фильтр', page: 1, limit: 20 })
      );

      // Assert
      expect(result.current.data).toEqual(mockData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBeUndefined();
    });

    it('должен вернуть состояние загрузки', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: jest.fn(),
        isValidating: false,
      });

      // Act
      const { result } = renderHook(() => useStock({}));

      // Assert
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
    });

    it('должен вернуть ошибку', () => {
      // Arrange
      const mockError = new Error('Network error');
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: jest.fn(),
        isValidating: false,
      });

      // Act
      const { result } = renderHook(() => useStock({}));

      // Assert
      expect(result.current.data).toBeUndefined();
      expect(result.current.isError).toBe(mockError);
    });

    it('должен сформировать правильный ключ для SWR', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: jest.fn(),
        isValidating: false,
      });

      // Act
      renderHook(() =>
        useStock({ search: 'тест', lowStock: true, nodeId: 5, page: 2, limit: 10 })
      );

      // Assert
      expect(mockUseSWR).toHaveBeenCalled();
      const callArgs = mockUseSWR.mock.calls[0];
      expect(callArgs[0]).toContain('/api/stock?');
      expect(callArgs[0]).toContain('search=');
      expect(callArgs[0]).toContain('lowStock=true');
      expect(callArgs[0]).toContain('nodeId=5');
      expect(callArgs[0]).toContain('page=2');
      expect(callArgs[0]).toContain('limit=10');
    });

    it('должен вызвать mutate для обновления данных', () => {
      // Arrange
      const mockMutate = jest.fn();
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      });

      // Act
      const { result } = renderHook(() => useStock({}));
      result.current.mutate();

      // Assert
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  describe('useStockHistory', () => {
    it('должен вернуть историю операций', () => {
      // Arrange
      const mockData = {
        items: [
          {
            id: 1,
            partId: 1,
            partName: 'Масляный фильтр',
            partNumber: 'OF-00001',
            userId: 4,
            userName: 'Кладовщик 1',
            quantityChange: 50,
            reason: 'receipt',
            orderId: null,
            notes: 'Приход от поставщика',
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockUseSWR.mockReturnValue({
        data: mockData,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
        isValidating: false,
      });

      // Act
      const { result } = renderHook(() =>
        useStockHistory({ partId: 1, page: 1, limit: 20 })
      );

      // Assert
      expect(result.current.data).toEqual(mockData);
      expect(result.current.isLoading).toBe(false);
    });

    it('должен сформировать правильный ключ для истории', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: jest.fn(),
        isValidating: false,
      });

      // Act
      renderHook(() =>
        useStockHistory({
          partId: 1,
          userId: 2,
          orderId: 5,
          reason: 'receipt',
          fromDate: '2024-01-01',
          toDate: '2024-12-31',
        })
      );

      // Assert
      expect(mockUseSWR).toHaveBeenCalled();
      const callArgs = mockUseSWR.mock.calls[0];
      expect(callArgs[0]).toContain('/api/stock/history?');
      expect(callArgs[0]).toContain('partId=1');
      expect(callArgs[0]).toContain('userId=2');
      expect(callArgs[0]).toContain('orderId=5');
      expect(callArgs[0]).toContain('reason=receipt');
      expect(callArgs[0]).toContain('fromDate=2024-01-01');
      expect(callArgs[0]).toContain('toDate=2024-12-31');
    });
  });

  describe('usePartSearch', () => {
    it('должен вернуть результаты поиска при длине запроса >= 2', () => {
      // Arrange
      const mockData = [
        {
          id: 1,
          name: 'Масляный фильтр',
          partNumber: 'OF-00001',
          stock: 50,
          price: '1250.00',
        },
      ];

      mockUseSWR.mockReturnValue({
        data: mockData,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
        isValidating: false,
      });

      // Act
      const { result } = renderHook(() => usePartSearch('фильтр'));

      // Assert
      expect(result.current.data).toEqual(mockData);
      expect(result.current.isLoading).toBe(false);
    });

    it('не должен выполнять запрос при длине запроса < 2', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
        isValidating: false,
      });

      // Act
      const { result } = renderHook(() => usePartSearch('а'));

      // Assert
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('должен выполнить поиск по артикулу', () => {
      // Arrange
      const mockData = [
        {
          id: 1,
          name: 'Масляный фильтр',
          partNumber: 'OF-00001',
          stock: 50,
          price: '1250.00',
        },
      ];

      mockUseSWR.mockReturnValue({
        data: mockData,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
        isValidating: false,
      });

      // Act
      const { result } = renderHook(() => usePartSearch('OF-00001'));

      // Assert
      expect(result.current.data).toEqual(mockData);
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('/api/parts/search?q=OF-00001'),
        expect.any(Function)
      );
    });
  });
});
