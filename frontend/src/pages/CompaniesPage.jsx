import React, { useState } from 'react';
import {
  Box, Card, Typography, Button, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Skeleton,
  Chip, IconButton, Tooltip,
} from '@mui/material';
import { Add as AddIcon, OpenInNew as ViewIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getCompanies, createCompany } from '../api/services';

function AddCompanyDialog({ open, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', industry: '', location: '', website: '', phone: '', email: '' });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => { qc.invalidateQueries(['companies']); onClose(); setForm({ name: '', industry: '', location: '', website: '', phone: '', email: '' }); },
    onError: (err) => setError(err.response?.data?.message || 'Error'),
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) { setError('Company name is required'); return; }
    mutation.mutate(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Add Company</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>}
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Company Name *" name="name" value={form.name} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Industry" name="industry" value={form.industry} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Location" name="location" value={form.location} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Website" name="website" value={form.website} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Add Company'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies().then((r) => r.data),
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Companies</Typography>
          <Typography variant="body2" color="text.secondary">{companies.length} companies</Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Company
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company Name</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                  </TableRow>
                ))
                : companies.length === 0
                ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No companies yet</TableCell></TableRow>
                : companies.map((c) => (
                  <TableRow key={c._id} hover>
                    <TableCell><Typography fontWeight={600} variant="body2">{c.name}</Typography></TableCell>
                    <TableCell>{c.industry ? <Chip label={c.industry} size="small" variant="outlined" /> : '—'}</TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{c.location || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{c.email || '—'}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => navigate(`/companies/${c._id}`)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <AddCompanyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
