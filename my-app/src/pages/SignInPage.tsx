import { LockOutlined, MailOutlined, VisibilityOutlined } from '@mui/icons-material'
import { Box, Button, Card, CardContent, Checkbox, FormControlLabel, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function SignInPage() {
  const navigate = useNavigate()
  return <Box className="loginBg"><Card className="loginPanel" elevation={0}>
    <Typography className="loginBrand">JDAX</Typography>
    <Box className="loginHeading"><Typography variant="h4">Welcome Back</Typography><Typography>Sign in to your JDAX admin account</Typography></Box>
    <Card className="loginCard" elevation={0}><CardContent component="form" onSubmit={(event) => { event.preventDefault(); navigate('/live-feed') }}>
      <Typography className="fieldLabel">Email</Typography>
      <TextField required fullWidth placeholder="Enter your email" type="email" size="small" sx={{ mb: 2.6 }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailOutlined /></InputAdornment> } }} />
      <Typography className="fieldLabel">Password</Typography>
      <TextField required fullWidth placeholder="Enter your password" type="password" size="small" slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton edge="end" size="small"><VisibilityOutlined /></IconButton></InputAdornment> } }} />
      <Box className="loginOptions"><FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" /><Button size="small">Forgot password?</Button></Box>
      <Button fullWidth type="submit" size="large" variant="contained" className="signInButton">Sign In</Button>
    </CardContent></Card><Box className="wave waveOne" /><Box className="wave waveTwo" /><Box className="wave waveThree" />
  </Card></Box>
}
