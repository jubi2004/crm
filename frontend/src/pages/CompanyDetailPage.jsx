import React from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, IconButton, Skeleton,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompany } from '../api/services';
import StatusChip from '../components/StatusChip';

function InfoRow({ label, value }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>{value || '—'}</Typography>
    </Box>
  );
}

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompany(id).then((r) => r.data),
  });

  const company = data?.company;
  const leads = data?.leads || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/companies')} size="small">
          <BackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={800}>
          {isLoading ? <Skeleton width={200} /> : company?.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Company info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', fontSize: '0.72rem' }}>
                Company Info
              </Typography>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} sx={{ mb: 1 }} height={40} />)
              ) : (
                <>
                  <InfoRow label="Industry" value={company?.industry} />
                  <InfoRow label="Location" value={company?.location} />
                  <InfoRow label="Website" value={company?.website} />
                  <InfoRow label="Phone" value={company?.phone} />
                  <InfoRow label="Email" value={company?.email} />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Associated leads */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography fontWeight={700}>Associated Leads</Typography>
              <Chip label={`${leads.length} leads`} size="small" variant="outlined" />
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned To</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {[1,2,3,4].map((j) => <TableCell key={j}><Skeleton /></TableCell>)}
                      </TableRow>
                    ))
                    : leads.length === 0
                    ? <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5, color: 'text.secondary' }}>No leads for this company</TableCell></TableRow>
                    : leads.map((lead) => (
                      <TableRow key={lead._id} hover>
                        <TableCell><Typography variant="body2" fontWeight={600}>{lead.name}</Typography></TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{lead.email}</Typography></TableCell>
                        <TableCell><StatusChip status={lead.status} /></TableCell>
                        <TableCell>
                          {lead.assignedTo
                            ? <Chip label={lead.assignedTo.name} size="small" variant="outlined" />
                            : <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
