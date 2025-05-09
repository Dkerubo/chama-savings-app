// src/components/shared/Spinner.tsx
import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const Spinner: React.FC = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  );
};

export default Spinner;
