import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  TablePagination,
  TextField,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { 
  ContentCopy as CopyIcon, 
  OpenInNew as OpenIcon,
  AccessTime as TimeIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useUrlShortener } from '../context/UrlShortenerContext';
import { Log } from '../utils/Log';

function UrlStatisticsPage() {
  const { shortenedUrls } = useUrlShortener();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const filteredUrls = useMemo(() => {
    return shortenedUrls.filter(url => 
      url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shortenedUrls, searchTerm]);

  const paginatedUrls = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUrls.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUrls, page, rowsPerPage]);

  const statistics = useMemo(() => {
    const total = shortenedUrls.length;
    const expired = shortenedUrls.filter(url => new Date(url.expiresAt) < new Date()).length;
    const active = total - expired;
    const totalClicks = shortenedUrls.reduce((sum, url) => sum + (url.clickCount || 0), 0);
    
    return { total, active, expired, totalClicks };
  }, [shortenedUrls]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({ open: true, message: 'Copied to clipboard!' });
      Log('react', 'info', 'statistics', 'Copied URL to clipboard');
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to copy to clipboard' });
      Log('react', 'error', 'statistics', `Failed to copy to clipboard: ${error.message}`);
    }
  };

  const openUrl = (url) => {
    window.open(url, '_blank');
    Log('react', 'info', 'statistics', 'Opened URL in new tab');
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) {
      return 'Expired';
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusChip = (expiresAt) => {
    const isExpired = new Date(expiresAt) < new Date();
    return (
      <Chip
        label={isExpired ? 'Expired' : 'Active'}
        color={isExpired ? 'error' : 'success'}
        size="small"
      />
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (shortenedUrls.length === 0) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Statistics
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          No URLs have been shortened yet. Go to the main page to create some short URLs!
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Statistics
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BarChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total URLs</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {statistics.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimeIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Active</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {statistics.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimeIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Expired</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {statistics.expired}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BarChartIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Clicks</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {statistics.totalClicks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Search URLs"
            placeholder="Search by original URL or short code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {/* URLs Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Short Code</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Time Remaining</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUrls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {url.shortCode}
                    </Typography>
                    {url.customAlias && (
                      <Chip label="Custom" size="small" variant="outlined" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {url.originalUrl}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(url.expiresAt)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(url.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(url.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTimeRemaining(url.expiresAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {url.clickCount || 0}
                    </Typography>
                    {url.lastClickTime && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Last: {new Date(url.lastClickTime).toLocaleDateString()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Copy Short URL">
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(url.shortUrl)}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open Original URL">
                        <IconButton 
                          size="small" 
                          onClick={() => openUrl(url.originalUrl)}
                        >
                          <OpenIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUrls.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {snackbar.open && (
        <Alert 
          severity="success" 
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          onClose={() => setSnackbar({ open: false, message: '' })}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
}

export default UrlStatisticsPage;
