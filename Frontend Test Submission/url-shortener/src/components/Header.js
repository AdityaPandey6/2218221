import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import LinkIcon from '@mui/icons-material/Link';
import AnalyticsIcon from '@mui/icons-material/Analytics';

function Header() {
  const location = useLocation();

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <LinkIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            startIcon={<LinkIcon />}
          >
            Shorten URLs
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/statistics"
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
            startIcon={<AnalyticsIcon />}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
