'use client';

import { useState } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import SideMenu from './SideMenu';

interface AppLayoutContentProps {
  children: React.ReactNode;
}

export default function AppLayoutContent({ children }: AppLayoutContentProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Header */}
      <Header />

      {/* Mobile Menu */}
      <SideMenu open={mobileOpen} onClose={handleDrawerToggle} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
