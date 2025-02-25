import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormDialog from '../Form';
import userEvent from '@testing-library/user-event';

// Mock para o componente Autocomplete do MUI
jest.mock('@mui/material', () => {
  const originalModule = jest.requireActual('@mui/material');
  return {
    ...originalModule,
    Autocomplete: ({ options, renderInput, onChange, value, multiple }) => {
      const handleChange = (event) => {
        if (onChange) {
          // Passamos o valor selecionado para simular a seleção
          onChange(event, multiple ? [options[0]] : options[0]);
        }
      };

      return (
        <div data-testid="mock-autocomplete">
          {renderInput({
            inputProps: { 'data-testid': 'autocomplete-input' }
          })}
          <select data-testid="autocomplete-select" onChange={handleChange}>
            {options.map((option, index) => (
              <option key={index} value={option.id || option._id || index}>
                {option.name || option.label || JSON.stringify(option)}
              </option>
            ))}
          </select>
        </div>
      );
    }
  };
});

// Configuração para cada teste
const defaultProps = {
  open: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  title: 'Formulário de Teste',
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    { name: 'description', label: 'Descrição', type: 'text', multiline: true, rows: 3 },
    { name: 'price', label: 'Preço', type: 'number' }
  ],
  initialValues: { name: '', description: '', price: '' }
};

describe('FormDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar o título e campos do formulário', () => {
    render(<FormDialog {...defaultProps} />);

    // Verifica o título
    expect(screen.getByText('Formulário de Teste')).toBeInTheDocument();

    // Verifica os campos
    expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preço/i)).toBeInTheDocument();

    // Verifica os botões
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Salvar')).toBeInTheDocument();
  });

  test('deve chamar onClose quando o botão Cancelar é clicado', () => {
    render(<FormDialog {...defaultProps} />);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('deve atualizar valores quando os campos são alterados', async () => {
    render(<FormDialog {...defaultProps} />);

    // Preenche os campos
    const nameInput = screen.getByLabelText(/Nome/i);
    const descriptionInput = screen.getByLabelText(/Descrição/i);
    const priceInput = screen.getByLabelText(/Preço/i);

    fireEvent.change(nameInput, { target: { value: 'Produto Teste' } });
    fireEvent.change(descriptionInput, { target: { value: 'Descrição do produto teste' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });

    expect(nameInput.value).toBe('Produto Teste');
    expect(descriptionInput.value).toBe('Descrição do produto teste');
    expect(priceInput.value).toBe('99.99');
  });

  test('deve mostrar erro quando campo obrigatório não é preenchido', async () => {
    render(<FormDialog {...defaultProps} />);

    // Tenta enviar o formulário sem preencher o campo obrigatório
    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    // Verifica se a mensagem de erro aparece
    expect(await screen.findByText('Este campo é obrigatório')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('deve chamar onSubmit com os valores corretos quando o formulário é válido', async () => {
    render(<FormDialog {...defaultProps} />);

    // Preenche o campo obrigatório
    const nameInput = screen.getByLabelText(/Nome/i);
    fireEvent.change(nameInput, { target: { value: 'Produto Teste' } });

    // Envia o formulário
    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    // Verifica se onSubmit foi chamado com os valores corretos
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: 'Produto Teste',
        description: '',
        price: ''
      });
    });
  });

  test('deve renderizar campo autocomplete corretamente', () => {
    const propsWithAutocomplete = {
      ...defaultProps,
      fields: [
        ...defaultProps.fields,
        {
          name: 'categories',
          label: 'Categorias',
          type: 'autocomplete',
          multiple: true,
          options: [
            { _id: 'cat1', name: 'Eletrônicos' },
            { _id: 'cat2', name: 'Acessórios' }
          ],
          getOptionLabel: (option) => option.name
        }
      ],
      initialValues: { ...defaultProps.initialValues, categories: [] }
    };

    render(<FormDialog {...propsWithAutocomplete} />);

    // Verifica se o campo autocomplete é renderizado
    expect(screen.getByTestId('mock-autocomplete')).toBeInTheDocument();
    expect(screen.getByLabelText(/Categorias/i)).toBeInTheDocument();

    // Simula uma seleção no autocomplete
    const autocompleteSelect = screen.getByTestId('autocomplete-select');
    fireEvent.change(autocompleteSelect, { target: { value: 'cat1' } });

    // O comportamento do Autocomplete é mockado para selecionar sempre a primeira opção
  });

  test('deve renderizar campo de upload de arquivo corretamente', () => {
    const propsWithFileUpload = {
      ...defaultProps,
      fields: [
        ...defaultProps.fields,
        {
          name: 'image',
          label: 'Imagem',
          type: 'file',
          accept: 'image/*'
        }
      ]
    };

    render(<FormDialog {...propsWithFileUpload} />);

    // Verifica se o botão de upload é renderizado
    expect(screen.getByText('Imagem')).toBeInTheDocument();
  });

  test('deve processar o upload de arquivo corretamente', () => {
    const propsWithFileUpload = {
      ...defaultProps,
      fields: [
        ...defaultProps.fields,
        {
          name: 'image',
          label: 'Imagem',
          type: 'file',
          accept: 'image/*'
        }
      ]
    };

    render(<FormDialog {...propsWithFileUpload} />);

    // Simula o upload de um arquivo
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Verifica se o nome do arquivo aparece
    expect(screen.getByText('Arquivo selecionado: example.png')).toBeInTheDocument();
  });

  test('deve usar valores iniciais fornecidos', () => {
    const propsWithInitialValues = {
      ...defaultProps,
      initialValues: {
        name: 'Produto Inicial',
        description: 'Descrição inicial',
        price: 199.99
      }
    };

    render(<FormDialog {...propsWithInitialValues} />);

    // Verifica se os valores iniciais estão nos campos
    expect(screen.getByLabelText(/Nome/i).value).toBe('Produto Inicial');
    expect(screen.getByLabelText(/Descrição/i).value).toBe('Descrição inicial');
    expect(screen.getByLabelText(/Preço/i).value).toBe('199.99');
  });
});