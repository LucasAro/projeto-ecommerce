import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Box,
  Autocomplete,
  Chip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { LineChart, ResponsiveContainer, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  // Função para pegar o primeiro dia do mês atual
  const getFirstDayOfMonth = () => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  };

  // Função para pegar o dia atual
  const getCurrentDay = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Estados principais
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    averageOrderValue: 0,
    totalRevenue: 0
  });
  const [periodData, setPeriodData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [periodOrders, setPeriodOrders] = useState([]);

  // Estados para os filtros
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getCurrentDay());
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Funções auxiliares
  const buildFilterUrl = () => {
    const params = new URLSearchParams();

    if (startDate) {
      params.append('start_date', `${startDate}T00:00:00`);
    }
    if (endDate) {
      params.append('end_date', `${endDate}T23:59:59`);
    }
    if (selectedCategories.length > 0) {
      selectedCategories.forEach(cat => {
        params.append('category_ids', cat._id);
      });
    }
    if (selectedProducts.length > 0) {
      selectedProducts.forEach(prod => {
        params.append('product_ids', prod._id);
      });
    }

    return `http://localhost:8000/api/v1/dashboard/sales${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const formatDataByPeriod = (data, period) => {
    if (!data || !data.length) return [];

    const groupedData = {};

    data.forEach(entry => {
      let periodKey;
      const date = new Date(entry.date);

      switch (period) {
        case 'daily':
          periodKey = date.toLocaleDateString();
          break;
        case 'weekly':
          const firstDay = new Date(date);
          firstDay.setDate(date.getDate() - date.getDay());
          periodKey = `Semana ${firstDay.toLocaleDateString()}`;
          break;
        case 'monthly':
          periodKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
          break;
        default:
          periodKey = date.toLocaleDateString();
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = {
          period: periodKey,
          orders: 0,
          revenue: 0
        };
      }

      groupedData[periodKey].orders += entry.orders || 1;
      groupedData[periodKey].revenue += entry.revenue || 0;
    });

    return Object.values(groupedData);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/categories/');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/products/');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const url = buildFilterUrl();
      console.log('Fetching metrics from:', url);
      const response = await fetch(url);
      const data = await response.json();

      setMetrics({
        totalOrders: data.metrics.total_orders,
        averageOrderValue: data.metrics.avg_order_value,
        totalRevenue: data.metrics.total_revenue
      });

      const formattedTimeSeries = data.time_series.map(entry => ({
        date: new Date(entry.date).toLocaleDateString(),
        value: entry.revenue,
        orders: entry.orders
      }));

      setPeriodData(formattedTimeSeries);

      const periodOrdersData = formatDataByPeriod(data.time_series, selectedPeriod);
      setPeriodOrders(periodOrdersData);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    }
  };

  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setSelectedPeriod(newPeriod);
      const periodOrdersData = formatDataByPeriod(periodData, newPeriod);
      setPeriodOrders(periodOrdersData);
    }
  };

  const handleApplyFilters = () => {
    fetchMetrics();
  };

  const handleClearFilters = () => {
    setStartDate(getFirstDayOfMonth());
    setEndDate(getCurrentDay());
    setSelectedCategories([]);
    setSelectedProducts([]);
    fetchMetrics();
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchMetrics();
  }, []);

  return (
    <div className="p-4">
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filtros</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Data Inicial"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Data Final"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                multiple
                value={selectedCategories}
                onChange={(event, newValue) => setSelectedCategories(newValue)}
                options={categories}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField {...params} label="Categorias" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option._id}
                      label={option.name}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                multiple
                value={selectedProducts}
                onChange={(event, newValue) => setSelectedProducts(newValue)}
                options={products}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField {...params} label="Produtos" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option._id}
                      label={option.name}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
            <Button variant="outlined" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total de Pedidos</Typography>
              <Typography variant="h4">{metrics.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Valor Médio por Pedido</Typography>
              <Typography variant="h4">
                R$ {metrics.averageOrderValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Receita Total</Typography>
              <Typography variant="h4">
                R$ {metrics.totalRevenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Pedidos por Período</Typography>
                <ToggleButtonGroup
                  value={selectedPeriod}
                  exclusive
                  onChange={handlePeriodChange}
                  aria-label="período de visualização"
                >
                  <ToggleButton value="daily" aria-label="diário">
                    Diário
                  </ToggleButton>
                  <ToggleButton value="weekly" aria-label="semanal">
                    Semanal
                  </ToggleButton>
                  <ToggleButton value="monthly" aria-label="mensal">
                    Mensal
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={periodOrders}>
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="Pedidos" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Receita" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Evolução da Receita</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={periodData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" name="Receita" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;