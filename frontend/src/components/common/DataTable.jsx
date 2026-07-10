import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Paper,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

/**
 * columns: [{ key, label, render?(row), align? }]
 */
export default function DataTable({
  columns,
  rows,
  loading,
  page,
  size,
  totalItems,
  onPageChange,
  onSizeChange,
  onRowClick,
  emptyText = "Không có dữ liệu",
}) {
  return (
    <Paper variant="outlined" sx={{ borderColor: "divider" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align || "left"}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, border: 0 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, border: 0 }}>
                  <Box sx={{ color: "text.secondary" }}>
                    <InboxOutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2">{emptyText}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={row.id ?? idx}
                  hover={!!onRowClick}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align || "left"}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {onPageChange && (
        <TablePagination
          component="div"
          count={totalItems || 0}
          page={Math.max((page || 1) - 1, 0)}
          onPageChange={(e, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={size || 10}
          onRowsPerPageChange={(e) => onSizeChange?.(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Số dòng/trang"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} trên ${count}`}
        />
      )}
    </Paper>
  );
}
