'use client';

import { useState, useCallback } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  Typography,
  alpha,
} from '@mui/material';
import {
  ArrowUpward as HighIcon,
  Remove as MediumIcon,
  ArrowDownward as LowIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { OrderPriority } from '@/lib/types/orders';
import { PRIORITY_CONFIG } from '@/lib/constants/orders';

interface PrioritySelectorProps {
  value: OrderPriority | null;
  onChange: (priority: OrderPriority) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const priorityIcons: Record<OrderPriority, JSX.Element> = {
  [OrderPriority.HIGH]: <HighIcon />,
  [OrderPriority.MEDIUM]: <MediumIcon />,
  [OrderPriority.LOW]: <LowIcon />,
};

export default function PrioritySelector({
  value,
  onChange,
  disabled = false,
  size = 'medium',
  showLabel = false,
}: PrioritySelectorProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  }, [disabled]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSelect = useCallback((priority: OrderPriority) => {
    onChange(priority);
    handleClose();
  }, [onChange, handleClose]);

  const currentConfig = value ? PRIORITY_CONFIG[value] : null;

  return (
    <>
      <Tooltip title={disabled ? 'Изменение приоритета недоступно' : 'Выбрать приоритет'}>
        <Box>
          <IconButton
            onClick={handleClick}
            disabled={disabled}
            size={size}
            sx={{
              ...(currentConfig && {
                color: currentConfig.color,
                bgcolor: alpha(currentConfig.color, 0.1),
                '&:hover': {
                  bgcolor: alpha(currentConfig.color, 0.2),
                },
              }),
            }}
          >
            {currentConfig ? priorityIcons[value!] : <ExpandMoreIcon />}
            {showLabel && currentConfig && (
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {currentConfig.label}
              </Typography>
            )}
          </IconButton>
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: { minWidth: 180 },
        }}
      >
        {Object.values(OrderPriority).filter(v => typeof v === 'number').map((priority) => {
          const config = PRIORITY_CONFIG[priority as OrderPriority];
          return (
            <MenuItem
              key={priority}
              onClick={() => handleSelect(priority as OrderPriority)}
              selected={value === priority}
              sx={{
                py: 1.5,
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: alpha(config.color, 0.1),
                  color: config.color,
                }}
              >
                {priorityIcons[priority]}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {config.label}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
