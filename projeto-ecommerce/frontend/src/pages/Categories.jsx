import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import DataTable from '../../src/components/Table/Table';
import FormDialog from '../../src/components/Form/Form';

const Categories = () => {
  // Estados
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Colunas da tabela
  const columns = [
    {
      id: 'name',
      label: 'Nome',
      minWidth: 170
    }
  ];

  // Campos do formulário
  const formFields = [
    {
      name: 'name',
      label: 'Nome',
      required: true,
      gridCols: 12
    }
  ];

  // Carregar dados
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        // Fetch Categories
        const categoriesResponse = await fetch('http://localhost:8000/api/v1/categories/');
        const categoriesData = await categoriesResponse.json();

        console.log('DEBUG - Categorias Recebidas:', categoriesData);
        setCategories(categoriesData);

      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        showSnackbar('Erro ao carregar categorias', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handlers
  const handleCreate = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category) => {
    console.log('DEBUG - Categoria selecionada para edição:', category);

    setSelectedCategory(category);
    setFormOpen(true);
  };

  const handleDelete = async (category) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/categories/${category._id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          showSnackbar('Categoria excluída com sucesso');
          // Recarrega as categorias após a exclusão
          const categoriesResponse = await fetch('http://localhost:8000/api/v1/categories/');
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        } else {
          const errorData = await response.text();
          console.error('Erro ao excluir categoria:', errorData);
          throw new Error('Erro ao excluir categoria');
        }
      } catch (error) {
        console.error('Erro no handleDelete:', error);
        showSnackbar('Erro ao excluir categoria', 'error');
      }
    }
  };

  const handleSubmit = async (values) => {
    console.log('DEBUG - Valores do formulário de categoria:', values);

    try {
      const url = selectedCategory
        ? `http://localhost:8000/api/v1/categories/${selectedCategory._id}`
        : 'http://localhost:8000/api/v1/categories/';

      const method = selectedCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.name
        })
      });

      if (response.ok) {
        // Recarrega as categorias após a submissão
        const categoriesResponse = await fetch('http://localhost:8000/api/v1/categories/');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        showSnackbar(`Categoria ${selectedCategory ? 'atualizada' : 'criada'} com sucesso`);
        setFormOpen(false);
      } else {
        const errorData = await response.text();
        console.error('Erro ao salvar categoria:', errorData);
        throw new Error('Erro ao salvar categoria');
      }
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      showSnackbar(`Erro ao ${selectedCategory ? 'atualizar' : 'criar'} categoria`, 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nova Categoria
        </Button>
      </Box>

      <DataTable
        loading={loading}
        columns={columns}
        data={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
        fields={formFields}
        initialValues={selectedCategory || {}}
        onSubmit={handleSubmit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Categories;