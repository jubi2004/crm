import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton,
} from '@mui/material';
import {
  People as LeadsIcon,
  Star as QualifiedIcon,
  Today as TodayIcon,
  CheckCircle as DoneIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/services';
import { useAuth } from '../context/AuthContext';

const STAT_CARDS = [
  {
    key: 'totalLeads',
    label: 'Total Leads',
    icon: LeadsIcon,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    iconBg: 'rgba(255,255,255,0.12)',
  },
  {
    key: 'qualifiedLeads',
    label: 'Qualified Leads',
    icon: QualifiedIcon,
    gradient: 'linear-gradient(135deg, #e94560 0%, #c73652 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
  },
  {
    key: 'tasksDueToday',
    label: 'Tasks Due Today',
    icon: TodayIcon,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
  },
  {
    key: 'completedTasks',
    label: 'Completed Tasks',
    icon: DoneIcon,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
  },
];

function StatCard({ card, value, loading }) {
  const Icon = card.icon;
  return (
    <Card
      sx={{
        background: card.gradient,
        color: '#fff',
        borderRadius: 3,
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* decorative circle */}
      <Box sx={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
              {card.label}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={60} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            ) : (
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                {value ?? 0}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2,
            backgroundColor: card.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 24, color: '#fff' }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats().then((r) => r.data),
    refetchInterval: 30000,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </Typography>
        <Typography color="text.secondary">
          Here's what's happening in your CRM today.
        </Typography>
      </Box>

      {/* Stats grid */}
      <Grid container spacing={3}>
        {STAT_CARDS.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.key}>
            <StatCard card={card} value={stats?.[card.key]} loading={isLoading} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
