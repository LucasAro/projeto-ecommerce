// src/components/Table/__tests__/Table.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataTable from '../Table';

// Mock dos dados para uso nos testes
const mockColumns = [
  { id: 'name', label: 'Nome', minWidth: 170 },
  { id: 'description', label: 'Descrição', minWidth: 200 },
  { id: 'price', label: 'Preço', type: 'currency', minWidth: 100 },
];

const mockData = [
  {
    _id: '1',
    name: 'Smartphone XYZ',
    description: 'Smartphone de última geração',
    price: 1299.99,
  },
  {
    _id: '2',
    name: 'Notebook Ultra',
    description: 'Notebook ultrafino',
    price: 3499.99,
  },
];

describe('DataTable Component', () => {
  test('deve renderizar o título da tabela corretamente', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        title="Lista de Produtos"
      />
    );

    expect(screen.getByText('Lista de Produtos')).toBeInTheDocument();
  });

  test('deve renderizar os cabeçalhos das colunas corretamente', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
      />
    );

    mockColumns.forEach(column => {
      expect(screen.getByText(column.label)).toBeInTheDocument();
    });

    // Verifica se a coluna de ações está presente
    expect(screen.getByText('Ações')).toBeInTheDocument();
  });

  test('deve renderizar os dados corretamente', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
      />
    );

    // Verifica se os dados foram renderizados
    expect(screen.getByText('Smartphone XYZ')).toBeInTheDocument();
    expect(screen.getByText('Notebook Ultra')).toBeInTheDocument();
    expect(screen.getByText('Smartphone de última geração')).toBeInTheDocument();
    expect(screen.getByText('Notebook ultrafino')).toBeInTheDocument();
    expect(screen.getByText('R$ 1299.99')).toBeInTheDocument();
    expect(screen.getByText('R$ 3499.99')).toBeInTheDocument();
  });

  test('deve chamar a função onEdit quando o botão de editar é clicado', () => {
    const handleEdit = jest.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onEdit={handleEdit}
      />
    );

    // Encontra botões de editar e clica no primeiro
    const editButtons = screen.getAllByLabelText(/Editar/);
    fireEvent.click(editButtons[0]);

    // Verifica se a função foi chamada com o item correto
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleEdit).toHaveBeenCalledWith(mockData[0]);
  });

  test('deve chamar a função onDelete quando o botão de excluir é clicado', () => {
    const handleDelete = jest.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onDelete={handleDelete}
      />
    );

    // Encontra botões de excluir e clica no primeiro
    const deleteButtons = screen.getAllByLabelText(/Excluir/);
    fireEvent.click(deleteButtons[0]);

    // Verifica se a função foi chamada com o item correto
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith(mockData[0]);
  });

  test('deve exibir mensagem quando não há dados', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
        emptyStateMessage="Nenhum produto encontrado"
      />
    );

    expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
  });

});