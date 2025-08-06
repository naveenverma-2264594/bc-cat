'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TablePagination from '@mui/material/TablePagination';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Checkbox from '@mui/material/Checkbox';
import TableSortLabel from '@mui/material/TableSortLabel';

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number,
  price: number,
  category: string,
  rating: number,
  stock: number,
  origin: string,
  expiry: string,
) {
  return {
    name,
    calories,
    fat,
    carbs,
    protein,
    price,
    category,
    rating,
    stock,
    origin,
    expiry,
    history: [
      {
        date: '2020-01-05',
        customerId: '11091700',
        amount: 3,
      },
      {
        date: '2020-01-02',
        customerId: 'Anonymous',
        amount: 1,
      },
    ],
  };
}

function Row(props: {
  row: ReturnType<typeof createData>;
  selected: boolean;
  onSelect: () => void;
}) {
  const { row, selected, onSelect } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <Checkbox checked={selected} onChange={onSelect} />
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">{row.name}</TableCell>
        <TableCell align="right">{row.calories}</TableCell>
        <TableCell align="right">{row.fat}</TableCell>
        <TableCell align="right">{row.carbs}</TableCell>
        <TableCell align="right">{row.protein}</TableCell>
        <TableCell align="right">{row.price}</TableCell>
        <TableCell align="right">{row.category}</TableCell>
        <TableCell align="right">{row.rating}</TableCell>
        <TableCell align="right">{row.stock}</TableCell>
        <TableCell align="right">{row.origin}</TableCell>
        <TableCell align="right">{row.expiry}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={13}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Total price ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.date}
                      </TableCell>
                      <TableCell>{historyRow.customerId}</TableCell>
                      <TableCell align="right">{historyRow.amount}</TableCell>
                      <TableCell align="right">
                        {Math.round(historyRow.amount * row.price * 100) / 100}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0, 3.99, 'Dessert', 4.5, 20, 'USA', '2025-12-31'),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3, 4.99, 'Dessert', 4.7, 15, 'Canada', '2025-11-30'),
  createData('Eclair', 262, 16.0, 24, 6.0, 3.79, 'Pastry', 4.2, 10, 'France', '2025-10-15'),
  createData('Cupcake', 305, 3.7, 67, 4.3, 2.5, 'Bakery', 4.8, 25, 'UK', '2025-09-20'),
  createData('Gingerbread', 356, 16.0, 49, 3.9, 1.5, 'Bakery', 4.1, 30, 'Germany', '2025-08-10'),
  createData('Banana Split', 210, 5.5, 30, 4.1, 4.49, 'Dessert', 4.6, 18, 'USA', '2025-12-15'),
  createData('Strawberry Shortcake', 280, 7.0, 42, 4.6, 5.25, 'Dessert', 4.7, 22, 'UK', '2025-11-10'),
  createData('Chocolate Mousse', 235, 10.0, 28, 5.2, 4.75, 'Pastry', 4.5, 12, 'France', '2025-10-05'),
  createData('Lemon Tart', 195, 4.2, 22, 3.8, 3.25, 'Pastry', 4.3, 20, 'Italy', '2025-09-25'),
  createData('Peach Cobbler', 310, 8.5, 50, 4.9, 3.99, 'Bakery', 4.4, 16, 'USA', '2025-08-30'),
  createData('Churros', 220, 8.0, 25, 3.5, 2.99, 'Bakery', 4.2, 28, 'Spain', '2025-12-01'),
  createData('Tiramisu', 330, 11.0, 40, 5.0, 5.49, 'Dessert', 4.8, 14, 'Italy', '2025-11-20'),
  createData('Macaron', 150, 6.0, 20, 2.5, 3.25, 'Pastry', 4.6, 19, 'France', '2025-10-10'),
  createData('Baklava', 290, 12.0, 35, 3.9, 4.75, 'Bakery', 4.5, 17, 'Turkey', '2025-09-15'),
  createData('Pecan Pie', 400, 18.0, 55, 4.8, 4.99, 'Dessert', 4.7, 13, 'USA', '2025-08-20'),
];

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelect = (name: string) => {
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const handleSort = () => {
    setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Sort rows based on name
  const sortedRows = [...rows].sort((a, b) =>
    order === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell />
            <TableCell>
              <TableSortLabel
                active
                direction={order}
                onClick={handleSort}
              >
                Dessert (100g serving)
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat&nbsp;(g)</TableCell>
            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
            <TableCell align="right">Protein&nbsp;(g)</TableCell>
            <TableCell align="right">Price&nbsp;($)</TableCell>
            <TableCell align="right">Category</TableCell>
            <TableCell align="right">Rating</TableCell>
            <TableCell align="right">Stock</TableCell>
            <TableCell align="right">Origin</TableCell>
            <TableCell align="right">Expiry</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row) => (
              <Row
                key={row.name + row.calories}
                row={row}
                selected={selected.includes(row.name)}
                onSelect={() => handleSelect(row.name)}
              />
            ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
}