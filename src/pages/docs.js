// pages/docs.js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  Paper,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function DocsPage() {
  const router = useRouter();

  // PROTECCIÓN DE RUTA: redirige al login si no está logueado
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [router]);

  // Estados para manejo del archivo, notificaciones y progreso
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [uploading, setUploading] = useState(false);

  // Manejo de la selección del archivo vía input o drag & drop
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Función para convertir el archivo a Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  // Manejo del envío (subida)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast("Por favor, selecciona un archivo primero.", "error");
      return;
    }

    try {
      setUploading(true);
      const base64Data = await fileToBase64(selectedFile);
      const pureBase64 = base64Data.split(",")[1];

      // Llamada a tu endpoint /api/upload (ajusta según tu lógica)
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          base64Data: pureBase64,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al subir el archivo");
      }

      const result = await res.json();
      showToast(
        `Documento creado correctamente. Attachment ID: ${result.attachmentId}, Document ID: ${result.documentId}`,
        "success"
      );
      // Reinicia selección de archivo
      setSelectedFile(null);
    } catch (error) {
      showToast(`Error subiendo archivo: ${error.message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  // Botón para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  // Funciones para mostrar y cerrar el Snackbar
  const showToast = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {/* Barra de navegación superior */}
      <AppBar position="static" sx={{ backgroundColor: "#000" }}>
        <Toolbar>
          <Box sx={{ mr: 2 }}>
            <img
              src="/ByA-logo.png"
              alt="ByA Logo"
              style={{ height: 40, objectFit: "contain" }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", color: "#fff" }}
          >
            BLASCO Y ASOCIADOS, S.C.
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            CERRAR SESIÓN
          </Button>
        </Toolbar>
      </AppBar>

      {/* Contenido principal con fondo blanco */}
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 2,
              textAlign: "center",
              backgroundColor: "#f9f9f9",
              color: "#000",
            }}
          >
            {uploading && <LinearProgress sx={{ mb: 2 }} />}

            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
              Portal de recepción de documentos
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "#555" }}>
              Sube tus archivos de forma rápida y sencilla a nuestro sistema.
            </Typography>

            {/* Área del formulario de subida */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {/* Zona de arrastrar y soltar */}
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 1,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "#000",
                  },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 40, color: "#555", mb: 1 }} />
                <Typography variant="body1" sx={{ color: "#555" }}>
                  Arrastra y suelta tu archivo aquí
                  <br />o haz clic para seleccionar
                </Typography>
                {/* Input oculto para la selección vía clic */}
                <input type="file" hidden onChange={handleFileChange} />
              </Box>

              {/* Información del archivo seleccionado */}
              {selectedFile && (
                <Typography variant="subtitle1" sx={{ textAlign: "left" }}>
                  Archivo seleccionado: {selectedFile.name}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#000",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#333",
                  },
                }}
              >
                Subir a Odoo
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Snackbar de notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
