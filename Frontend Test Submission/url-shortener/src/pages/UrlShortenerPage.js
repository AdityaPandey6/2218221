import React from 'react';
import { Box, Typography } from '@mui/material';
import UrlShortenerForm from '../components/UrlShortenerForm';

function UrlShortenerPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Shortener
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
        Create short, memorable links for your long URLs
      </Typography>
      <UrlShortenerForm />
    </Box>
  );
}

export default UrlShortenerPage;
