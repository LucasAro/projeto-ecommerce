import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  Box,
  Autocomplete,
  Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const FormDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  fields,
  initialValues = {},
  submitLabel = 'Salvar',
  maxWidth = 'sm'
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues, open]);

  const handleChange = (field) => (event) => {
    let value = event.target.value;

    if (field.type === 'number') {
      value = value === '' ? '' : Number(value);
    }

    setValues((prev) => ({
      ...prev,
      [field.name]: value
    }));

    // Limpa o erro do campo quando ele é alterado
    if (errors[field.name]) {
      setErrors((prev) => ({
        ...prev,
        [field.name]: undefined
      }));
    }
  };

  const handleAutocompleteChange = (field, newValue) => {
    setValues((prev) => ({
      ...prev,
      [field.name]: newValue
    }));
  };

  const handleFileChange = (field) => (event) => {
    const file = event.target.files[0];
    if (file) {
      setValues((prev) => ({
        ...prev,
        [field.name]: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !values[field.name] && values[field.name] !== 0) {
        newErrors[field.name] = 'Este campo é obrigatório';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(values);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'autocomplete':
        return (
          <Autocomplete
            multiple={field.multiple}
            options={field.options}
            value={values[field.name] || (field.multiple ? [] : null)}
            onChange={(event, newValue) => handleAutocompleteChange(field, newValue)}
            getOptionLabel={field.getOptionLabel}
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                required={field.required}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option._id || option.id}
                  label={field.getOptionLabel(option)}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        );

      case 'file':
        return (
          <Box>
            <input
              accept={field.accept}
              id={field.name}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange(field)}
            />
            <label htmlFor={field.name}>
              <Button variant="outlined" component="span">
                {field.label}
              </Button>
            </label>
            {values[field.name] && (
              <Typography variant="caption" display="block">
                Arquivo selecionado: {values[field.name].name}
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            type={field.type}
            name={field.name}
            value={values[field.name] || ''}
            onChange={handleChange(field)}
            error={!!errors[field.name]}
            helperText={errors[field.name]}
            required={field.required}
            multiline={field.multiline}
            rows={field.rows}
            InputProps={field.InputProps}
          />
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            {title}
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {fields.map((field) => (
              <Grid item xs={12} md={field.gridCols || 12} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

FormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      required: PropTypes.bool,
      multiline: PropTypes.bool,
      rows: PropTypes.number,
      gridCols: PropTypes.number,
      options: PropTypes.array,
      getOptionLabel: PropTypes.func,
      multiple: PropTypes.bool,
      accept: PropTypes.string,
      InputProps: PropTypes.object,
    })
  ).isRequired,
  initialValues: PropTypes.object,
  submitLabel: PropTypes.string,
  maxWidth: PropTypes.string,
};

export default FormDialog;
