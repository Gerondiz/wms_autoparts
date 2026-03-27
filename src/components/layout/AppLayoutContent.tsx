'use client';

import { useState } from 'react';
import { Box, CssBaseline, Drawer, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import SideMenu from './SideMenu';
import HierarchyTree from '@/components/catalog/HierarchyTree';
import { useHierarchy } from '@/contexts/HierarchyContext';

interface AppLayoutContentProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 320;

function AppLayoutContent({ children }: AppLayoutContentProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { selectedNodeId, setSelectedNodeId } = useHierarchy();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNodeSelect = (nodeId: number | null) => {
    setSelectedNodeId(nodeId);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Header */}
      <Header />

      {/* Mobile Menu */}
      <SideMenu open={mobileOpen} onClose={handleDrawerToggle} />

      {/* Desktop Hierarchy Tree - левая панель */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.default',
              top: 64,
              height: 'calc(100vh - 64px)',
            },
          }}
        >
          <HierarchyTree
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
          />
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default AppLayoutContent;
