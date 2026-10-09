import React, { useState } from 'react';
import { NavigationPath } from '../types';
import { ASSETS } from '../data/mockData';

interface SidebarProps {
  currentPath: NavigationPath;
  onNavigate: (path: NavigationPath) => void;
  onOpenNewResearch: () => void;
  currentWorkspace: string;
  onSelectWorkspace: (workspace: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const WORKSPACES = [
  'Delhi Urban Lab Workspace',
  'Mumbai Metropolitan Recon',
  'Bengaluru Urban Governance Lab',
  'Chennai Transport Matrix'
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  onOpenNewResearch,
  currentWorkspace,
  onSelectWorkspace,
  isDark,
  onToggleDark
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const overviewNav: { path: NavigationPath; label: string; icon: string; badge?: { text: string; bg: string; color: string } }[] = [
    { path: 'overview-dashboard', label: 'Overview Dashboard', icon: 'dashboard' },
  ];

  const researchNav: { path: NavigationPath; label: string; icon: string; badge?: { text: string; bg: string; color: string } }[] = [
    { 
      path: 'research-workspace', 
      label: 'Research Workspace', 
      icon: 'science', 
      badge: { text: 'LIVE', bg: 'bg-secondary-container', color: 'text-on-secondary-container' } 
    },
    { 
      path: 'discoveries-and-findings', 
      label: 'Discovered Findings', 
      icon: 'lightbulb', 
      badge: { text: '8', bg: 'bg-surface-container-high', color: 'text-primary' } 
    },
    { path: 'cross-source-analysis', label: 'Cross-Source Analysis', icon: 'account_tree' },
    { 
      path: 'web-intelligence', 
      label: 'Web Intelligence', 
      icon: 'travel_explore', 
      badge: { text: 'WEB SEARCH', bg: 'bg-brand-tint border border-primary/20', color: 'text-primary' } 
    },
  ];

  const monitorNav: { path: NavigationPath; label: string; icon: string; badge?: { text: string; bg: string; color: string } }[] = [
    { 
      path: 'alert-center', 
      label: 'Civic Alert Center', 
      icon: 'emergency', 
      badge: { text: 'LIVE 311', bg: 'bg-red-500/10 border border-red-500/20', color: 'text-critical-red' } 
    },
  ];

  const libraryNav: { path: NavigationPath; label: string; icon: string; badge?: { text: string; bg: string; color: string } }[] = [
    { path: 'sources-and-datasets', label: 'Sources & Datasets', icon: 'database' },
    { path: 'research-reports', label: 'Reports', icon: 'description' },
  ];

  const systemNav: { path: NavigationPath; label: string; icon: string }[] = [
    { path: 'settings', label: 'Settings', icon: 'settings' },
    { path: 'documentation', label: 'Help & Guided Tour', icon: 'menu_book' }
  ];

  type NavItem = { path: NavigationPath; label: string; icon: string; badge?: { text: string; bg: string; color: string } };

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      <div className="font-micro-meta text-micro-meta text-text-muted uppercase tracking-wider px-2 py-1 font-bold">
        {title}
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors font-body-medium text-body-medium ${
                isActive
                  ? 'bg-brand-tint text-primary font-semibold'
                  : 'text-text-body hover:bg-surface-canvas hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`material-symbols-outlined text-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`font-citation-ref text-citation-ref px-1.5 py-0.5 rounded font-bold shrink-0 ${item.badge.bg} ${item.badge.color}`}>
                  {item.badge.text}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-card border-r border-border-subtle z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div 
          className="p-space-md border-b border-border-subtle flex items-center gap-space-sm cursor-pointer hover:bg-surface-canvas/50 transition-colors"
          onClick={() => onNavigate('overview-dashboard')}
        >
          <img 
            alt="UrbanResearch AI Geometric Logo" 
            className="h-8 w-auto object-contain" 
            src={ASSETS.logo} 
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-dark-surface tracking-tight leading-none">
              UrbanResearch AI
            </span>
            <span className="font-micro-meta text-micro-meta text-text-muted uppercase tracking-wider mt-1">
              Autonomous Urban Discovery
            </span>
          </div>
        </div>

        {/* Start New Research CTA */}
        <div className="p-space-md pb-space-sm">
          <button
            type="button"
            onClick={onOpenNewResearch}
            className="w-full flex items-center justify-center gap-space-sm bg-primary-container hover:bg-brand-hover text-on-primary py-2.5 px-space-md rounded-lg font-body-medium text-body-medium shadow-sm transition-colors cursor-pointer active:translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Start New Research</span>
          </button>
        </div>

        {/* Scrollable Navigation Area - Target Grouping */}
        <div className="flex-1 overflow-y-auto px-space-md py-space-xs space-y-space-md">
          {renderNavGroup('OVERVIEW', overviewNav)}
          {renderNavGroup('RESEARCH', researchNav)}
          {renderNavGroup('MONITOR', monitorNav)}
          {renderNavGroup('LIBRARY', libraryNav)}
          {renderNavGroup('SYSTEM', systemNav)}
        </div>
      </div>

      {/* Footer Area: Workspace & User Profile */}
      <div className="p-space-md border-t border-border-subtle bg-surface-canvas/50 space-y-space-sm relative">
        {/* Workspace Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-surface-card border border-border-subtle hover:border-border-strong transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="font-body-compact text-body-compact font-medium text-dark-surface truncate">
                {currentWorkspace}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-text-muted shrink-0">unfold_more</span>
          </button>

          {showWorkspaceMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface-card border border-border-subtle rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-2 py-1.5 text-micro-meta text-text-muted font-bold uppercase tracking-wider bg-surface-canvas border-b border-border-subtle">
                Switch Urban Lab Workspace
              </div>
              {WORKSPACES.map((ws) => (
                <button
                  key={ws}
                  type="button"
                  onClick={() => {
                    onSelectWorkspace(ws);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-body-compact transition-colors flex items-center justify-between ${
                    currentWorkspace === ws ? 'bg-brand-tint text-primary font-semibold' : 'text-dark-surface hover:bg-surface-canvas'
                  }`}
                >
                  <span className="truncate">{ws}</span>
                  {currentWorkspace === ws && (
                    <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Card & Dark Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover border border-border-subtle flex-shrink-0" 
              src={ASSETS.avatar} 
            />
            <div className="min-w-0">
              <div className="font-body-compact text-body-compact font-semibold text-dark-surface truncate">
                Dr. Rajesh Varma
              </div>
              <div className="font-micro-meta text-micro-meta text-text-muted truncate">
                Sr. Urban Policy Fellow
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleDark}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 text-text-muted hover:text-dark-surface hover:bg-surface-card rounded-lg border border-transparent hover:border-border-subtle transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDark ? 'light_mode' : 'contrast'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
