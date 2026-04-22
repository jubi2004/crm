import React, { useState } from 'react';
import {
  Box, Card, Typography, Button, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Grid,
  IconButton, Tooltip, Pagination, Skeleton, Chip, Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CheckCircle as DoneIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, createTask, updateTaskStatus, deleteTask, getLeads, getUsers } from '../api/services';
import { useAuth } from '../context/AuthContext';
import StatusChip from '../components/StatusChip';

const TASK_STATUSES = ['Pending', 'In Progress', 'Completed'];

function AddTaskDialog({ open, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '', lead: '', assignedTo: '', dueDate: '', status: 'Pending' });
  const [error, setError] = useState('');

  const { data: leadsData } = useQuery({ queryKey: ['leads-all'], queryFn: () => getLeads({ limit: 100 }).then((r) => r.data) });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => getUsers().then((r) => r.data) });

  const leads = leadsData?.leads || [];

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => { qc.invalidateQueries(['tasks']); onClose(); setForm({ title: '', description: '', lead: '', assignedTo: '', dueDate: '', status: 'Pending' }); },
    onError: (err) => setError(err.response?.data?.message || 'Error creating task'),
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.lead || !form.assignedTo) { setError('Title, lead, and assignee are required'); return; }
    const payload = { ...form };
    if (!payload.dueDate) delete payload.dueDate;
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Create Task</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Task Title *" name="title" value={form.title} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={2} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Lead *" name="lead" value={form.lead} onChange={handleChange}>
                <MenuItem value="">Select Lead</MenuItem>
                {leads.map((l) => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Assign To *" name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                <MenuItem value="">Select User</MenuItem>
                {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Status" name="status" value={form.status} onChange={handleChange}>
                {TASK_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function TasksPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', page],
    queryFn: () => getTasks({ page, limit: 10 }).then((r) => r.data),
    keepPreviousData: true,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateTaskStatus(id, status),
    onSuccess: () => qc.invalidateQueries(['tasks']),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => qc.invalidateQueries(['tasks']),
  });

  const tasks = data?.tasks || [];
  const totalPages = data?.totalPages || 1;

  const isAssigned = (task) => task.assignedTo?._id === user?._id;

  const handleMarkDone = (task) => {
    statusMutation.mutate({ id: task._id, status: 'Completed' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Tasks</Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.total ?? '—'} total tasks
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Create Task
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
        Only the assigned user can mark a task as complete.
      </Alert>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Lead</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1,2,3,4,5,6].map((j) => <TableCell key={j}><Skeleton /></TableCell>)}
                  </TableRow>
                ))
                : tasks.length === 0
                ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>No tasks yet</TableCell></TableRow>
                : tasks.map((task) => {
                  const canUpdateStatus = isAssigned(task);
                  const isPending = task.status !== 'Completed';
                  return (
                    <TableRow key={task._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{task.title}</Typography>
                        {task.description && (
                          <Typography variant="caption" color="text.secondary">{task.description}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.lead
                          ? <Chip label={task.lead.name} size="small" variant="outlined" />
                          : '—'
                        }
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip
                            label={task.assignedTo?.name || '—'}
                            size="small"
                            sx={canUpdateStatus ? { bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 600, border: 'none' } : {}}
                            variant={canUpdateStatus ? 'filled' : 'outlined'}
                          />
                          {canUpdateStatus && (
                            <Typography variant="caption" color="primary" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>
                              You
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell><StatusChip status={task.status} /></TableCell>
                      <TableCell align="right">
                        {canUpdateStatus && isPending && (
                          <Tooltip title="Mark as Completed">
                            <IconButton
                              size="small"
                              onClick={() => handleMarkDone(task)}
                              sx={{ color: 'success.main' }}
                              disabled={statusMutation.isPending}
                            >
                              <DoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={canUpdateStatus || !isPending ? 'Delete' : 'Only assigned user can act'}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => { if (window.confirm('Delete this task?')) deleteMutation.mutate(task._id); }}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="secondary" shape="rounded" />
          </Box>
        )}
      </Card>

      <AddTaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
