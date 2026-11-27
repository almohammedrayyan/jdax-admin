import { useState } from 'react'
import { CalendarMonthOutlined, CampaignOutlined, DashboardOutlined, NotificationsNone, Search } from '@mui/icons-material'
import { AppBar, Avatar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout, type AuthUser } from '../services/authApi'
import { clearSession, getValidToken, USER_KEY } from '../auth/session'

const links = [[DashboardOutlined, 'Overview', '/dashboard'], [CampaignOutlined, 'Social Live Feed', '/live-feed'], [CalendarMonthOutlined, 'Content Schedule', '/content']] as const

export default function AppLayout() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [user] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
  })
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setLoggingOut(true)
    const token = getValidToken()
    try { if (token) await logout(token) } catch (error) { console.error('Logout request failed:', error) }
    finally {
      clearSession()
      setAnchor(null)
      navigate('/sign-in', { replace: true })
    }
  }

  const name = user?.name?.trim() || user?.email || 'Account'
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return <Box className="appShell"><Drawer variant="permanent" className="drawer" slotProps={{paper:{className:'drawerPaper'}}}><Typography className="sideBrand">JDAX<span>.</span></Typography><Typography className="workspaceName">Social workspace</Typography><List sx={{px:1.5}}>{links.map(([Icon,label,path])=><ListItemButton key={path} component={NavLink} to={path} className="navItem"><ListItemIcon><Icon/></ListItemIcon><ListItemText primary={label}/></ListItemButton>)}</List><Box className="sidebarFoot"><Typography>Need a hand?</Typography><Typography>Visit the help center</Typography></Box></Drawer><Box component="main" className="mainArea"><AppBar position="static" color="inherit" elevation={0} className="topBar"><Toolbar><Box className="topSearch"><Search/><Typography>Search anything...</Typography></Box><Box sx={{flex:1}}/><IconButton className="notificationButton"><NotificationsNone/><i /></IconButton><Divider orientation="vertical" flexItem sx={{mx:2}}/><Button color="inherit" onClick={e=>setAnchor(e.currentTarget)} endIcon={<Avatar sx={{bgcolor:'#ecaf92',width:32,height:32,fontSize:13}}>{initials}</Avatar>}>{name}</Button><Menu anchorEl={anchor} open={Boolean(anchor)} onClose={()=>setAnchor(null)}><MenuItem disabled={loggingOut} onClick={() => void handleLogout()}>{loggingOut ? 'Logging out...' : 'Logout'}</MenuItem></Menu></Toolbar></AppBar><Outlet/></Box></Box>
}
