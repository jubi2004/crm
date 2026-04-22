import React, { useState } from 'react';
import {
  Box, Card, Typography, Button, TextField, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, IconButton, Tooltip, Pagination,
  InputAdornment, Skeleton, Chip,
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeads, deleteLead } from '../api/services';
import StatusChip from '../components/StatusChip';
import LeadFormDialog from '../components/LeadFormDialog';

const STATUSES = ['', 'New', 'Contacted', 'Qualified', 'Lost', 'Won'];

export default function LeadsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', page, search, status],
    queryFn: () => getLeads({ page, limit: 10, search, status }).then((r) => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => qc.invalidateQueries(['leads']),
  });

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStatusChange = (e) => { setStatus(e.target.value); setPage(1); };

  const handleEdit = (lead) => { setEditLead(lead); setDialogOpen(true); };
  const handleAdd = () => { setEditLead(null); setDialogOpen(true); };
  const handleDelete = (id) => { if (window.confirm('Soft delete this lead?')) deleteMutation.mutate(id); };

  const leads = data?.leads || [];
  const totalPages = data?.totalPages || 1;

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Leads</Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.total ?? '—'} total leads
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Lead
        </Button>
      </Box>

      <Card>
        {/* Filters */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            placeholder="Search name or email…"
            value={search}
            onChange={handleSearchChange}
            sx={{ minWidth: 240 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
            }}
          />
          <TextField
            select
            value={status}
            onChange={handleStatusChange}
            sx={{ minWidth: 150 }}
            SelectProps={{ displayEmpty: true }}
          >
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s || 'All Statuses'}</MenuItem>
            ))}
          </TextField>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Company</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : leads.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No leads found
                    </TableCell>
                  </TableRow>
                )
                : leads.map((lead) => (
                  <TableRow key={lead._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{lead.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{lead.email}</Typography>
                    </TableCell>
                    <TableCell><StatusChip status={lead.status} /></TableCell>
                    <TableCell>
                      {lead.assignedTo
                        ? <Chip label={lead.assignedTo.name} size="small" variant="outlined" />
                        : <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                      }
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {lead.company?.name || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(lead)} sx={{ color: 'text.secondary' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(lead._id)}
                          sx={{ color: 'error.main', ml: 0.5 }}
                          disabled={deleteMutation.isPending}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="secondary"
              shape="rounded"
            />
          </Box>
        )}
      </Card>

      <LeadFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        lead={editLead}
      />
    </Box>
  );
}
