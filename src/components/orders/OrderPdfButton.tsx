/**
 * Компонент кнопки скачивания/печати PDF заказа
 * Видима только для статусов: approved, partially_fulfilled, fulfilled
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Button,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FileOpen as PreviewIcon,
  FileOpen as FileOpen,
} from '@mui/icons-material';
import { OrderWithDetails, OrderStatusCode } from '@/lib/types/orders';
import { PDFPreviewDialog } from '@/components/pdf/PDFPreviewDialog';

interface OrderPdfButtonProps {
  order: OrderWithDetails;
  variant?: 'button' | 'iconButton' | 'menu';
  onDownload?: () => void;
}

// Статусы для которых доступна генерация PDF
const PDF_AVAILABLE_STATUSES: OrderStatusCode[] = [
  OrderStatusCode.APPROVED,
  OrderStatusCode.PARTIALLY_FULFILLED,
  OrderStatusCode.FULFILLED,
];

/**
 * Компонент кнопки PDF
 */
export const OrderPdfButton: React.FC<OrderPdfButtonProps> = ({
  order,
  variant = 'button',
  onDownload,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const orderStatus = order.status?.name as OrderStatusCode | undefined;
  const isPdfAvailable = orderStatus ? PDF_AVAILABLE_STATUSES.includes(orderStatus) : false;

  // Показать ошибку
  const showError = useCallback((message: string) => {
    setError(message);
  }, []);

  // Закрыть ошибку
  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  // Генерация URL для PDF
  const getPdfUrl = useCallback(() => {
    return `/api/orders/${order.id}/pdf`;
  }, [order.id]);

  // Открыть PDF в новой вкладке
  const handleOpenInNewTab = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      const url = getPdfUrl();
      window.open(url, '_blank');
      onDownload?.();
    } catch (err: any) {
      showError('Ошибка открытия PDF');
    } finally {
      setIsLoading(false);
    }
  }, [getPdfUrl, onDownload, showError]);

  // Скачать PDF файл
  const handleDownload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = getPdfUrl();
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Ошибка скачивания PDF');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `order-${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      onDownload?.();
    } catch (err: any) {
      showError(err.message || 'Ошибка скачивания PDF');
    } finally {
      setIsLoading(false);
    }
  }, [getPdfUrl, order.id, onDownload, showError]);

  // Печать PDF
  const handlePrint = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      const url = getPdfUrl();
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          setIsLoading(false);
        };
      }
      
      onDownload?.();
    } catch (err: any) {
      showError('Ошибка печати');
      setIsLoading(false);
    }
  }, [getPdfUrl, onDownload, showError]);

  // Открыть предпросмотр
  const handlePreview = useCallback(() => {
    setPreviewOpen(true);
    setAnchorEl(null);
  }, []);

  // Открыть меню
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  // Закрыть меню
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Закрыть предпросмотр
  const handlePreviewClose = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  // Если PDF недоступен для текущего статуса - не показываем кнопку
  if (!isPdfAvailable) {
    return null;
  }

  // Рендеринг в зависимости от варианта
  if (variant === 'iconButton') {
    return (
      <>
        <Tooltip title="Скачать PDF">
          <span>
            <IconButton
              onClick={handleDownload}
              disabled={isLoading}
              color="inherit"
              size="small"
            >
              <PdfIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        {/* Предпросмотр */}
        <PDFPreviewDialog
          open={previewOpen}
          onClose={handlePreviewClose}
          orderId={order.id}
        />

        {/* Сообщение об ошибке */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </>
    );
  }

  if (variant === 'menu') {
    return (
      <>
        <Button
          startIcon={<PdfIcon />}
          onClick={handleMenuOpen}
          disabled={isLoading}
          variant="outlined"
          size="small"
        >
          PDF
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { minWidth: 200 },
          }}
        >
          <MenuItem onClick={handlePreview}>
            <ListItemIcon>
              <PreviewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Предпросмотр</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Скачать</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleOpenInNewTab}>
            <ListItemIcon>
              <FileOpen fontSize="small" />
            </ListItemIcon>
            <ListItemText>Открыть в новой вкладке</ListItemText>
          </MenuItem>

          <MenuItem onClick={handlePrint}>
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Печать</ListItemText>
          </MenuItem>
        </Menu>

        {/* Предпросмотр */}
        <PDFPreviewDialog
          open={previewOpen}
          onClose={handlePreviewClose}
          orderId={order.id}
        />

        {/* Сообщение об ошибке */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Вариант по умолчанию - кнопка с выпадающим меню
  return (
    <>
      <Button
        variant="outlined"
        startIcon={<PdfIcon />}
        onClick={handleDownload}
        disabled={isLoading}
        size="small"
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
        }}
      >
        Скачать PDF
      </Button>

      {/* Предпросмотр */}
      <PDFPreviewDialog
        open={previewOpen}
        onClose={handlePreviewClose}
        orderId={order.id}
      />

      {/* Сообщение об ошибке */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OrderPdfButton;
