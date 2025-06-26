'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  console.log('✅ dashboard layout is rendered');
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="nav"
        sx={{
          width: 280,
          flexShrink: 0,
          bgcolor: '#f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2
        }}
      >
        <Sidebar />
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
