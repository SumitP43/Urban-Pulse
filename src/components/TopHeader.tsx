import React, { useState } from 'react';
import { Investigation, NavigationPath } from '../types';

interface TopHeaderProps {
  activeInvestigation: Investigation;
  onOpenSearch: () => void;
  onOpenExport: () => void;
  onJumpToWorkspace: () => void;
  onNavigate?: (path: NavigationPath) => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeInvestigation,
  onOpenSearch,
  onOpenExport,
  onJumpToWorkspace,
  onNavigate,
  isPaused,
  onTogglePause
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Evidence Strength: HIGH',
      desc: 'Finding #01 validated against CAG empirical audits with 96.8% confidence score.',
      time: '2 mins ago',
      unread: true
    },
    {
      id: 2,
      title: 'New Spatial Layer Indexed',
      desc: 'Delhi Ward Demographics GeoJSON (272 Wards) normalized by Data Ingestion Agent.',
      time: '14 mins ago',
      unread: true
    },
    {
      id: 3,
      title: 'Regression Correlation Peak',
      desc: 'Pearson r = +0.812 calculated between Route #543 delays and grievance density.',
      time: '32 mins ago',
      unread: false
    }
  ];

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface-card/95 backdrop-blur-md border-b border-border-subtle z-40 px-space-lg flex items-center justify-between">
      {/* Left: Active Investigation & Agent Status */}
      <div className="flex items-center gap-space-md min-w-0 flex-1">
        <div 
          className="flex items-center gap-2 text-text-muted font-body-compact text-body-compact truncate cursor-pointer hover:text-dark-surface transition-colors"
          onClick={onJumpToWorkspace}
          title="Click to view Research Workspace"
        >
          <span className="font-label-code text-label-code uppercase tracking-wider text-primary font-semibold shrink-0">
            ACTIVE INVESTIGATION:
          </span>
          <span className="text-dark-surface font-medium truncate">
            {activeInvestigation.title}
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary-fixed/30 border border-secondary-fixed text-on-secondary-fixed-variant shrink-0">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPaused ? 'bg-tertiary' : 'bg-secondary'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-tertiary' : 'bg-secondary'}`}></span>
          </span>
          <span className="font-citation-ref text-citation-ref uppercase font-bold tracking-wider">
            {isPaused ? 'Agents Suspended' : 'Autonomous Agents Active'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-sm shrink-0">
        {/* Search / Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-space-sm bg-surface-canvas border border-border-subtle text-text-muted hover:text-dark-surface hover:border-border-strong px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">search</span>
          <span className="font-body-compact text-body-compact pr-2 hidden sm:inline">
            Search evidence & citations...
          </span>
          <kbd className="font-label-code text-label-code bg-surface-card border border-border-subtle px-1.5 py-0.5 rounded text-text-body shadow-xs">
            ⌘K
          </kbd>
        </button>

        <div className="h-5 w-px bg-border-subtle mx-1"></div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-text-muted hover:text-dark-surface hover:bg-surface-canvas rounded-lg transition-colors cursor-pointer"
            title="Investigation Alerts"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical-red rounded-full ring-2 ring-surface-card"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-card rounded-xl shadow-xl border border-border-subtle overflow-hidden z-50">
              <div className="p-3 bg-surface-canvas border-b border-border-subtle flex items-center justify-between">
                <span className="font-body-compact text-body-compact font-bold text-dark-surface">
                  Investigation Telemetry & Alerts
                </span>
                <span className="font-citation-ref text-citation-ref text-primary font-semibold">
                  2 UNREAD
                </span>
              </div>
              <div className="divide-y divide-border-subtle max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 hover:bg-surface-canvas transition-colors ${n.unread ? 'bg-brand-tint/30' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-body-compact font-semibold text-dark-surface text-xs">{n.title}</span>
                      <span className="font-citation-ref text-[10px] text-text-muted">{n.time}</span>
                    </div>
                    <p className="font-body-compact text-xs text-text-muted mt-1 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-surface-canvas border-t border-border-subtle flex flex-col gap-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    if (onNavigate) onNavigate('alert-center');
                  }}
                  className="font-citation-ref text-xs text-critical-red font-bold hover:underline flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">emergency</span>
                  <span>Open Civic Alert Center (Live 311) →</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    onJumpToWorkspace();
                  }}
                  className="font-citation-ref text-[11px] text-primary hover:underline"
                >
                  View Active Agent Stream →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border-subtle rounded-lg text-text-body hover:bg-surface-canvas font-body-compact text-body-compact font-medium transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">ios_share</span>
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
