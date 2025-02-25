import { fn } from '@storybook/test';
import React, { useState } from 'react';
import FormDialog from '../components/Form/Form';

export default {
  title: 'Components/FormDialog',
  component: FormDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      description: 'Controla se o diálogo está aberto ou fechado',
      control: 'boolean',
    },
    onClose: {
      description: 'Função chamada quando o diálogo é fechado',
      action: 'closed',
    },
    onSubmit: {
      description: 'Função chamada quando o formulário é enviado',
      action: 'submitted',
    },
    title: {
      description: 'Título do diálogo',
      control: 'text',
    },
    fields: {
      description: 'Array de configurações dos campos do formulário',
      control: 'object',
    },
    initialValues: {
      description: 'Valores iniciais dos campos',
      control: 'object',
    },
    submitLabel: {
      description: 'Texto do botão de enviar',
      control: 'text',
    },
    maxWidth: {
      description: 'Largura máxima do diálogo',
      control: { type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    },
  },
  args: {
    open: false, // Alterado para false por padrão
    onClose: fn(),
    onSubmit: fn(),
    title: 'Formulário',
    submitLabel: 'Salvar',
    maxWidth: 'sm',
  },
  // Decorator para adicionar um botão que controla a abertura do diálogo
  decorators: [
    (Story, context) => {
      const [open, setOpen] = React.useState(false);
      context.args.open = open;
      context.args.onClose = () => setOpen(false);

      return (
        <div style={{ padding: '1rem' }}>
          <button
            onClick={() => setOpen(true)}
            style={{
              padding: '8px 16px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            Abrir {context.args.title}
          </button>
          <div style={{ marginBottom: '1rem' }}>
            <em>Clique no botão acima para abrir o formulário.</em>
          </div>
          <Story />
        </div>
      );
    },
  ],
};

// Formulário básico com campos de texto
export const BasicForm = {
  args: {
    title: 'Novo Produto',
    fields: [
      {
        name: 'name',
        label: 'Nome',
        type: 'text',
        required: true,
        gridCols: 12
      },
      {
        name: 'description',
        label: 'Descrição',
        type: 'text',
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
        name: 'stock',
        label: 'Estoque',
        type: 'number',
        required: true,
        gridCols: 6
      }
    ],
    initialValues: {
      name: '',
      description: '',
      price: '',
      stock: ''
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Formulário básico com campos de texto, área de texto e números.'
      }
    }
  }
};

// Formulário de produto com categorias (autocomplete)
export const ProductForm = {
  args: {
    title: 'Editar Produto',
    fields: [
      {
        name: 'name',
        label: 'Nome',
        type: 'text',
        required: true,
        gridCols: 12
      },
      {
        name: 'description',
        label: 'Descrição',
        type: 'text',
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
        name: 'stock',
        label: 'Estoque',
        type: 'number',
        required: true,
        gridCols: 6
      },
      {
        name: 'categories',
        label: 'Categorias',
        type: 'autocomplete',
        required: true,
        multiple: true,
        options: [
          { _id: 'c1', name: 'Eletrônicos' },
          { _id: 'c2', name: 'Smartphones' },
          { _id: 'c3', name: 'Computadores' },
          { _id: 'c4', name: 'Acessórios' },
          { _id: 'c5', name: 'Móveis' },
          { _id: 'c6', name: 'Decoração' }
        ],
        getOptionLabel: (option) => option.name,
        gridCols: 12
      },
      {
        name: 'image',
        label: 'Selecionar Imagem',
        type: 'file',
        accept: 'image/*',
        gridCols: 12
      }
    ],
    initialValues: {
      name: 'Smartphone XYZ',
      description: 'Smartphone de última geração com 128GB',
      price: 1299.99,
      stock: 50,
      categories: [
        { _id: 'c1', name: 'Eletrônicos' },
        { _id: 'c2', name: 'Smartphones' }
      ]
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Formulário de produto completo com campos para nome, descrição, preço, estoque, seleção múltipla de categorias e upload de imagem.'
      }
    }
  }
};

// Formulário de criação de categoria
export const CategoryForm = {
  args: {
    title: 'Nova Categoria',
    fields: [
      {
        name: 'name',
        label: 'Nome da Categoria',
        type: 'text',
        required: true,
        gridCols: 12
      },
      {
        name: 'description',
        label: 'Descrição',
        type: 'text',
        multiline: true,
        rows: 2,
        gridCols: 12
      }
    ],
    initialValues: {
      name: '',
      description: ''
    },
    submitLabel: 'Criar Categoria'
  },
  parameters: {
    docs: {
      description: {
        story: 'Formulário simples para criação de categorias.'
      }
    }
  }
};

// Formulário com validação (mostra erros)
export const FormWithValidation = {
  args: {
    ...BasicForm.args,
    title: 'Formulário com Validação',
    initialValues: {}, // Sem valores iniciais para demonstrar validação
  },
  play: async ({ canvasElement, args }) => {
    // Esta função será executada quando o story for carregado
    // Poderia ser usada para teste interativo com Storybook interaction testing
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstração de formulário com validação. Os campos obrigatórios mostrarão mensagens de erro se o formulário for enviado sem preenchê-los.'
      }
    }
  }
};

// Formulário de pedido
export const OrderForm = {
  args: {
    title: 'Novo Pedido',
    fields: [
      {
        name: 'date',
        label: 'Data',
        type: 'date',
        required: true,
        gridCols: 6
      },
      {
        name: 'customer',
        label: 'Cliente',
        type: 'text',
        required: true,
        gridCols: 6
      },
      {
        name: 'products',
        label: 'Produtos',
        type: 'autocomplete',
        required: true,
        multiple: true,
        options: [
          { _id: 'p1', name: 'Smartphone XYZ', price: 1299.99 },
          { _id: 'p2', name: 'Notebook Ultra', price: 3499.99 },
          { _id: 'p3', name: 'Fone de Ouvido Pro', price: 499.99 },
          { _id: 'p4', name: 'Mouse Wireless', price: 99.99 },
          { _id: 'p5', name: 'Teclado Mecânico', price: 299.99 }
        ],
        getOptionLabel: (option) => `${option.name} - R$ ${option.price.toFixed(2)}`,
        gridCols: 12
      },
      {
        name: 'notes',
        label: 'Observações',
        type: 'text',
        multiline: true,
        rows: 3,
        gridCols: 12
      }
    ],
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      customer: '',
      products: [],
      notes: ''
    },
    maxWidth: 'md',
    submitLabel: 'Criar Pedido'
  },
  parameters: {
    docs: {
      description: {
        story: 'Formulário para criação de pedidos com seleção de data, cliente, produtos e observações.'
      }
    }
  }
};