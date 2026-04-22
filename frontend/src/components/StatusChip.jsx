import React from 'react';
import { Chip } from '@mui/material';

const STATUS_COLORS = {
  // Lead statuses
  New: { bg: '#dbeafe', color: '#1d4ed8' },
  Contacted: { bg: '#fef9c3', color: '#a16207' },
  Qualified: { bg: '#dcfce7', color: '#15803d' },
  Lost: { bg: '#fee2e2', color: '#b91c1c' },
  Won: { bg: '#d1fae5', color: '#065f46' },
  // Task statuses
  Pending: { bg: '#fef9c3', color: '#a16207' },
  'In Progress': { bg: '#dbeafe', color: '#1d4ed8' },
  Completed: { bg: '#dcfce7', color: '#15803d' },
};

export default function StatusChip({ status }) {
  const colors = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: '0.72rem',
        border: 'none',
      }}
    />
  );
}
