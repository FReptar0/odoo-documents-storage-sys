import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  // Estados para controlar el Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Manejo de la selección de archivo
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Función auxiliar para convertir el archivo a Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Por favor, selecciona un archivo primero.', 'error');
      return;
    }

    try {
      // Convertimos el archivo a Base64
      const base64Data = await fileToBase64(selectedFile);
      // Removemos el prefijo si existe (p.ej. "data:application/pdf;base64,")
      const pureBase64 = base64Data.split(',')[1];

      // Llamamos a nuestra API en /api/upload
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          base64Data: pureBase64,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al subir el archivo');
      }

      const result = await res.json();
      showToast(`Documento creado correctamente. 
        Attachment ID: ${result.attachmentId}, 
        Document ID: ${result.documentId}`,
        'success'
      );

      // Resetear el estado del archivo si quieres
      setSelectedFile(null);
    } catch (error) {
      showToast(`Error subiendo archivo: ${error.message}`, 'error');
    }
  };

  // Helper para mostrar el Snackbar
  const showToast = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Cerrar el Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',          // Ocupa altura completa
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Papel que contiene el formulario */}
      <Paper sx={{ p: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Subir Archivo a Odoo (App Documentos)
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Botón para seleccionar archivo */}
          <Button variant="outlined" component="label">
            Seleccionar archivo
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </Button>

          {/* Mostrar el nombre del archivo seleccionado */}
          {selectedFile && (
            <Typography variant="subtitle1">
              Archivo seleccionado: {selectedFile.name}
            </Typography>
          )}

          {/* Botón para subir el archivo */}
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Subir a Odoo
          </Button>
        </Box>
      </Paper>

      {/* Snackbar para mostrar mensajes tipo toast */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}  // tiempo en ms antes de cerrarse
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
