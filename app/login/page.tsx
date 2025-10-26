"use client";

import { useState } from "react";
import { Button, TextField, Box, Typography, Container, CssBaseline, Avatar } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { login } from "@/app/api/login/login";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await login(email, password);
    alert(res.message);
  }

  return (
    <Container maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          mt: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "#DC2626" }}>
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

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: "#dc2626", 
              "&:hover": {
                backgroundColor: "#b91c1c", 
              },
            }}            
            type="submit"
          >
            Entrar
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
