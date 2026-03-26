'use client';

import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  alpha,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  Note as NoteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { OrderWithDetails, OrderStatusCode, OrderPriority } from '@/lib/types/orders';
import { ORDER_STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants/orders';
import OrderStatusChip from './OrderStatusChip';
import OrderItems from './OrderItems';
import { useMemo } from 'react';

interface OrderDetailProps {
  order: OrderWithDetails;
  showFulfillment?: boolean;
}

// Кастомный коннектор для степпера
const ColorlibConnector = () => (
  <StepConnector
    sx={{
      [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
      },
      [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
          backgroundImage: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
        },
      },
      [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
          backgroundImage: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
        },
      },
      [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor: '#e0e0e0',
        borderRadius: 1,
      },
    }}
  />
);

// Кастомная иконка шага
const ColorlibStepIcon = (props: { active: boolean; completed: boolean }) => {
  const { active, completed } = props;
  
  return (
    <Avatar
      sx={{
        width: 40,
        height: 40,
        bgcolor: active || completed ? '#1976d2' : '#e0e0e0',
        color: 'white',
        boxShadow: active ? '0 4px 10px rgba(25,118,210,0.4)' : 'none',
      }}
    >
      {completed ? <CheckCircleIcon /> : null}
    </Avatar>
  );
};

export default function OrderDetail({
  order,
  showFulfillment = false,
}: OrderDetailProps) {
  const t = useTranslations('orders');
  const tCatalog = useTranslations('catalog');

  const statusCode = order.status?.name as OrderStatusCode | undefined;
  const statusConfig = statusCode ? ORDER_STATUS_CONFIG[statusCode] : null;

  // Вычисление прогресса выполнения
  const summary = useMemo(() => {
    const items = order.items || [];
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const fulfilledQuantity = items.reduce((sum, item) => sum + (item.quantityFulfilled || 0), 0);
    const percentage = totalQuantity > 0 ? Math.round((fulfilledQuantity / totalQuantity) * 100) : 0;

    return {
      totalItems: items.length,
      totalQuantity,
      fulfilledQuantity,
      percentage,
    };
  }, [order.items]);

  // Шаги статусов для степпера
  const steps = useMemo(() => {
    const statusOrder: OrderStatusCode[] = [
      OrderStatusCode.DRAFT,
      OrderStatusCode.SUBMITTED,
      OrderStatusCode.APPROVED,
      OrderStatusCode.PARTIALLY_FULFILLED,
      OrderStatusCode.FULFILLED,
    ];

    const currentStepIndex = statusCode ? statusOrder.indexOf(statusCode) : 0;
    const isRejected = statusCode === OrderStatusCode.REJECTED;

    return statusOrder.map((status, index) => ({
      label: ORDER_STATUS_CONFIG[status].label,
      completed: index < currentStepIndex || (isRejected && index === currentStepIndex),
      active: index === currentStepIndex && !isRejected,
    }));
  }, [statusCode]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Основная информация */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          bgcolor: alpha('#1976d2', 0.02),
        }}
      >
        {/* Заголовок */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="h4" fontWeight={700}>
              {t('order') || 'Заказ'} #{order.id}
            </Typography>
            {statusConfig && (
              <OrderStatusChip statusCode={statusCode!} size="medium" />
            )}
            {order.priority && (
              <Chip
                label={PRIORITY_CONFIG[order.priority].label}
                color={PRIORITY_CONFIG[order.priority].color as any}
                size="medium"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>

        {/* Информация */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Механик */}
          <Box sx={{ minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: alpha('#1976d2', 0.1), color: '#1976d2' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('mechanic') || 'Механик'}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {order.mechanic?.fullName || '—'}
                </Typography>
                {order.mechanic?.email && (
                  <Typography variant="caption" color="text.secondary">
                    {order.mechanic.email}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Менеджер */}
          <Box sx={{ minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('repairManager') || 'Менеджер'}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {order.repairManager?.fullName || '—'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Дата создания */}
          <Box sx={{ minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800' }}>
                <EventIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('createdAt') || 'Создан'}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Дата согласования */}
          <Box sx={{ minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50' }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('approvedAt') || 'Согласован'}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {order.approvedAt
                    ? new Date(order.approvedAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Примечания */}
        {order.notes && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: alpha('#9e9e9e', 0.1), color: '#9e9e9e' }}>
                <NoteIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('notes') || 'Примечания'}
                </Typography>
                <Typography variant="body2">{order.notes}</Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* Прогресс выполнения */}
      {showFulfillment && order.items && order.items.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t('fulfillmentProgress') || 'Прогресс выполнения'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: 1, flexWrap: 'wrap' }}>
            <Card variant="outlined" sx={{ minWidth: 150, bgcolor: alpha('#1976d2', 0.04) }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('totalItems') || 'Всего позиций'}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {summary.totalItems}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ minWidth: 150, bgcolor: alpha('#4caf50', 0.04) }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('fulfilledQuantity') || 'Выдано'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {summary.fulfilledQuantity}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ minWidth: 150, bgcolor: alpha('#ff9800', 0.04) }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('progress') || 'Прогресс'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {summary.percentage}%
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Paper>
      )}

      {/* Степпер статусов */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t('statusHistory') || 'История статусов'}
        </Typography>
        <Stepper
          activeStep={steps.findIndex((s) => s.active)}
          connector={<ColorlibConnector />}
          alternativeLabel
          sx={{ mt: 4 }}
        >
          {steps.map((step, index) => (
            <Step key={step.label} completed={step.completed}>
              <StepLabel>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <ColorlibStepIcon active={step.active} completed={step.completed} />
                  <Typography variant="body2" fontWeight={step.active ? 600 : 400}>
                    {step.label}
                  </Typography>
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Позиции заказа */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t('items') || 'Позиции заказа'}
        </Typography>
        <OrderItems
          items={order.items || []}
          showFulfillment={showFulfillment}
        />
      </Box>
    </Box>
  );
}
