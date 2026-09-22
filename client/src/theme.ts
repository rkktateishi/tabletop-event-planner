import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  palette: {
    primary: { main: '#5b3fa3' },
    secondary: { main: '#c2185b' },
  },
  shape: { borderRadius: 8 },
})
