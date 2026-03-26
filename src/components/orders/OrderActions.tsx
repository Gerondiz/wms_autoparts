'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import {
  Send as SubmitIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Inventory2 as FulfillIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { OrderWithDetails, OrderStatusCode, OrderPriority } from '@/lib/types/orders';
import { ORDER_STATUS_CONFIG } from '@/lib/constants/orders';
import PrioritySelector from './PrioritySelector';

interface OrderActionsProps {
  order: OrderWithDetails;
  userRole?: string | null;
  permissions: OrderPermissions;
  onSubmit?: () => void;
  onApprove?: (priority: OrderPriority, notes?: string) => void;
  onReject?: (comment: string) => void;
  onFulfill?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface OrderPermissions {
  canView: boolean;
  canCreate: boolean;
  canEditDraft: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canFulfill: boolean;
  canCancel: boolean;
}

export default function OrderActions({
  order,
  userRole,
  permissions,
  onSubmit,
  onApprove,
  onReject,
  onFulfill,
  onEdit,
  onDelete,
}: OrderActionsProps) {
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [approvePriority, setApprovePriority] = useState<OrderPriority>(OrderPriority.MEDIUM);
  const [approveNotes, setApproveNotes] = useState('');

  const statusCode = order.status?.name as OrderStatusCode | undefined;
  const statusConfig = statusCode ? ORDER_STATUS_CONFIG[statusCode] : null;

  // Обработчики
  const handleOpenRejectDialog = useCallback(() => {
    setRejectDialogOpen(true);
    setRejectComment('');
  }, []);

  const handleCloseRejectDialog = useCallback(() => {
    setRejectDialogOpen(false);
    setRejectComment('');
  }, []);

  const handleRejectConfirm = useCallback(() => {
    if (rejectComment.trim()) {
      onReject?.(rejectComment);
      handleCloseRejectDialog();
    }
  }, [rejectComment, onReject, handleCloseRejectDialog]);

  const handleOpenApproveDialog = useCallback(() => {
    setApproveDialogOpen(true);
    setApprovePriority(order.priority || OrderPriority.MEDIUM);
    setApproveNotes('');
  }, [order.priority]);

  const handleCloseApproveDialog = useCallback(() => {
    setApproveDialogOpen(false);
    setApproveNotes('');
  }, []);

  const handleApproveConfirm = useCallback(() => {
    onApprove?.(approvePriority, approveNotes || undefined);
    handleCloseApproveDialog();
  }, [approvePriority, approveNotes, onApprove, handleCloseApproveDialog]);

  // Рендеринг кнопок в зависимости от статуса и прав
  const renderActions = () => {
    if (!statusCode || !statusConfig) return null;

    const actions: JSX.Element[] = [];

    // Механик может редактировать/отправлять черновик
    if (statusCode === OrderStatusCode.DRAFT && permissions.canEditDraft) {
      if (onEdit) {
        actions.push(
          <Button
            key="edit"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEdit}
            color="primary"
          >
            {t('edit') || 'Редактировать'}
          </Button>
        );
      }

      if (onSubmit && permissions.canSubmit) {
        actions.push(
          <Button
            key="submit"
            variant="contained"
            startIcon={<SubmitIcon />}
            onClick={onSubmit}
            color="primary"
          >
            {t('submit') || 'Отправить'}
          </Button>
        );
      }

      if (onDelete && permissions.canCancel) {
        actions.push(
          <Button
            key="delete"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            color="error"
          >
            {tCommon('delete') || 'Удалить'}
          </Button>
        );
      }
    }

    // Repair manager может согласовать/отклонить отправленный заказ
    if (statusCode === OrderStatusCode.SUBMITTED) {
      if (permissions.canApprove && onApprove) {
        actions.push(
          <Button
            key="approve"
            variant="contained"
            startIcon={<ApproveIcon />}
            onClick={handleOpenApproveDialog}
            color="success"
          >
            {t('approve') || 'Согласовать'}
          </Button>
        );
      }

      if (permissions.canReject && onReject) {
        actions.push(
          <Button
            key="reject"
            variant="outlined"
            startIcon={<RejectIcon />}
            onClick={handleOpenRejectDialog}
            color="error"
          >
            {t('reject') || 'Отклонить'}
          </Button>
        );
      }
    }

    // Storekeeper может выдать согласованный заказ
    if (
      (statusCode === OrderStatusCode.APPROVED ||
        statusCode === OrderStatusCode.PARTIALLY_FULFILLED) &&
      permissions.canFulfill &&
      onFulfill
    ) {
      actions.push(
        <Button
          key="fulfill"
          variant="contained"
          startIcon={<FulfillIcon />}
          onClick={onFulfill}
          color="primary"
        >
          {t('fulfill') || 'Выдать'}
        </Button>
      );
    }

    return actions;
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {renderActions()}
      </Box>

      {/* Диалог отклонения */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleCloseRejectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('reject') || 'Отклонить заказ'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('rejectCommentLabel') || 'Укажите причину отклонения:'}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder={t('rejectCommentPlaceholder') || 'Причина отклонения...'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog} color="inherit">
            {tCommon('cancel') || 'Отмена'}
          </Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
            disabled={!rejectComment.trim()}
          >
            {t('reject') || 'Отклонить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог согласования */}
      <Dialog
        open={approveDialogOpen}
        onClose={handleCloseApproveDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('approve') || 'Согласовать заказ'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('priority') || 'Приоритет'}
            </Typography>
            <PrioritySelector
              value={approvePriority}
              onChange={setApprovePriority}
              size="large"
              showLabel
            />
          </Box>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            value={approveNotes}
            onChange={(e) => setApproveNotes(e.target.value)}
            placeholder={t('approveNotesPlaceholder') || 'Комментарий (необязательно)...'}
            label={t('notes') || 'Примечание'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog} color="inherit">
            {tCommon('cancel') || 'Отмена'}
          </Button>
          <Button
            onClick={handleApproveConfirm}
            variant="contained"
            color="success"
          >
            {t('approve') || 'Согласовать'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
