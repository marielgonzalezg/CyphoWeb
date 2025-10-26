"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase_browser";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Container, CssBaseline, Box, Avatar, Typography, TextField, Button,
} from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErr(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErr(error.message || "Credenciales inválidas");
        return;
      }

      // data.session contiene la sesión si el proyecto no requiere confirmación de email
      router.replace("/dashboard");
    } catch (e) {
      setErr("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <CssBaseline />
      <Box sx={{ mt: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar sx={{ m: 1, bgcolor: "primary.light" }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography variant="h5">Login</Typography>

        <Box
          sx={{ mt: 1 }}
          component="form"
          onSubmit={(e) => { e.preventDefault(); void handleLogin(); }}
        >
          <TextField
            margin="normal" required fullWidth id="email" label="Correo"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth id="password" label="Contraseña" type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />

          {err && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{err}</Typography>}

          <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
