// pages/docs.js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";

export default function DocsPage() {
  const router = useRouter();

  // PROTECCIÓN DE RUTA: Si no existe "isLoggedIn" redirige al login (index.js)
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [router]);

  // Estados para manejar la subida de archivos y notificaciones (Snackbar)
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Manejo de la selección del archivo
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
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
      const base64Data = await fileToBase64(selectedFile);
      const pureBase64 = base64Data.split(",")[1];

      // Llamada a tu endpoint /api/upload (asegúrate de crearlo según tu lógica)
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
      // Limpia el archivo seleccionado
      setSelectedFile(null);
    } catch (error) {
      showToast(`Error subiendo archivo: ${error.message}`, "error");
    }
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
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 500 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Subir Archivo a Odoo (App Documentos)
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Button variant="outlined" component="label">
            Seleccionar archivo
            <input type="file" hidden onChange={handleFileChange} />
          </Button>

          {selectedFile && (
            <Typography variant="subtitle1">
              Archivo seleccionado: {selectedFile.name}
            </Typography>
          )}

          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Subir a Odoo
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000} // 6 segundos
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
    </Container>
  );
}
