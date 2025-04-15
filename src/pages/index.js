// pages/index.js
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#337ab7", contrastText: "#ffffff" },
    secondary: { main: "#343b40" },
    background: { default: "#ffffff" },
    text: { primary: "#212528" },
    success: { main: "#388e3c" },
  },
});

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Guardamos "isLoggedIn" para indicar que el usuario está logueado
        localStorage.setItem("isLoggedIn", "true");
        // Redirigimos a la página principal (docs.js)
        router.push("/docs");
      } else {
        setErrorMsg(data.message || "Credenciales inválidas");
      }
    } catch (error) {
      setErrorMsg("Error de conexión");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Iniciar Sesión</title>
        <meta name="description" content="Página de Login" />
      </Head>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 2,
              textAlign: "center",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Opcional: Logo */}
            <Box sx={{ mb: 2 }}>
              <img
                src="/Tersoft.webp"
                alt="Logo"
                style={{ height: 100, objectFit: "contain" }}
              />
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Iniciar Sesión
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {errorMsg && (
              <Typography variant="body1" color="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Usuario"
                variant="outlined"
                fullWidth
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                ENTRAR
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
