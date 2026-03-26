/**
 * Шаблон PDF для заказа запчастей
 * Использует @react-pdf/renderer для генерации PDF документов
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Тип для данных заказа в PDF
interface OrderPdfData {
  id: number;
  mechanicId: number | null;
  mechanicName: string | null;
  mechanicEmail: string | null;
  repairManagerId: number | null;
  repairManagerName: string | null;
  statusId: number | null;
  statusName: string | null;
  statusDisplayName: string | null;
  statusColor: string | null;
  priority: number | null;
  notes: string | null;
  createdAt: Date | string | null;
  approvedAt: Date | string | null;
  completedAt: Date | string | null;
  items: {
    id: number;
    partId: number | null;
    partName: string | null;
    partNumber: string | null;
    partLocation: string | null;
    quantity: number;
    quantityFulfilled: number | null;
    status: string | null;
  }[];
}

interface OrderTemplateProps {
  order: OrderPdfData;
}

// Регистрация шрифтов с поддержкой кириллицы
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

// Приоритеты
const PRIORITY_LABELS: Record<number, string> = {
  1: 'Высокий',
  2: 'Средний',
  3: 'Низкий',
};

// Цвета приоритетов
const PRIORITY_COLORS: Record<number, string> = {
  1: '#d32f2f',
  2: '#ed6c02',
  3: '#0288d1',
};

const styles = StyleSheet.create({
  // Основной документ
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  
  // Заголовок
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: 2,
    borderBottomColor: '#1976d2',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1976d2',
    marginBottom: 5,
  },
  orderNumber: {
    fontSize: 14,
    color: '#666666',
  },
  
  // Секция информации
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 10,
  },
  infoBlock: {
    width: '48%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 3,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 500,
    color: '#333333',
  },
  
  // Бейджи статусов
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 600,
    color: '#ffffff',
  },
  
  // Таблица позиций
  tableSection: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottom: 2,
    borderBottomColor: '#1976d2',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 700,
    color: '#333333',
    textTransform: 'uppercase' as const,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottom: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    fontSize: 10,
    color: '#333333',
  },
  
  // Колонки таблицы
  colNumber: {
    width: '5%',
  },
  colPartNumber: {
    width: '20%',
  },
  colName: {
    width: '35%',
  },
  colQuantity: {
    width: '12%',
    textAlign: 'center' as const,
  },
  colLocation: {
    width: '28%',
  },
  
  // Итоговая секция
  summarySection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: 500,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1976d2',
  },
  
  // Подписи
  signaturesSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: '#e0e0e0',
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
  },
  signatureLine: {
    borderBottom: 1,
    borderBottomColor: '#333333',
    height: 25,
    marginBottom: 5,
  },
  
  // Дата выдачи
  issueDateSection: {
    marginTop: 10,
    paddingTop: 15,
    borderTop: 1,
    borderTopColor: '#e0e0e0',
  },
  issueDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueDateLabel: {
    fontSize: 10,
    color: '#666666',
  },
  issueDateValue: {
    fontSize: 11,
    fontWeight: 500,
    color: '#333333',
  },
  
  // Футер
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center' as const,
  },
});

/**
 * Форматирование даты
 */
const formatDate = (date: Date | string | null): string => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Форматирование только даты (без времени)
 */
const formatDateOnly = (date: Date | string | null): string => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Компонент шаблона PDF для заказа
 */
export const OrderTemplate: React.FC<OrderTemplateProps> = ({ order }) => {
  const items = order.items || [];
  const totalItems = items.length;

  // Статус заказа
  const statusName = order.statusName || 'unknown';
  const statusDisplayName = order.statusDisplayName || statusName;

  // Получение цвета статуса
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: '#9e9e9e',
      submitted: '#ff9800',
      approved: '#4caf50',
      rejected: '#f44336',
      partially_fulfilled: '#2196f3',
      fulfilled: '#4caf50',
    };
    return colors[status] || '#9e9e9e';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>Заказ на запчасти</Text>
          <Text style={styles.orderNumber}>№ {order.id}</Text>
        </View>

        {/* Основная информация */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            {/* Левая колонка */}
            <View style={styles.infoBlock}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(statusName) + '20', color: getStatusColor(statusName) },
                  ]}
                >
                  {statusDisplayName}
                </View>
                {order.priority && (
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: PRIORITY_COLORS[order.priority] || '#666666' },
                    ]}
                  >
                    {PRIORITY_LABELS[order.priority]}
                  </View>
                )}
              </View>
              
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Дата создания</Text>
                <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
              </View>
              
              {order.approvedAt && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Дата согласования</Text>
                  <Text style={styles.infoValue}>{formatDateOnly(order.approvedAt)}</Text>
                </View>
              )}
            </View>

            {/* Правая колонка */}
            <View style={styles.infoBlock}>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Механик</Text>
                <Text style={styles.infoValue}>{order.mechanicName || '—'}</Text>
                {order.mechanicEmail && (
                  <Text style={{ fontSize: 9, color: '#666666', marginTop: 2 }}>
                    {order.mechanicEmail}
                  </Text>
                )}
              </View>

              {order.repairManagerName && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Repair Manager</Text>
                  <Text style={styles.infoValue}>{order.repairManagerName}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Таблица позиций */}
        <View style={styles.tableSection}>
          {/* Заголовок таблицы */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNumber]}>№</Text>
            <Text style={[styles.tableHeaderCell, styles.colPartNumber]}>Артикул</Text>
            <Text style={[styles.tableHeaderCell, styles.colName]}>Название</Text>
            <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Кол-во</Text>
            <Text style={[styles.tableHeaderCell, styles.colLocation]}>Место хранения</Text>
          </View>

          {/* Строки таблицы */}
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <Text style={[styles.tableCell, styles.colNumber]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colPartNumber]}>
                {item.partNumber || '—'}
              </Text>
              <Text style={[styles.tableCell, styles.colName]}>
                {item.partName || '—'}
              </Text>
              <Text style={[styles.tableCell, styles.colQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.colLocation]}>
                {item.partLocation || '—'}
              </Text>
            </View>
          ))}
        </View>

        {/* Итоговая информация */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Итоговое количество позиций:</Text>
            <Text style={styles.summaryValue}>{totalItems}</Text>
          </View>
        </View>

        {/* Подписи */}
        <View style={styles.signaturesSection}>
          <View style={styles.signaturesRow}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Механик</Text>
              <View style={styles.signatureLine} />
              <Text style={{ fontSize: 9, color: '#999999' }}>
                {order.mechanicName || ''}
              </Text>
            </View>

            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Кладовщик</Text>
              <View style={styles.signatureLine} />
              <Text style={{ fontSize: 9, color: '#999999' }}>_________________</Text>
            </View>
          </View>
        </View>

        {/* Дата выдачи */}
        <View style={styles.issueDateSection}>
          <View style={styles.issueDateRow}>
            <Text style={styles.issueDateLabel}>Дата выдачи:</Text>
            <Text style={styles.issueDateValue}>{formatDateOnly(new Date())}</Text>
          </View>
        </View>

        {/* Футер */}
        <View style={styles.footer} fixed>
          <Text>WMS Autoparts • Система управления складом запчастей</Text>
          <Text>Сгенерировано: {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default OrderTemplate;
