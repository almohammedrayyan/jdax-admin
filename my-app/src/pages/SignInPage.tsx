import { LockOutlined, MailOutlined, VisibilityOutlined } from '@mui/icons-material'
import { Alert, Box, Button, Card, CardContent, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../services/authApi'

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const result = await login(email.trim(), password)
      sessionStorage.setItem('jdax_admin_token', result.token)
      sessionStorage.setItem('jdax_admin_user', JSON.stringify(result.user))
      navigate('/dashboard', { replace: true })
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.') }
    finally { setSaving(false) }
  }
  return <Box className="loginBg"><Card className="loginPanel" elevation={0}>
    <Typography className="loginBrand">JDAX</Typography>
    <Box className="loginHeading"><Typography variant="h4">Welcome Back</Typography><Typography>Sign in to your JDAX admin account</Typography></Box>
    <Card className="loginCard" elevation={0}><CardContent component="form" onSubmit={submit}>
      {location.state?.registered && <Alert severity="success" sx={{ mb: 2 }}>Account created. Please sign in.</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Typography className="fieldLabel">Email</Typography>
      <TextField required fullWidth placeholder="Enter your email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} size="small" sx={{ mb: 2.6 }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailOutlined /></InputAdornment> } }} />
      <Typography className="fieldLabel">Password</Typography>
      <TextField required fullWidth placeholder="Enter your password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} size="small" slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton edge="end" size="small" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}><VisibilityOutlined /></IconButton></InputAdornment> } }} />
      <Box sx={{ mb: 2 }} />
      <Button fullWidth type="submit" size="large" variant="contained" className="signInButton" disabled={saving}>{saving ? 'Signing in…' : 'Sign In'}</Button>
      <Typography sx={{ mt: 2, textAlign: 'center' }} variant="body2">New to JDAX? <Link to="/sign-up">Sign up</Link></Typography>
    </CardContent></Card><Box className="wave waveOne" /><Box className="wave waveTwo" /><Box className="wave waveThree" />
  </Card></Box>
}
