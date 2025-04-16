import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Divider,
} from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificamos si el usuario ya está logueado
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn) {
      setIsLoggedIn(true);
      router.push("/docs");
    }
  }, [router]);

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
    <>
      <Head>
        <title>Iniciar Sesión</title>
        <meta name="description" content="Página de Login" />
      </Head>

      {/* Contenedor principal con un fondo ligeramente más claro */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f4f4f4",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 2,
              textAlign: "center",
              backgroundColor: "#fff", // recuadro gris oscuro
              color: "#000", // texto blanco
            }}
          >
            {/* Logo más grande */}
            <Box sx={{ mb: 2 }}>
              <img
                src="/ByA-logo.png"
                alt="ByA Logo"
                style={{ height: 100, objectFit: "contain" }}
              />
            </Box>

            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Iniciar Sesión
            </Typography>

            <Divider
              sx={{
                mb: 3,
                borderColor: "rgba(255, 255, 255, 0.2)", // línea sutil
              }}
            />

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
                InputLabelProps={{ style: { color: "#000" } }}
                InputProps={{
                  style: { color: "#000" },
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#666",
                    },
                    "&:hover fieldset": {
                      borderColor: "#999",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                    },
                  },
                }}
              />

              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#000" } }}
                InputProps={{
                  style: { color: "#000" },
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#666",
                    },
                    "&:hover fieldset": {
                      borderColor: "#999",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#000",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#222",
                  },
                }}
              >
                ENTRAR
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
