import React, { useState } from 'react';
import {
  Container, Typography, Button, TextField, Paper, Box, IconButton
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/UploadFile';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';


function App() {
  const [file, setFile] = useState(null);
  const [latexCode, setLatexCode] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('pdf', file);

    const res = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setLatexCode(data.latex || 'Fehler beim Parsen.');
  };

  const handleFileDeletion = async () => {
    if (file) {
      setFile(null);
    }
  }

  const copyToClipboard = async () => {

    await navigator.clipboard.writeText(latexCode);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          PDF → LaTeX Aufgabestruktur Generator 
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<FileUploadIcon />}
          >
            PDF hochladen
            <input type="file" accept="application/pdf" hidden onChange={handleFileChange} />
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!file}
          >
            Verarbeiten
          </Button>
            {file && (
              <Paper
                elevation={2}
                sx={{
                  padding: "8px 16px",
                  backgroundColor: "#f5f5f5",
                  fontSize: "0.9rem",
                  maxWidth: "300px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                📄 {file.name}
              </Paper>
            )}
            {file && (
              <IconButton 
                onClick={handleFileDeletion}
              > 
                <DeleteIcon></DeleteIcon>
              </IconButton>
            )}
        </Box>
        <Box sx={{ mt: 4, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">LaTeX Output:</Typography>
            <IconButton onClick={copyToClipboard}>
              <ContentCopyIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={10}
            value={latexCode}
            sx={{ mt: 1 }}
          />
        </Box>
      </Paper>
    </Container>
  );
}

export default App;
