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

const Products = () => {
  // Estados
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Colunas da tabela
  const columns = [
    { id: 'name', label: 'Nome', minWidth: 170 },
    { id: 'description', label: 'Descrição', minWidth: 200 },
    {
      id: 'price',
      label: 'Preço',
      minWidth: 100,
      type: 'currency',
      render: (value) => `R$ ${Number(value).toFixed(2)}`
    },
    {
      id: 'category_ids',
      label: 'Categorias',
      minWidth: 130,
      render: (value, fullItem) => {
        // Log detalhado para debugging
        console.log('DEBUG - Renderizando Categorias:', {
          productName: fullItem.name,
          categoryIds: value,
          availableCategories: categories
        });

        // Método robusto de correspondência de categorias
        const productCategories = categories.filter(cat => {
          // Verifica diferentes formas de correspondência de ID
          if (!value) return false;

          // Converte os IDs para string para comparação consistente
          const catId = String(cat._id || cat.id || '');
          const productCategoryIds = value.map(id => String(id));

          return productCategoryIds.includes(catId);
        });

        console.log('DEBUG - Categorias Correspondentes:', productCategories);

        // Renderiza os nomes das categorias
        const categoryNames = productCategories.map(cat => cat.name);

        return categoryNames.length > 0
          ? categoryNames.join(', ')
          : 'Sem categorias';
      }
    },
    {
      id: 'image_url',
      label: 'Imagem',
      minWidth: 80,
      type: 'image'
    }
  ];

  // Campos do formulário
  const formFields = [
    {
      name: 'name',
      label: 'Nome',
      required: true,
      gridCols: 12
    },
    {
      name: 'description',
      label: 'Descrição',
      multiline: true,
      rows: 3,
      gridCols: 12
    },
    {
      name: 'price',
      label: 'Preço',
      type: 'number',
      required: true,
      gridCols: 6,
      InputProps: {
        startAdornment: 'R$'
      }
    },
    {
      name: 'category_ids',
      label: 'Categorias',
      type: 'autocomplete',
      multiple: true,
      gridCols: 12,
      options: categories,
      getOptionLabel: (option) => option.name || 'Categoria sem nome'
    },
    {
      name: 'image',
      label: 'Selecionar Imagem',
      type: 'file',
      accept: 'image/*',
      required: !selectedProduct,
      gridCols: 12
    }
  ];

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Categories
        const categoriesResponse = await fetch('http://localhost:8000/api/v1/categories/');
        const categoriesData = await categoriesResponse.json();

        console.log('DEBUG - Categorias Recebidas:', categoriesData);
        setCategories(categoriesData);

        // Fetch Products
        const productsResponse = await fetch('http://localhost:8000/api/v1/products/');
        const productsData = await productsResponse.json();

        console.log('DEBUG - Produtos Recebidos:', productsData);
        setProducts(productsData);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showSnackbar('Erro ao carregar dados', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handlers
  const handleCreate = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product) => {
    console.log('DEBUG - Produto selecionado para edição:', product);

    // Prepara o produto para edição, mapeando categorias
    const productWithCategories = {
      ...product,
      category_ids: categories.filter(cat =>
        product.category_ids?.map(id => String(id)).includes(String(cat._id))
      )
    };

    console.log('DEBUG - Produto preparado para edição:', productWithCategories);

    setSelectedProduct(productWithCategories);
    setFormOpen(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/products/${product._id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          showSnackbar('Produto excluído com sucesso');
          // Recarrega os produtos após a exclusão
          const productsResponse = await fetch('http://localhost:8000/api/v1/products/');
          const productsData = await productsResponse.json();
          setProducts(productsData);
        } else {
          throw new Error('Erro ao excluir produto');
        }
      } catch (error) {
        showSnackbar('Erro ao excluir produto', 'error');
      }
    }
  };

  const handleSubmit = async (values) => {
    console.log('DEBUG - Valores do formulário:', values);

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', values.price);

      // Processamento robusto de IDs de categorias
      const categoryIds = values.category_ids
        ? values.category_ids.map(cat => cat._id || cat.id)
        : [];

      console.log('DEBUG - IDs de categorias:', categoryIds);
      formData.append('category_ids', JSON.stringify(categoryIds));

      if (values.image) {
        formData.append('image', values.image);
      }

      const url = selectedProduct
        ? `http://localhost:8000/api/v1/products/${selectedProduct._id}`
        : 'http://localhost:8000/api/v1/products/with-image/';

      const response = await fetch(url, {
        method: selectedProduct ? 'PUT' : 'POST',
        body: selectedProduct
          ? JSON.stringify({
              ...values,
              category_ids: categoryIds,
              image_url: selectedProduct.image_url
            })
          : formData,
        headers: selectedProduct
          ? { 'Content-Type': 'application/json' }
          : undefined
      });

      if (response.ok) {
        // Recarrega os produtos após a submissão
        const productsResponse = await fetch('http://localhost:8000/api/v1/products/');
        const productsData = await productsResponse.json();
        setProducts(productsData);

        showSnackbar(`Produto ${selectedProduct ? 'atualizado' : 'criado'} com sucesso`);
        setFormOpen(false);
      } else {
        const errorData = await response.text();
        console.error('Erro ao salvar produto:', errorData);
        throw new Error('Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      showSnackbar(`Erro ao ${selectedProduct ? 'atualizar' : 'criar'} produto`, 'error');
    }
  };

  const handleImageClick = (product) => {
	  if ( product.image_url )
	  {
		  //se a url da img tiver http://localstack:4566 vc muda pra http://localhost:4566
		  product.image_url = product.image_url.replace('http://localstack:4566', 'http://localhost:4566');
		setSelectedImage( product.image_url );
      setImageDialogOpen(true);
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
          Novo Produto
        </Button>
      </Box>

      <DataTable
        loading={loading}
        columns={columns}
        data={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onImageClick={handleImageClick}
      />

      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedProduct ? 'Editar Produto' : 'Novo Produto'}
        fields={formFields}
        initialValues={selectedProduct || {}}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Visualizar Imagem
            <IconButton onClick={() => setImageDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <img
            src={selectedImage}
            alt="Produto"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>

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

export default Products;