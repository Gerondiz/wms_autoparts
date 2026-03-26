'use client';

import { useTranslations } from 'next-intl';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { StockItem } from '@/lib/api/stockClient';

interface StockTableProps {
  rows: StockItem[];
  loading?: boolean;
  onPartClick?: (part: StockItem) => void;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  rowCount?: number;
}

export default function StockTable({
  rows,
  loading = false,
  onPartClick,
  paginationModel = { page: 0, pageSize: 20 },
  onPaginationModelChange,
  rowCount,
}: StockTableProps) {
  const t = useTranslations('stock.stockTable');

  const columns: GridColDef[] = [
    {
      field: 'partNumber',
      headerName: t('partNumber'),
      width: 150,
      sortable: true,
    },
    {
      field: 'name',
      headerName: t('name'),
      width: 250,
      sortable: true,
      flex: 1,
    },
    {
      field: 'hierarchyName',
      headerName: t('category'),
      width: 200,
      sortable: true,
      valueGetter: (value, row) => row.hierarchyName || '—',
    },
    {
      field: 'stock',
      headerName: t('stock'),
      width: 100,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const isLowStock = params.row.isLowStock;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLowStock ? (
              <Tooltip title={t('lowStockWarning')}>
                <WarningAmberOutlinedIcon color="warning" fontSize="small" />
              </Tooltip>
            ) : params.value > 0 ? (
              <Tooltip title={t('inStock')}>
                <CheckCircleOutlinedIcon color="success" fontSize="small" />
              </Tooltip>
            ) : null}
            <Typography
              variant="body2"
              sx={{
                fontWeight: isLowStock ? 'bold' : 'normal',
                color: isLowStock ? 'warning.main' : 'inherit',
              }}
            >
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'minStockLevel',
      headerName: t('minStock'),
      width: 100,
      sortable: true,
    },
    {
      field: 'location',
      headerName: t('location'),
      width: 120,
      sortable: true,
      valueGetter: (value, row) => row.location || '—',
    },
    {
      field: 'price',
      headerName: t('price'),
      width: 100,
      sortable: true,
      valueGetter: (value, row) => (row.price ? `$${row.price}` : '—'),
    },
    {
      field: 'actions',
      headerName: t('actions'),
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={t('partInfo.title')}>
          <IconButton
            size="small"
            onClick={() => onPartClick?.(params.row)}
            color="primary"
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      ),
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
        getRowClassName={(params) =>
          params.row.isLowStock ? 'low-stock-row' : ''
        }
        sx={{
          '& .low-stock-row': {
            backgroundColor: 'rgba(255, 152, 0, 0.08)',
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
