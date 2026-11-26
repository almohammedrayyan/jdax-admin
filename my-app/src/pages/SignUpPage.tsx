import { LockOutlined, MailOutlined, PersonOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authApi";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!name.trim()) { setError("Name is required."); return; }
    if (password.length < 8) { setError("Password must contain at least 8 characters."); return; }
    if (password !== confirmation) { setError("Passwords do not match."); return; }
    setSaving(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/sign-in", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account.");
    } finally { setSaving(false); }
  };

  return <Box className="loginBg"><Card className="loginPanel" elevation={0}>
    <Typography className="loginBrand">JDAX</Typography>
    <Box className="loginHeading"><Typography variant="h4">Create Account</Typography><Typography>Sign up for your JDAX admin account</Typography></Box>
    <Card className="loginCard" elevation={0}><CardContent component="form" onSubmit={submit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField required fullWidth label="Name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} size="small" sx={{ mb: 2 }} slotProps={{ htmlInput: { maxLength: 100 }, input: { startAdornment: <PersonOutlined sx={{ mr: 1, color: "action.active" }} /> } }} />
      <TextField required fullWidth label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} size="small" sx={{ mb: 2 }} slotProps={{ input: { startAdornment: <MailOutlined sx={{ mr: 1, color: "action.active" }} /> } }} />
      <TextField required fullWidth label="Password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} size="small" helperText="At least 8 characters" sx={{ mb: 2 }} slotProps={{ input: { startAdornment: <LockOutlined sx={{ mr: 1, color: "action.active" }} /> } }} />
      <TextField required fullWidth label="Confirm password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} size="small" sx={{ mb: 2 }} slotProps={{ input: { startAdornment: <LockOutlined sx={{ mr: 1, color: "action.active" }} /> } }} />
      <Button fullWidth type="submit" size="large" variant="contained" className="signInButton" disabled={saving}>{saving ? "Creating account…" : "Sign Up"}</Button>
      <Typography sx={{ mt: 2, textAlign: "center" }} variant="body2">Already have an account? <Link to="/sign-in">Sign in</Link></Typography>
    </CardContent></Card><Box className="wave waveOne" /><Box className="wave waveTwo" /><Box className="wave waveThree" />
  </Card></Box>;
}
