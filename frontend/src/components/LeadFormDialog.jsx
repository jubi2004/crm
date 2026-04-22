import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem, CircularProgress, Alert,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createLead, updateLead, getUsers, getCompanies } from '../api/services';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost', 'Won'];

const EMPTY = { name: '', email: '', phone: '', status: 'New', assignedTo: '', company: '' };

export default function LeadFormDialog({ open, onClose, lead }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'New',
        assignedTo: lead.assignedTo?._id || '',
        company: lead.company?._id || '',
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [lead, open]);

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => getUsers().then((r) => r.data) });
  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: () => getCompanies().then((r) => r.data) });

  const mutation = useMutation({
    mutationFn: (data) => lead ? updateLead(lead._id, data) : createLead(data),
    onSuccess: () => {
      qc.invalidateQueries(['leads']);
      onClose();
    },
    onError: (err) => setError(err.response?.data?.message || 'An error occurred'),
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    const payload = { ...form };
    if (!payload.assignedTo) delete payload.assignedTo;
    if (!payload.company) delete payload.company;
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 1 }}>
        {lead ? 'Edit Lead' : 'Add New Lead'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name *" name="name" value={form.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email Address *" name="email" type="email" value={form.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Status" name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                <MenuItem value="">— None —</MenuItem>
                {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Company" name="company" value={form.company} onChange={handleChange}>
                <MenuItem value="">— None —</MenuItem>
                {companies.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={mutation.isPending}>
            {mutation.isPending ? <CircularProgress size={18} color="inherit" /> : (lead ? 'Save Changes' : 'Add Lead')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
