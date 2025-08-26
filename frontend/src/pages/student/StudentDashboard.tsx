import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

type Row = { id: string; timestamp: string; courseId: string; status: string };

export default function StudentDashboard() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch('/api/student/attendance', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setRows);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        My Attendance
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.timestamp).toLocaleString()}</TableCell>
                <TableCell>{r.courseId}</TableCell>
                <TableCell>{r.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
