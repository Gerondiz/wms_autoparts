'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoveToInbox as MoveIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';

interface NodeType {
  id: number;
  name: string;
  displayName: string;
  icon?: string;
  canHaveChildren: boolean;
  canHaveParts: boolean;
}

interface HierarchyNode {
  id: number;
  name: string;
  nodeTypeId: number;
  nodeTypeName?: string;
  nodeTypeDisplayName?: string;
  parentId: number | null;
  sortOrder: number;
  childrenCount: number;
  partsCount: number;
  attributes?: Record<string, any>;
  children?: HierarchyNode[];
}

interface HierarchyManagerProps {
  onNodeSelect?: (node: HierarchyNode | null) => void;
}

export default function HierarchyManager({ onNodeSelect }: HierarchyManagerProps) {
  const t = useTranslations('admin');
  
  const [nodes, setNodes] = useState<HierarchyNode[]>([]);
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    nodeTypeId: '' as number | '',
    parentId: '' as number | 'null' | null,
    sortOrder: 0,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка узлов иерархии
  const loadNodes = useCallback(async (parentId: number | null = null) => {
    try {
      const params = parentId === null ? '?parentId=null' : `?parentId=${parentId}`;
      const response = await fetch(`/api/hierarchy${params}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error loading nodes:', error);
      return [];
    }
  }, []);

  // Загрузка типов узлов
  const loadNodeTypes = async () => {
    try {
      const response = await fetch('/api/node-types');
      const result = await response.json();
      
      if (result.success) {
        setNodeTypes(result.data);
      }
    } catch (error) {
      console.error('Error loading node types:', error);
    }
  };

  // Рекурсивная загрузка дерева
  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const rootNodes = await loadNodes(null);
      setNodes(rootNodes);
    } finally {
      setLoading(false);
    }
  }, [loadNodes]);

  useEffect(() => {
    loadTree();
    loadNodeTypes();
  }, [loadTree]);

  // Обработчики для диалогов
  const handleOpenCreate = (parentId: number | null = null) => {
    setFormData({
      name: '',
      nodeTypeId: '',
      parentId: parentId ?? 'null',
      sortOrder: 0,
    });
    setError(null);
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (node: HierarchyNode) => {
    setFormData({
      name: node.name,
      nodeTypeId: node.nodeTypeId,
      parentId: node.parentId ?? 'null',
      sortOrder: node.sortOrder,
    });
    setError(null);
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (nodeId: number) => {
    setSelected(nodeId);
    setDeleteDialogOpen(true);
  };

  const handleOpenMove = (nodeId: number) => {
    setSelected(nodeId);
    setFormData(prev => ({ ...prev, parentId: 'null' }));
    setMoveDialogOpen(true);
  };

  // CRUD операции
  const handleCreate = async () => {
    setFormLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/hierarchy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          parentId: formData.parentId === 'null' ? null : formData.parentId,
          nodeTypeId: Number(formData.nodeTypeId),
          sortOrder: formData.sortOrder,
          attributes: {},
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCreateDialogOpen(false);
        await loadTree();
      } else {
        setError(result.error?.message || 'Ошибка при создании узла');
      }
    } catch (error) {
      setError('Ошибка при создании узла');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    
    setFormLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/hierarchy/${selected}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          nodeTypeId: Number(formData.nodeTypeId),
          sortOrder: formData.sortOrder,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEditDialogOpen(false);
        await loadTree();
      } else {
        setError(result.error?.message || 'Ошибка при обновлении узла');
      }
    } catch (error) {
      setError('Ошибка при обновлении узла');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    
    setFormLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/hierarchy/${selected}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeleteDialogOpen(false);
        setSelected(null);
        await loadTree();
      } else {
        setError(result.error?.message || 'Ошибка при удалении узла');
      }
    } catch (error) {
      setError('Ошибка при удалении узла');
    } finally {
      setFormLoading(false);
    }
  };

  const handleMove = async () => {
    if (!selected) return;
    
    setFormLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/hierarchy/${selected}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newParentId: formData.parentId === 'null' ? null : Number(formData.parentId),
          newSortOrder: formData.sortOrder,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMoveDialogOpen(false);
        await loadTree();
      } else {
        setError(result.error?.message || 'Ошибка при перемещении узла');
      }
    } catch (error) {
      setError('Ошибка при перемещении узла');
    } finally {
      setFormLoading(false);
    }
  };

  // Обработчики для дерева
  const handleToggleExpand = (nodeId: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpanded(newExpanded);
  };

  const handleNodeSelect = (nodeId: number) => {
    setSelected(nodeId);
    if (onNodeSelect) {
      const findNode = (nodes: HierarchyNode[], id: number): HierarchyNode | null => {
        for (const node of nodes) {
          if (node.id === id) return node;
          if (node.children) {
            const found = findNode(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };
      onNodeSelect(findNode(nodes, nodeId));
    }
  };

  const handleExpandAll = () => {
    const getAllIds = (nodes: HierarchyNode[]): number[] => {
      let ids: number[] = [];
      for (const node of nodes) {
        ids.push(node.id);
        if (node.children) {
          ids = [...ids, ...getAllIds(node.children)];
        }
      }
      return ids;
    };
    setExpanded(new Set(getAllIds(nodes)));
  };

  const handleCollapseAll = () => {
    setExpanded(new Set());
  };

  // Рендеринг дерева
  const renderNode = (node: HierarchyNode, level: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.childrenCount > 0;
    const isSelected = selected === node.id;

    return (
      <Box key={node.id}>
        <ListItem
          disablePadding
          sx={{
            pl: level * 2,
            bgcolor: isSelected ? 'action.selected' : 'transparent',
          }}
        >
          <ListItemButton
            selected={isSelected}
            onClick={() => handleNodeSelect(node.id)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(node.id);
                  }}
                >
                  {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                </IconButton>
              ) : (
                <Box sx={{ width: 24 }} />
              )}
              {isExpanded ? <FolderOpenIcon color="primary" /> : <FolderIcon color="primary" />}
            </ListItemIcon>
            <ListItemText
              primary={node.name}
              secondary={`${t('hierarchy.partsCount')}: ${node.partsCount}`}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {isSelected && (
                <>
                  <Tooltip title={t('hierarchy.editNode')}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(node);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('hierarchy.moveNode')}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMove(node.id);
                      }}
                    >
                      <MoveIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('hierarchy.deleteNode')}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDelete(node.id);
                      }}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </ListItemButton>
        </ListItem>
        {hasChildren && isExpanded && node.children && (
          <List disablePadding>
            {node.children.map((child) => renderNode(child, level + 1))}
          </List>
        )}
        <Divider />
      </Box>
    );
  };

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCreate(null)}
          >
            {t('hierarchy.createNode')}
          </Button>
          <Tooltip title={t('hierarchy.expandAll')}>
            <IconButton onClick={handleExpandAll}>
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('hierarchy.collapseAll')}>
            <IconButton onClick={handleCollapseAll}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tree View */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          minHeight: 400,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : nodes.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            {t('common.noData')}
          </Typography>
        ) : (
          <List disablePadding>
            {nodes.map((node) => renderNode(node))}
          </List>
        )}
      </Paper>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('hierarchy.createTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('hierarchy.nameLabel')}
              placeholder={t('hierarchy.namePlaceholder')}
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>{t('hierarchy.nodeTypeLabel')}</InputLabel>
              <Select
                value={formData.nodeTypeId}
                label={t('hierarchy.nodeTypeLabel')}
                onChange={(e) => setFormData({ ...formData, nodeTypeId: e.target.value as number })}
              >
                {nodeTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleCreate} variant="contained" disabled={formLoading}>
            {formLoading ? t('common.saving') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('hierarchy.editTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('hierarchy.nameLabel')}
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>{t('hierarchy.nodeTypeLabel')}</InputLabel>
              <Select
                value={formData.nodeTypeId}
                label={t('hierarchy.nodeTypeLabel')}
                onChange={(e) => setFormData({ ...formData, nodeTypeId: e.target.value as number })}
              >
                {nodeTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('hierarchy.sortOrderLabel')}
              type="number"
              fullWidth
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
              inputProps={{ min: 0 }}
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={formLoading}>
            {formLoading ? t('common.saving') : t('common.edit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('hierarchy.deleteNode')}</DialogTitle>
        <DialogContent>
          <Typography>{t('hierarchy.deleteConfirm')}</Typography>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={formLoading}>
            {formLoading ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('hierarchy.moveTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>{t('hierarchy.newParentLabel')}</InputLabel>
              <Select
                value={formData.parentId}
                label={t('hierarchy.newParentLabel')}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value as number | 'null' })}
              >
                <MenuItem value="null">{t('hierarchy.noParent')}</MenuItem>
                {nodes
                  .filter((n) => n.id !== selected)
                  .map((node) => (
                    <MenuItem key={node.id} value={node.id}>
                      {node.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label={t('hierarchy.newSortOrderLabel')}
              type="number"
              fullWidth
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
              inputProps={{ min: 0 }}
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleMove} variant="contained" disabled={formLoading}>
            {formLoading ? t('common.saving') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
