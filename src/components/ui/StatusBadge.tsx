import React from 'react';

type Status = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'upcoming' | 'available' | 'booked' | 'on-leave' | 'public' | 'private' | 'draft' | 'active' | 'inactive' | 'vip' | 'archived';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { label: string; classes: string; dot: string }> = {
  confirmed:  { label: 'Confirmed',  classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  pending:    { label: 'Pending',    classes: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',       dot: 'bg-amber-400' },
  cancelled:  { label: 'Cancelled',  classes: 'bg-red-500/15 text-red-400 border border-red-500/25',             dot: 'bg-red-400' },
  completed:  { label: 'Completed',  classes: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',          dot: 'bg-blue-400' },
  upcoming:   { label: 'Upcoming',   classes: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',    dot: 'bg-purple-400' },
  available:  { label: 'Available',  classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  booked:     { label: 'Booked',     classes: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',    dot: 'bg-orange-400' },
  'on-leave': { label: 'On Leave',   classes: 'bg-gray-500/15 text-gray-400 border border-gray-500/25',          dot: 'bg-gray-400' },
  public:     { label: 'Public',     classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  private:    { label: 'Private',    classes: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',       dot: 'bg-amber-400' },
  draft:      { label: 'Draft',      classes: 'bg-gray-500/15 text-gray-400 border border-gray-500/25',          dot: 'bg-gray-400' },
  active:     { label: 'Active',     classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  inactive:   { label: 'Inactive',   classes: 'bg-gray-500/15 text-gray-400 border border-gray-500/25',          dot: 'bg-gray-400' },
  vip:        { label: 'VIP',        classes: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',    dot: 'bg-yellow-400' },
  archived:   { label: 'Archived',   classes: 'bg-gray-500/15 text-gray-400 border border-gray-500/25',          dot: 'bg-gray-400' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig.draft;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.classes} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
