import { fn } from '@storybook/test';
import DataTable from '../components/Table/Table';

export default {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      description: 'Configuração das colunas da tabela',
      control: 'object',
    },
    data: {
      description: 'Dados a serem exibidos na tabela',
      control: 'object',
    },
    title: {
      description: 'Título da tabela',
      control: 'text',
    },
    onEdit: {
      description: 'Função chamada ao clicar no botão de editar',
      action: 'edited',
    },
    onDelete: {
      description: 'Função chamada ao clicar no botão de excluir',
      action: 'deleted',
    },
    onImageClick: {
      description: 'Função chamada ao clicar no ícone de imagem',
      action: 'image clicked',
    },
    page: {
      description: 'Página atual (zero-based)',
      control: { type: 'number', min: 0 },
    },
    rowsPerPage: {
      description: 'Número de linhas por página',
      control: { type: 'select', options: [5, 10, 25, 50, 100] },
    },
    totalCount: {
      description: 'Total de registros (para paginação)',
      control: 'number',
    },
  },
  args: {
    onEdit: fn(),
    onDelete: fn(),
    onImageClick: fn(),
    onPageChange: fn(),
    onRowsPerPageChange: fn(),
  },
};

// Tabela de Produtos
export const ProductsTable = {
  args: {
    title: 'Lista de Produtos',
    columns: [
      { id: 'name', label: 'Nome', minWidth: 170 },
      { id: 'description', label: 'Descrição', minWidth: 200 },
      { id: 'price', label: 'Preço', type: 'currency', minWidth: 100 },
      {
        id: 'categories',
        label: 'Categorias',
        minWidth: 150,
        render: (categories) => categories.map(cat => cat.name).join(', ')
      },
      { id: 'image_url', label: 'Imagem', type: 'image', minWidth: 80 },
    ],
    data: [
      {
        _id: '1',
        name: 'Smartphone XYZ',
        description: 'Smartphone de última geração com 128GB',
        price: 1299.99,
        categories: [
          { _id: 'c1', name: 'Eletrônicos' },
          { _id: 'c2', name: 'Smartphones' }
        ],
        image_url: 'https://example.com/image1.jpg'
      },
      {
        _id: '2',
        name: 'Notebook Ultra',
        description: 'Notebook ultrafino com processador i7',
        price: 3499.99,
        categories: [
          { _id: 'c1', name: 'Eletrônicos' },
          { _id: 'c3', name: 'Computadores' }
        ],
        image_url: 'https://example.com/image2.jpg'
      },
      {
        _id: '3',
        name: 'Fone de Ouvido Pro',
        description: 'Fone de ouvido com cancelamento de ruído',
        price: 499.99,
        categories: [
          { _id: 'c1', name: 'Eletrônicos' },
          { _id: 'c4', name: 'Acessórios' }
        ],
        image_url: 'https://example.com/image3.jpg'
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Tabela de produtos com nome, descrição, preço, categorias e imagem.'
      }
    }
  }
};

// Tabela de Categorias
export const CategoriesTable = {
  args: {
    title: 'Lista de Categorias',
    columns: [
      { id: 'name', label: 'Nome', minWidth: 200 },
    ],
    data: [
      { _id: 'c1', name: 'Eletrônicos' },
      { _id: 'c2', name: 'Smartphones' },
      { _id: 'c3', name: 'Computadores' },
      { _id: 'c4', name: 'Acessórios' },
      { _id: 'c5', name: 'Móveis' },
      { _id: 'c6', name: 'Decoração' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Tabela simples para listar categorias de produtos.'
      }
    }
  }
};

// Tabela de Pedidos
export const OrdersTable = {
  args: {
    title: 'Lista de Pedidos',
    columns: [
      {
        id: 'date',
        label: 'Data',
        minWidth: 120,
        render: (value) => {
          const date = new Date(value);
          return date.toLocaleDateString('pt-BR');
        }
      },
      { id: 'total', label: 'Total', type: 'currency', minWidth: 100 },
      {
        id: 'products',
        label: 'Produtos',
        minWidth: 250,
        render: (products) => {
          if (!products || !products.length) return '-';

          // Se tiver muitos produtos, mostra os primeiros e indica quantos mais
          if (products.length > 2) {
            return `${products[0].name}, ${products[1].name} e mais ${products.length - 2}`;
          }

          return products.map(p => p.name).join(', ');
        }
      },
    ],
    data: [
      {
        _id: 'o1',
        date: '2023-05-10T10:30:00',
        total: 4799.98,
        products: [
          { _id: '1', name: 'Smartphone XYZ', quantity: 1 },
          { _id: '2', name: 'Notebook Ultra', quantity: 1 }
        ]
      },
      {
        _id: 'o2',
        date: '2023-05-15T14:45:00',
        total: 1799.98,
        products: [
          { _id: '1', name: 'Smartphone XYZ', quantity: 1 },
          { _id: '3', name: 'Fone de Ouvido Pro', quantity: 1 }
        ]
      },
      {
        _id: 'o3',
        date: '2023-05-20T09:15:00',
        total: 2499.95,
        products: [
          { _id: '3', name: 'Fone de Ouvido Pro', quantity: 5 }
        ]
      },
      {
        _id: 'o4',
        date: '2023-05-22T16:20:00',
        total: 10499.97,
        products: [
          { _id: '2', name: 'Notebook Ultra', quantity: 3 }
        ]
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Tabela de pedidos mostrando data, total e lista de produtos.'
      }
    }
  }
};

// Tabela com Paginação
export const TableWithPagination = {
  args: {
    ...ProductsTable.args,
    page: 0,
    rowsPerPage: 10,
    totalCount: 100,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tabela de produtos com paginação para conjuntos de dados maiores.'
      }
    }
  }
};

// Tabela com Estado Vazio
export const EmptyTable = {
  args: {
    title: 'Sem Dados',
    columns: ProductsTable.args.columns,
    data: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Tabela sem dados, mostrando como o componente lida com estados vazios.'
      }
    }
  }
};