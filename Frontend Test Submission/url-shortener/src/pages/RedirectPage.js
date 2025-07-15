import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert, Button } from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';
import { useUrlShortener } from '../context/UrlShortenerContext';
import { Log } from '../utils/Log';

function RedirectPage() {
  const { shortCode } = useParams();
  const { shortenedUrls, recordClick } = useUrlShortener();
  const [redirectState, setRedirectState] = useState('loading'); // loading, found, expired, notFound
  const [targetUrl, setTargetUrl] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    Log('react', 'info', 'redirect', `Attempting to resolve short code: ${shortCode}`);
    
    const url = shortenedUrls.find(u => u.shortCode === shortCode);
    
    if (!url) {
      Log('react', 'warning', 'redirect', `Short code not found: ${shortCode}`);
      setRedirectState('notFound');
      return;
    }

    const now = new Date();
    const expiry = new Date(url.expiresAt);
    
    if (now > expiry) {
      Log('react', 'warning', 'redirect', `Short code expired: ${shortCode}`);
      setRedirectState('expired');
      return;
    }

    Log('react', 'success', 'redirect', `Short code resolved: ${shortCode} -> ${url.originalUrl}`);
    setTargetUrl(url.originalUrl);
    setRedirectState('found');
    recordClick(shortCode);

    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = url.originalUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shortCode, shortenedUrls, recordClick]);

  const handleManualRedirect = () => {
    Log('react', 'info', 'redirect', `Manual redirect initiated for: ${shortCode}`);
    window.location.href = targetUrl;
  };

  if (redirectState === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Resolving short URL...</Typography>
        </Paper>
      </Box>
    );
  }

  if (redirectState === 'notFound') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              URL Not Found
            </Typography>
            <Typography>
              The short URL "{shortCode}" does not exist or may have been removed.
            </Typography>
          </Alert>
          <Button variant="contained" href="/">
            Create New Short URL
          </Button>
        </Paper>
      </Box>
    );
  }

  if (redirectState === 'expired') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              URL Expired
            </Typography>
            <Typography>
              The short URL "{shortCode}" has expired and is no longer valid.
            </Typography>
          </Alert>
          <Button variant="contained" href="/">
            Create New Short URL
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom>
          Redirecting...
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          You will be redirected to:
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              wordBreak: 'break-all',
              color: 'primary.main',
              fontWeight: 500
            }}
          >
            {targetUrl}
          </Typography>
        </Paper>

        <Box sx={{ mb: 3 }}>
          <CircularProgress 
            variant="determinate" 
            value={(5 - countdown) * 20} 
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" color="primary">
            {countdown}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            seconds remaining
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<LaunchIcon />}
          onClick={handleManualRedirect}
          size="large"
        >
          Go Now
        </Button>
        
        <Box sx={{ mt: 2 }}>
          <Button variant="text" href="/" size="small">
            Cancel and return to home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default RedirectPage;
