import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import FormDialog from '../components/Form/Form';

// Componente wrapper para exibir o FormDialog com um botão de controle
const FormWrapper = ({ formTitle, fields, initialValues, submitLabel, maxWidth, ...otherProps }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (values) => {
    console.log('Form submitted with values:', values);
    setOpen(false);
  };

  return (
    <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, maxWidth: '800px' }}>
      <Typography variant="subtitle1" gutterBottom>
        Demonstração de Formulário: <strong>{formTitle}</strong>
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Abrir Formulário
      </Button>

      <FormDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={formTitle}
        fields={fields}
        initialValues={initialValues}
        submitLabel={submitLabel}
        maxWidth={maxWidth}
        {...otherProps}
      />
    </Box>
  );
};

export default FormWrapper;