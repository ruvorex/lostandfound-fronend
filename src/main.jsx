import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { grey } from '@mui/material/colors';
import { responsiveFontSizes } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';

let theme = createTheme({
  palette: {
    primary: {
      main: "#034ea4",
      light: "#034ea4",
      dark: "#046EE7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: grey[500],
      light: grey[300],
      dark: grey[700],
    },
    background: {
      default: "#ffffff", // Page background
      paper: "#f5f5f5", // Cards or other elements background
    },
    text: {
      primary: "#333333",
      secondary: grey[600],
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded buttons
          textTransform: 'none', // Disable uppercase text
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);
