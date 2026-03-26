'use client';

import { useTranslations } from 'next-intl';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { StockHistoryItem } from '@/lib/api/stockClient';

interface StockHistoryTableProps {
  rows: StockHistoryItem[];
  loading?: boolean;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  rowCount?: number;
}

export default function StockHistoryTable({
  rows,
  loading = false,
  paginationModel = { page: 0, pageSize: 20 },
  onPaginationModelChange,
  rowCount,
}: StockHistoryTableProps) {
  const t = useTranslations('stock.history');

  const columns: GridColDef[] = [
    {
      field: 'partNumber',
      headerName: t('partNumber'),
      width: 130,
      sortable: true,
    },
    {
      field: 'partName',
      headerName: t('partName'),
      width: 200,
      sortable: true,
      flex: 1,
    },
    {
      field: 'quantityChange',
      headerName: t('quantityChange'),
      width: 120,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const value = params.value as number;
        const isPositive = value > 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isPositive ? (
              <AddCircleOutlineIcon color="success" fontSize="small" />
            ) : (
              <RemoveCircleOutlineIcon color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              sx={{
                color: isPositive ? 'success.main' : 'error.main',
                fontWeight: 'medium',
              }}
            >
              {isPositive ? '+' : ''}{value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'reason',
      headerName: t('reason'),
      width: 150,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const reason = params.value as string;
        const isReceipt = reason.toLowerCase().includes('приход') || 
                         reason.toLowerCase().includes('receipt') ||
                         reason.toLowerCase().includes('поступление');
        return (
          <Chip
            label={reason}
            size="small"
            color={isReceipt ? 'success' : 'error'}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'userName',
      headerName: t('user'),
      width: 150,
      sortable: true,
      valueGetter: (value, row) => row.userName || '—',
    },
    {
      field: 'orderId',
      headerName: t('orderId'),
      width: 100,
      sortable: true,
      valueGetter: (value, row) => row.orderId ? `#${row.orderId}` : '—',
    },
    {
      field: 'notes',
      headerName: t('notes'),
      width: 200,
      sortable: false,
      valueGetter: (value, row) => row.notes || '—',
    },
    {
      field: 'createdAt',
      headerName: t('date'),
      width: 160,
      sortable: true,
      valueGetter: (value, row) => {
        if (!row.createdAt) return '—';
        return new Date(row.createdAt).toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
  ];

  return (
    <Box sx={{ width: '100%', height: 'auto', minHeight: 500 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={rowCount}
        pageSizeOptions={[10, 20, 50, 100]}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        getRowClassName={(params) => {
          const change = params.row.quantityChange;
          return change > 0 ? 'receipt-row' : 'writeoff-row';
        }}
        sx={{
          '& .receipt-row': {
            backgroundColor: 'rgba(76, 175, 80, 0.04)',
          },
          '& .writeoff-row': {
            backgroundColor: 'rgba(244, 67, 54, 0.04)',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'action.hover',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
          },
        }}
        localeText={{
          noRowsLabel: t('noData'),
        }}
      />
    </Box>
  );
}
