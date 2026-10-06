import React from 'react';

export type DataOriginType = 'LIVE' | 'SEED' | 'DERIVED' | 'PREDICTED' | 'FALLBACK';

interface DataOriginBadgeProps {
  origin?: DataOriginType | string;
  compact?: boolean;
  className?: string;
  showIcon?: boolean;
}

export const DataOriginBadge: React.FC<DataOriginBadgeProps> = ({
  origin = 'SEED',
  compact = false,
  className = '',
  showIcon = true,
}) => {
  const normalized = (origin?.toUpperCase() || 'SEED') as DataOriginType;

  // Configuration for canonical backend origins
  const config = (() => {
    switch (normalized) {
      case 'LIVE':
        return {
          label: 'Live data',
          icon: 'sensors',
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-500/30 dark:border-emerald-500/40',
          dot: 'bg-emerald-500 animate-pulse',
          description: 'Observed measurement from real-time monitoring sensors or meteorological feed',
        };
      case 'DERIVED':
        return {
          label: 'Derived data',
          icon: 'insights',
          bg: 'bg-sky-500/10 dark:bg-sky-500/20',
          text: 'text-sky-700 dark:text-sky-400',
          border: 'border-sky-500/30 dark:border-sky-500/40',
          dot: 'bg-sky-500',
          description: 'Calculated metric synthesized from multiple telemetry layers (e.g., CPCB NAQI or heat index)',
        };
      case 'PREDICTED':
        return {
          label: 'AI prediction',
          icon: 'psychology',
          bg: 'bg-purple-500/10 dark:bg-purple-500/20',
          text: 'text-purple-700 dark:text-purple-400',
          border: 'border-purple-500/30 dark:border-purple-500/40',
          dot: 'bg-purple-500',
          description: 'Projected forecast or deterministic baseline physics model',
        };
      case 'FALLBACK':
        return {
          label: 'Fallback data',
          icon: 'cloud_off',
          bg: 'bg-amber-500/10 dark:bg-amber-500/20',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-500/30 dark:border-amber-500/40',
          dot: 'bg-amber-500',
          description: 'Degraded baseline fallback used due to external API timeout or keyless mode',
        };
      case 'SEED':
      default:
        return {
          label: 'Sample / seed data',
          icon: 'database',
          bg: 'bg-slate-500/10 dark:bg-slate-500/20',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-500/30 dark:border-slate-500/40',
          dot: 'bg-slate-400',
          description: 'Statutory sample archive or seed baseline dataset',
        };
    }
  })();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bg} ${config.text} ${config.border} ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
      title={config.description}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showIcon && !compact && (
        <span className="material-symbols-outlined text-[13px]">{config.icon}</span>
      )}
      <span>{config.label}</span>
    </span>
  );
};
