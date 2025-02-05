import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { grey } from '@mui/material/colors';
import { responsiveFontSizes } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { SnackbarProvider } from 'notistack';

import { fetchAuthSession } from 'aws-amplify/auth';

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

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
  API: {
    REST: {
      lostandfound: {
        endpoint: import.meta.env.VITE_API_URL,
      }
    }
  }
}, {
  API: {
    REST: {
      headers: async () => {
        return { Authorization: localStorage.getItem("token") };
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <SnackbarProvider maxSnack={3}>
        <App />
      </SnackbarProvider>
    </BrowserRouter>
  </ThemeProvider>
);
