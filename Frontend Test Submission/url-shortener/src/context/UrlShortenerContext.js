import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Log } from '../utils/Log';

const UrlShortenerContext = createContext();

const initialState = {
  shortenedUrls: [],
  loading: false,
  error: null,
};

function urlShortenerReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_SHORTENED_URL':
      const updatedUrls = [...state.shortenedUrls, action.payload];
      localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls));
      return { ...state, shortenedUrls: updatedUrls, loading: false, error: null };
    case 'LOAD_URLS':
      return { ...state, shortenedUrls: action.payload };
    case 'UPDATE_URL_CLICKS':
      const updatedUrlsWithClicks = state.shortenedUrls.map(url =>
        url.shortCode === action.payload.shortCode
          ? { ...url, clickCount: (url.clickCount || 0) + 1, lastClickTime: new Date().toISOString() }
          : url
      );
      localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrlsWithClicks));
      return { ...state, shortenedUrls: updatedUrlsWithClicks };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function UrlShortenerProvider({ children }) {
  const [state, dispatch] = useReducer(urlShortenerReducer, initialState);

  useEffect(() => {
    // Load URLs from localStorage on mount
    try {
      const savedUrls = localStorage.getItem('shortenedUrls');
      if (savedUrls) {
        const parsedUrls = JSON.parse(savedUrls);
        dispatch({ type: 'LOAD_URLS', payload: parsedUrls });
        Log('react', 'info', 'context', 'Loaded saved URLs from localStorage');
      }
    } catch (error) {
      Log('react', 'error', 'context', `Failed to load URLs from localStorage: ${error.message}`);
    }
  }, []);

  const shortenUrl = async (originalUrl, customAlias = '', validityMinutes = 30) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      Log('react', 'info', 'url-shortener', `Attempting to shorten URL: ${originalUrl}`);

      // Check if URL already exists
      const existingUrl = state.shortenedUrls.find(url => url.originalUrl === originalUrl);
      if (existingUrl) {
        Log('react', 'warning', 'url-shortener', 'URL already exists, returning existing short URL');
        dispatch({ type: 'SET_LOADING', payload: false });
        return existingUrl;
      }

      // Simulate API call - In real implementation, this would be an actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const shortCode = customAlias || generateShortCode();
      const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);
      
      const shortenedUrl = {
        id: Date.now().toString(),
        originalUrl,
        shortCode,
        shortUrl: `http://localhost:3000/r/${shortCode}`,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        validityMinutes,
        clickCount: 0,
        customAlias: !!customAlias,
      };

      dispatch({ type: 'ADD_SHORTENED_URL', payload: shortenedUrl });
      Log('react', 'success', 'url-shortener', `Successfully shortened URL with code: ${shortCode}`);
      
      return shortenedUrl;
    } catch (error) {
      const errorMessage = `Failed to shorten URL: ${error.message}`;
      Log('react', 'error', 'url-shortener', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const recordClick = (shortCode) => {
    try {
      dispatch({ type: 'UPDATE_URL_CLICKS', payload: { shortCode } });
      Log('react', 'info', 'redirect', `Recorded click for short code: ${shortCode}`);
    } catch (error) {
      Log('react', 'error', 'redirect', `Failed to record click: ${error.message}`);
    }
  };

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const value = {
    ...state,
    shortenUrl,
    recordClick,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
  };

  return (
    <UrlShortenerContext.Provider value={value}>
      {children}
    </UrlShortenerContext.Provider>
  );
}

export function useUrlShortener() {
  const context = useContext(UrlShortenerContext);
  if (!context) {
    throw new Error('useUrlShortener must be used within a UrlShortenerProvider');
  }
  return context;
}
