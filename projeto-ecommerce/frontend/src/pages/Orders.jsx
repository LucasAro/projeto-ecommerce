import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Chip
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import DataTable from '../../src/components/Table/Table';
import FormDialog from '../../src/components/Form/Form';

const Orders = () => {
  // Estados
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Colunas da tabela
  const columns = [
    {
      id: 'date',
      label: 'Data',
      minWidth: 170,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Sem data'
    },
    {
      id: 'total',
      label: 'Total',
      minWidth: 100,
      type: 'currency',
      render: (value) => `R$ ${Number(value).toFixed(2)}`
    },
    {
      id: 'product_ids',
      label: 'Produtos',
      minWidth: 200,
      render: (value) => {
        // Log detalhado para debugging
        console.log('DEBUG - Renderizando Produtos da Ordem:', {
          productIds: value,
          availableProducts: products
        });

        // Método robusto de correspondência de produtos
        const orderProducts = products.filter(prod => {
          if (!value || !Array.isArray(value)) return false;

          // Converte os IDs para string para comparação consistente
          const prodId = String(prod._id || prod.id || '');
          const orderProductIds = value.map(id => String(id));

          return orderProductIds.includes(prodId);
        });

        console.log('DEBUG - Produtos Correspondentes:', orderProducts);

        // Renderiza os nomes dos produtos
        const productNames = orderProducts.map(prod => prod.name);

        return productNames.length > 0
          ? productNames.map((name, index) => (
              <Chip
                key={index}
                label={name}
                size="small"
                style={{ margin: 2 }}
              />
            ))
          : 'Sem produtos';
      }
    }
  ];

  // Campos do formulário
  const formFields = [
    {
      name: 'product_ids',
      label: 'Produtos',
      type: 'autocomplete',
      multiple: true,
      gridCols: 12,
      options: products,
      required: false,
      getOptionLabel: (option) => `${option.name} - R$ ${Number(option.price).toFixed(2)}`
    },
    // {
    //   name: 'date',
    //   label: 'Data',
    //   type: 'date',
    //   gridCols: 12,
    //   required: false
    // }
  ];

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Products
        const productsResponse = await fetch('http://localhost:8000/api/v1/products/');
        const productsData = await productsResponse.json();

        console.log('DEBUG - Produtos Recebidos:', productsData);
        setProducts(productsData);

        // Fetch Orders
        const ordersResponse = await fetch('http://localhost:8000/api/v1/orders/');
        const ordersData = await ordersResponse.json();

        console.log('DEBUG - Pedidos Recebidos:', ordersData);
        setOrders(ordersData);

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
    setSelectedOrder(null);
    setFormOpen(true);
  };

  const handleEdit = (order) => {
    console.log('DEBUG - Pedido selecionado para edição:', order);

    // Prepara o pedido para edição, mapeando produtos
    const orderWithProducts = {
      ...order,
      product_ids: products.filter(prod =>
        order.product_ids?.map(id => String(id)).includes(String(prod._id))
      ),
      date: order.date ? new Date(order.date).toISOString().split('T')[0] : null
    };

    console.log('DEBUG - Pedido preparado para edição:', orderWithProducts);

    setSelectedOrder(orderWithProducts);
    setFormOpen(true);
  };

  const handleDelete = async (order) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/orders/${order._id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          showSnackbar('Pedido excluído com sucesso');
          // Recarrega os pedidos após a exclusão
          const ordersResponse = await fetch('http://localhost:8000/api/v1/orders/');
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        } else {
          const errorData = await response.text();
          console.error('Erro ao excluir pedido:', errorData);
          throw new Error('Erro ao excluir pedido');
        }
      } catch (error) {
        console.error('Erro no handleDelete:', error);
        showSnackbar('Erro ao excluir pedido', 'error');
      }
    }
  };

  const handleSubmit = async (values) => {
	console.log('DEBUG - Valores do formulário de pedido:', values);

	try {
	  const url = selectedOrder
		? `http://localhost:8000/api/v1/orders/${selectedOrder._id}`
		: 'http://localhost:8000/api/v1/orders/';

	  const method = selectedOrder ? 'PUT' : 'POST';

	  const payload = {
		date: new Date().toISOString(),
		product_ids: values.product_ids ? values.product_ids.map(prod => prod._id) : [],
		total: 0  // O backend calcula o total
	  };

	  const response = await fetch(url, {
		method,
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	  });

	  if (response.ok) {
		// Recarrega os pedidos após a submissão
		const ordersResponse = await fetch('http://localhost:8000/api/v1/orders/');
		const ordersData = await ordersResponse.json();
		setOrders(ordersData);

		showSnackbar(`Pedido ${selectedOrder ? 'atualizado' : 'criado'} com sucesso`);
		setFormOpen(false);
	  } else {
		const errorData = await response.text();
		console.error('Erro ao salvar pedido:', errorData);
		throw new Error('Erro ao salvar pedido');
	  }
	} catch (error) {
	  console.error('Erro no handleSubmit:', error);
	  showSnackbar(`Erro ao ${selectedOrder ? 'atualizar' : 'criar'} pedido`, 'error');
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
          Novo Pedido
        </Button>
      </Box>

      <DataTable
        loading={loading}
        columns={columns}
        data={orders}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedOrder ? 'Editar Pedido' : 'Novo Pedido'}
        fields={formFields}
        initialValues={selectedOrder || {}}
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

export default Orders;