import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress } from '@mui/material'
import AppLayout from '../components/AppLayout'
import SignInPage from '../pages/SignInPage'
import SignUpPage from '../pages/SignUpPage'
import LiveFeedPage from '../pages/LiveFeedPage'
import ContentPage from '../pages/ContentPage'
import DashboardPage from '../pages/DashboardPage'
import ScheduleCalendarPage from '../pages/ScheduleCalendarPage'
import { clearSession, getValidToken, SESSION_EVENT, tokenExpiration, TOKEN_KEY, USER_ID_KEY, USER_KEY } from '../auth/session'
import { getCurrentUser } from '../services/authApi'

function SessionRoutes() {
  const [token, setToken] = useState(() => getValidToken())
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const sync = () => {
      const valid = getValidToken()
      if (!valid && localStorage.getItem(TOKEN_KEY)) { clearSession(); return }
      setToken(valid)
    }
    window.addEventListener(SESSION_EVENT, sync)
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    sync()
    return () => { window.removeEventListener(SESSION_EVENT, sync); window.removeEventListener('storage', sync); window.removeEventListener('focus', sync) }
  }, [])

  useEffect(() => {
    if (!token) { setVerifiedToken(null); setVerificationError(false); return }
    let active = true
    setVerifiedToken(null)
    setVerificationError(false)
    getCurrentUser(token).then((user) => {
      if (!active || getValidToken() !== token) return
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      localStorage.setItem(USER_ID_KEY, user._id)
      setVerifiedToken(token)
    }).catch((error: Error & { status?: number }) => {
      if (!active || getValidToken() !== token) return
      if (error.status === 401 || error.status === 404) clearSession()
      else setVerificationError(true)
    })
    return () => { active = false }
  }, [token, retry])

  useEffect(() => {
    if (!token) return
    let timer: ReturnType<typeof setTimeout>
    const check = () => {
      const expires = tokenExpiration(token)
      if (!expires || expires <= Date.now()) {
        if (localStorage.getItem(TOKEN_KEY) === token) clearSession()
        return
      }
      timer = setTimeout(check, Math.min(expires - Date.now(), 2147483647))
    }
    check()
    return () => clearTimeout(timer)
  }, [token])

  if (token && verifiedToken !== token) return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>{verificationError ? <Alert severity="error" action={<Button onClick={() => setRetry((value) => value + 1)}>Retry</Button>}>Unable to verify your session. Check your connection and try again.<Button onClick={clearSession}>Sign out</Button></Alert> : <CircularProgress aria-label="Checking session" />}</Box>

  const authenticated = Boolean(token && verifiedToken === token)
  return <Routes>
    <Route path="/sign-in" element={authenticated ? <Navigate to="/dashboard" replace /> : <SignInPage />} />
    <Route path="/sign-up" element={authenticated ? <Navigate to="/dashboard" replace /> : <SignUpPage />} />
    <Route element={authenticated ? <AppLayout /> : <Navigate to="/sign-in" replace />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/live-feed" element={<LiveFeedPage />} />
      <Route path="/content" element={<ContentPage />} />
      <Route path="/calendar" element={<ScheduleCalendarPage />} />
    </Route>
    <Route path="/" element={<Navigate to={authenticated ? '/dashboard' : '/sign-in'} replace />} />
    <Route path="*" element={<Navigate to={authenticated ? '/dashboard' : '/sign-in'} replace />} />
  </Routes>
}

export default function AppRoutes() { return <BrowserRouter><SessionRoutes /></BrowserRouter> }
