/**
 * Компонент предпросмотра PDF в модальном окне
 * Использует iframe для отображения PDF
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FileOpen as OpenInNewIcon,
} from '@mui/icons-material';

interface PDFPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  title?: string;
}

/**
 * Диалог предпросмотра PDF
 */
export const PDFPreviewDialog: React.FC<PDFPreviewDialogProps> = ({
  open,
  onClose,
  orderId,
  title = 'Предпросмотр PDF',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL для PDF
  const pdfUrl = useMemo(() => {
    return `/api/orders/${orderId}/pdf`;
  }, [orderId]);

  // Полная URL для iframe (относительный путь)
  const iframeUrl = useMemo(() => {
    return pdfUrl;
  }, [pdfUrl]);

  // Обработчик загрузки iframe
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  // Обработчик ошибки загрузки
  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Ошибка загрузки PDF документа');
  }, []);

  // Скачать PDF
  const handleDownload = useCallback(() => {
    window.open(pdfUrl, '_blank');
  }, [pdfUrl]);

  // Печать PDF
  const handlePrint = useCallback(() => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, [pdfUrl]);

  // Открыть в новой вкладке
  const handleOpenNew = useCallback(() => {
    window.open(pdfUrl, '_blank');
  }, [pdfUrl]);

  // Закрытие диалога
  const handleClose = useCallback(() => {
    setIsLoading(true);
    setError(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '85vh',
          maxHeight: '85vh',
        },
      }}
    >
      {/* Заголовок */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 3,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PdfIcon color="primary" />
          <Typography variant="h6" component="span" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            (Заказ №{orderId})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Действия */}
          <IconButton
            size="small"
            onClick={handleDownload}
            title="Скачать"
            sx={{
              '&:hover': {
                backgroundColor: alpha('#1976d2', 0.08),
              },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={handlePrint}
            title="Печать"
            sx={{
              '&:hover': {
                backgroundColor: alpha('#1976d2', 0.08),
              },
            }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleOpenNew}
            title="Открыть в новой вкладке"
            sx={{
              '&:hover': {
                backgroundColor: alpha('#1976d2', 0.08),
              },
            }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>

          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              ml: 1,
              '&:hover': {
                backgroundColor: alpha('#f44336', 0.08),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Контент */}
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Индикатор загрузки */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <LinearProgress color="primary" />
          </Box>
        )}

        {/* Ошибка */}
        {error && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              p: 4,
              textAlign: 'center',
            }}
          >
            <PdfIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Попробуйте обновить страницу или открыть PDF в новой вкладке
            </Typography>
          </Box>
        )}

        {/* Iframe с PDF */}
        {!error && (
          <iframe
            src={iframeUrl}
            width="100%"
            height="100%"
            style={{
              border: 'none',
              flex: 1,
            }}
            title="PDF Preview"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewDialog;
