import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { useUrlShortener } from '../context/UrlShortenerContext';
import { Log } from '../utils/Log';

function UrlShortenerForm() {
  const { shortenUrl, loading, error, clearError } = useUrlShortener();
  const [urlInputs, setUrlInputs] = useState([
    { id: 1, url: '', alias: '', validity: 30 }
  ]);
  const [results, setResults] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const validateUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const validateForm = (input) => {
    const errors = {};
    
    if (!input.url.trim()) {
      errors.url = 'URL is required';
    } else if (!validateUrl(input.url)) {
      errors.url = 'Please enter a valid URL (must start with http:// or https://)';
    } else if (input.url.length > 2000) {
      errors.url = 'URL is too long (max 2000 characters)';
    }

    if (input.alias && (input.alias.length < 3 || input.alias.length > 50)) {
      errors.alias = 'Custom alias must be 3-50 characters';
    }

    if (input.alias && !/^[a-zA-Z0-9-_]+$/.test(input.alias)) {
      errors.alias = 'Custom alias can only contain letters, numbers, hyphens, and underscores';
    }

    if (!input.validity || input.validity < 1 || input.validity > 10080) {
      errors.validity = 'Validity must be between 1 and 10080 minutes (1 week)';
    }

    return errors;
  };

  const addUrlInput = () => {
    if (urlInputs.length < 5) {
      setUrlInputs([...urlInputs, { 
        id: Date.now(), 
        url: '', 
        alias: '', 
        validity: 30 
      }]);
      Log('react', 'info', 'form', 'Added new URL input field');
    }
  };

  const removeUrlInput = (id) => {
    if (urlInputs.length > 1) {
      setUrlInputs(urlInputs.filter(input => input.id !== id));
      Log('react', 'info', 'form', 'Removed URL input field');
    }
  };

  const updateUrlInput = (id, field, value) => {
    setUrlInputs(urlInputs.map(input => 
      input.id === id ? { ...input, [field]: value } : input
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validate all inputs
    const validInputs = [];
    let hasErrors = false;

    for (const input of urlInputs) {
      if (input.url.trim()) {
        const errors = validateForm(input);
        if (Object.keys(errors).length > 0) {
          hasErrors = true;
          setSnackbar({
            open: true,
            message: `Validation error: ${Object.values(errors)[0]}`,
            severity: 'error'
          });
          Log('react', 'error', 'form', `Validation failed: ${Object.values(errors)[0]}`);
          return;
        }
        validInputs.push(input);
      }
    }

    if (validInputs.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please enter at least one URL',
        severity: 'warning'
      });
      return;
    }

    try {
      Log('react', 'info', 'form', `Processing ${validInputs.length} URLs`);
      const shortenedResults = [];

      for (const input of validInputs) {
        try {
          const result = await shortenUrl(input.url, input.alias, input.validity);
          shortenedResults.push({ ...result, inputId: input.id });
        } catch (error) {
          shortenedResults.push({
            inputId: input.id,
            error: error.message,
            originalUrl: input.url
          });
        }
      }

      setResults(shortenedResults);
      
      const successCount = shortenedResults.filter(r => !r.error).length;
      setSnackbar({
        open: true,
        message: `Successfully shortened ${successCount} out of ${validInputs.length} URLs`,
        severity: successCount === validInputs.length ? 'success' : 'warning'
      });

      Log('react', 'success', 'form', `Completed processing ${validInputs.length} URLs`);
    } catch (error) {
      Log('react', 'error', 'form', `Batch processing failed: ${error.message}`);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({
        open: true,
        message: 'Copied to clipboard!',
        severity: 'success'
      });
      Log('react', 'info', 'form', 'Copied URL to clipboard');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to copy to clipboard',
        severity: 'error'
      });
      Log('react', 'error', 'form', `Failed to copy to clipboard: ${error.message}`);
    }
  };

  const resetForm = () => {
    setUrlInputs([{ id: Date.now(), url: '', alias: '', validity: 30 }]);
    setResults([]);
    clearError();
    Log('react', 'info', 'form', 'Form reset');
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Shorten Your URLs
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Enter up to 5 URLs to shorten concurrently. Set custom validity periods and aliases for each URL.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {urlInputs.map((input, index) => (
            <Paper key={input.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    placeholder="https://example.com/very-long-url"
                    value={input.url}
                    onChange={(e) => updateUrlInput(input.id, 'url', e.target.value)}
                    required={index === 0}
                    error={input.url && !validateUrl(input.url)}
                    helperText={input.url && !validateUrl(input.url) ? "Invalid URL format" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Custom Alias (Optional)"
                    placeholder="my-link"
                    value={input.alias}
                    onChange={(e) => updateUrlInput(input.id, 'alias', e.target.value)}
                    helperText="3-50 characters, letters/numbers/-/_ only"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Validity (minutes)"
                    value={input.validity}
                    onChange={(e) => updateUrlInput(input.id, 'validity', parseInt(e.target.value) || 30)}
                    inputProps={{ min: 1, max: 10080 }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {urlInputs.length > 1 && (
                      <IconButton 
                        onClick={() => removeUrlInput(input.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                    {index === urlInputs.length - 1 && urlInputs.length < 5 && (
                      <IconButton 
                        onClick={addUrlInput}
                        color="primary"
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Shortening...' : 'Shorten URLs'}
            </Button>
            <Button variant="outlined" onClick={resetForm}>
              Reset
            </Button>
          </Box>
        </form>
      </Paper>

      {results.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>
          {results.map((result, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
              {result.error ? (
                <Alert severity="error">
                  Failed to shorten {result.originalUrl}: {result.error}
                </Alert>
              ) : (
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Original URL:
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                      {result.originalUrl}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Shortened URL:
                    </Typography>
                    <Typography variant="body1" color="primary" sx={{ wordBreak: 'break-all' }}>
                      {result.shortUrl}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">
                      Expires:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(result.expiresAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Tooltip title="Copy URL">
                      <IconButton 
                        onClick={() => copyToClipboard(result.shortUrl)}
                        color="primary"
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              )}
            </Paper>
          ))}
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UrlShortenerForm;
