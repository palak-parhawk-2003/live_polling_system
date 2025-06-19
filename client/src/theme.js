import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7765DA',
    },
    secondary: {
      main: '#5767D0',
    },
    error: {
      main: '#F40DCE',
    },
    background: {
      default: '#F2F2F2',
      paper: '#ffffff',
    },
    text: {
      primary: '#373737',
      secondary: '#6E6E6E',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h4: {
      fontWeight: 600,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#6E6E6E',
    },
  },
});

export default theme;
