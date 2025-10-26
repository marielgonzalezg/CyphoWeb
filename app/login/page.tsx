"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Container, CssBaseline, Box, Avatar, Typography, TextField, Button } from "@mui/material";
import { login } from "@/app/api/login/login";
import { setUserIdLS } from "@/app/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setUserIdLS(res.id);
      router.push("/");
    } else {
      setErr(res.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <CssBaseline />
      <Box sx={{ mt: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar sx={{ m: 1, bgcolor: "#dc2626" }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography variant="h5">Login</Typography>

        <Box component="form" sx={{ mt: 1 }} onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {err}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: "#dc2626",
              "&:hover": { backgroundColor: "#b91c1c" },
            }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
