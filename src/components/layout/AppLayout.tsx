'use client';

import { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import DesktopMenu from './DesktopMenu';
import SideMenu from './SideMenu';

interface AppLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 260;

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header onMenuClick={handleDrawerToggle} />
      
      {/* Desktop Menu */}
      <DesktopMenu />
      
      {/* Mobile Menu */}
      <SideMenu open={mobileOpen} onClose={handleDrawerToggle} />
      
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
