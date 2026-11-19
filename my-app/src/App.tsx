import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import AppRoutes from './routes'
import './App.css'
const theme=createTheme({palette:{primary:{main:'#1463ed'},background:{default:'#edf5ff'}},typography:{fontFamily:'Inter,Arial,sans-serif',h4:{fontWeight:800,letterSpacing:'-.045em'}},shape:{borderRadius:12}})
export default function App(){return <ThemeProvider theme={theme}><CssBaseline/><AppRoutes/></ThemeProvider>}
