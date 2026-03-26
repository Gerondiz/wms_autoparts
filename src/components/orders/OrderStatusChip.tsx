'use client';

import { Chip, ChipProps } from '@mui/material';
import { OrderStatusCode } from '@/lib/types/orders';
import { ORDER_STATUS_CONFIG } from '@/lib/constants/orders';
import {
  Description as DraftIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Inventory2 as Inventory2Icon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';

interface OrderStatusChipProps extends Omit<ChipProps, 'variant'> {
  statusCode: OrderStatusCode;
  size?: 'small' | 'medium';
}

const statusIcons: Record<OrderStatusCode, JSX.Element> = {
  [OrderStatusCode.DRAFT]: <DraftIcon fontSize="small" />,
  [OrderStatusCode.SUBMITTED]: <SendIcon fontSize="small" />,
  [OrderStatusCode.APPROVED]: <CheckCircleIcon fontSize="small" />,
  [OrderStatusCode.REJECTED]: <CancelIcon fontSize="small" />,
  [OrderStatusCode.PARTIALLY_FULFILLED]: <Inventory2Icon fontSize="small" />,
  [OrderStatusCode.FULFILLED]: <DoneAllIcon fontSize="small" />,
};

export default function OrderStatusChip({
  statusCode,
  size = 'medium',
  sx,
  ...props
}: OrderStatusChipProps) {
  const config = ORDER_STATUS_CONFIG[statusCode];

  if (!config) {
    return null;
  }

  return (
    <Chip
      icon={statusIcons[statusCode]}
      label={config.label}
      color={config.color as ChipProps['color']}
      variant={config.variant}
      size={size}
      sx={{
        fontWeight: 600,
        ...sx,
      }}
      {...props}
    />
  );
}
