import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  Box,
  useTheme,
  TableFooter,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * DataTable component for displaying tabular data with support for actions and pagination
 *
 * @component
 */
const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onImageClick,
  title,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  emptyStateMessage
}) => {
  const theme = useTheme();
  const hasPagination = typeof onPageChange === 'function' && typeof rowsPerPage !== 'undefined';
  const isEmpty = !data || data.length === 0;

  /**
   * Renders cell content based on column type and configuration
   *
   * @param {Object} item - The data row
   * @param {Object} column - The column configuration
   * @returns {React.ReactNode} - The rendered cell content
   */
  const renderCellContent = (item, column) => {
    if (column.render) {
      return column.render(item[column.id], item);
    }

    if (column.type === 'currency' && item[column.id] !== undefined) {
      return `R$ ${Number(item[column.id]).toFixed(2)}`;
    }

    if (column.type === 'date' && item[column.id]) {
      try {
        const date = new Date(item[column.id]);
        return date.toLocaleDateString('pt-BR');
      } catch (e) {
        return item[column.id];
      }
    }

    if (column.type === 'image' && item[column.id]) {
      return (
        <Tooltip title="Ver imagem">
          <IconButton
            size="small"
            onClick={() => onImageClick && onImageClick(item)}
            aria-label={`Ver imagem de ${item.name || 'item'}`}
          >
            <ImageIcon />
          </IconButton>
        </Tooltip>
      );
    }

    return item[column.id] !== undefined ? item[column.id] : '';
  };

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        boxShadow: theme.shadows[2]
      }}
    >
      {title && (
        <Box p={2} sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {totalCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {totalCount} {totalCount === 1 ? 'registro' : 'registros'}
            </Typography>
          )}
        </Box>
      )}

      <TableContainer>
        <Table aria-label={title || "Tabela de dados"}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{
                    minWidth: column.minWidth,
                    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
                    fontWeight: 'bold'
                  }}
                >
                  {column.label}
                  {column.tooltip && (
                    <Tooltip title={column.tooltip}>
                      <InfoIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle', fontSize: '0.875rem' }} />
                    </Tooltip>
                  )}
                </TableCell>
              ))}
              <TableCell
                align="right"
                style={{
                  minWidth: 120,
                  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
                  fontWeight: 'bold'
                }}
              >
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isEmpty ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  <Alert severity="info" sx={{ maxWidth: '400px', mx: 'auto' }}>
                    {emptyStateMessage || 'Nenhum registro encontrado.'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={item._id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:nth-of-type(even)': {
                      backgroundColor: theme.palette.mode === 'light'
                        ? theme.palette.grey[50]
                        : theme.palette.grey[900]
                    }
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      {renderCellContent(item, column)}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    {onEdit && (
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(item)}
                          color="primary"
                          aria-label={`Editar ${item.name || 'item'}`}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(item)}
                          color="error"
                          aria-label={`Excluir ${item.name || 'item'}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {hasPagination && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  colSpan={columns.length + 1}
                  count={totalCount || 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: { 'aria-label': 'Linhas por página' },
                    native: true,
                  }}
                  onPageChange={onPageChange}
                  onRowsPerPageChange={onRowsPerPageChange}
                  labelRowsPerPage="Linhas por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </Paper>
  );
};

DataTable.propTypes = {
  /** Array of column definitions */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      /** Unique identifier for the column, should match a property in the data objects */
      id: PropTypes.string.isRequired,
      /** Display label for the column header */
      label: PropTypes.string.isRequired,
      /** Minimum width of the column in pixels */
      minWidth: PropTypes.number,
      /** Text alignment for the column */
      align: PropTypes.oneOf(['left', 'right', 'center']),
      /** Data type for automatic formatting */
      type: PropTypes.oneOf(['text', 'currency', 'image', 'date']),
      /** Optional tooltip to display next to column header */
      tooltip: PropTypes.string,
      /** Custom render function for cell content */
      render: PropTypes.func,
    })
  ).isRequired,
  /** Array of data objects to display in the table */
  data: PropTypes.array.isRequired,
  /** Callback function when edit button is clicked */
  onEdit: PropTypes.func,
  /** Callback function when delete button is clicked */
  onDelete: PropTypes.func,
  /** Callback function when image icon is clicked */
  onImageClick: PropTypes.func,
  /** Table title displayed at the top */
  title: PropTypes.string,
  /** Current page index (zero-based) */
  page: PropTypes.number,
  /** Number of rows to display per page */
  rowsPerPage: PropTypes.number,
  /** Total number of records (for pagination) */
  totalCount: PropTypes.number,
  /** Callback function when page changes */
  onPageChange: PropTypes.func,
  /** Callback function when rows per page changes */
  onRowsPerPageChange: PropTypes.func,
  /** Custom message to display when the table is empty */
  emptyStateMessage: PropTypes.string,
};

export default DataTable;