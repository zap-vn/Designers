
import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, Search, Bell, Globe, User, LogIn, ChevronLeft, ChevronDown,
  FileText, FolderOpen, Save, UploadCloud, Download, Settings, Eye,
  PencilRuler, MonitorPlay, Check, LayoutTemplate, Sparkles, LogOut,
  CreditCard, HelpCircle
} from 'lucide-react';
import { ThemeState, HeaderLayout } from '../types';
import { ContainerDevWrapper } from './DevDocBanner';

interface HeaderProps {
  // Builder Props
  isBuilder?: boolean;
  projectName?: string;
  viewMode?: 'builder' | 'preview';
  onViewModeChange?: (mode: 'builder' | 'preview') => void;
  onOpenProject?: () => void;
  onImportFile?: () => void;
  onSaveVersion?: () => void;
  onExport?: () => void;
  onWorkspaceSettings?: () => void;
  onLogout?: () => void;
  // Role Props
  userRole?: 'admin' | 'merchant';
  setUserRole?: (role: 'admin' | 'merchant') => void;

  // Template/Preview Props
  title?: string;
  theme?: ThemeState;
  layout?: HeaderLayout;
  showSearch?: boolean;
  showNotifications?: boolean;
  showLanguage?: boolean;
  showLogin?: boolean;
  showUser?: boolean;
  showAction?: boolean;
  showProgress?: boolean;
  processName?: string;
  currentStep?: number;
  totalSteps?: number;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  disableSticky?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  isBuilder = false,
  projectName = "Untitled Project",
  viewMode = 'builder',
  onViewModeChange,
  onOpenProject,
  onImportFile,
  onSaveVersion,
  onExport,
  onWorkspaceSettings,
  onLogout,
  title = "ZAP",
  theme,
  layout = 'minimal',
  showSearch = false,
  showNotifications = false,
  showLanguage = true,
  showLogin = true,
  showUser = false,
  showProgress = false,
  processName = "Process",
  currentStep = 1,
  totalSteps = 4,
  rightAction,
  onBack,
  disableSticky = false,
  className = "",
  userRole = 'admin',
  setUserRole
}) => {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const projectMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        setIsProjectMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- BUILDER MODE HEADER ---
  if (isBuilder) {
    return (
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40 sticky top-0 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-purple-700 font-black text-2xl tracking-tight">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} fill="currentColor" />
            </div>
            ZAP
          </div>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {/* Project Menu */}
          <div className="relative" ref={projectMenuRef}>
            <button
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 transition-colors"
            >
              <span className="max-w-[150px] truncate">{projectName}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {isProjectMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-2 px-2 py-1.5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Project Actions</p>
                </div>
                <button onClick={() => { onOpenProject?.(); setIsProjectMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg flex items-center gap-2.5 transition-colors">
                  <FolderOpen size={16} /> Open Project...
                </button>
                <button onClick={() => { onImportFile?.(); setIsProjectMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg flex items-center gap-2.5 transition-colors">
                  <UploadCloud size={16} /> Import JSON...
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button onClick={() => { onSaveVersion?.(); setIsProjectMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg flex items-center gap-2.5 transition-colors">
                  <Save size={16} /> Save Version
                </button>
                <button onClick={() => { onExport?.(); setIsProjectMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg flex items-center gap-2.5 transition-colors">
                  <Download size={16} /> Export Studio...
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button onClick={() => { onWorkspaceSettings?.(); setIsProjectMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg flex items-center gap-2.5 transition-colors">
                  <Settings size={16} /> Workspace Settings
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button onClick={() => { onLogout?.(); setIsProjectMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition-colors">
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 ml-2">
            <button
              onClick={() => setUserRole?.('admin')}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${userRole === 'admin' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-400 hover:text-gray-600'}`}
              title="Switch to Admin Role"
            >
              Admin
            </button>
            <button
              onClick={() => setUserRole?.('merchant')}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${userRole === 'merchant' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-400 hover:text-gray-600'}`}
              title="Switch to Merchant Role"
            >
              Merchant
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {rightAction}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"></div>
        </div>
      </header>
    );
  }

  // --- TEMPLATE / PREVIEW MODE HEADER ---
  // Default theme fallback
  const safeTheme = theme || {
    primary: '#7E22CE',
    secondary: '#F3E8FF',
    lightText: '#FFFFFF',
    darkText: '#1C1C1E',
    grayText: '#8E8E93',
    background: '#FFFFFF',
    borderRadius: 16,
    fontFamily: 'Inter'
  };

  const isDark = false; // Could compute based on theme background

  const renderNavContent = () => {
    // Progress Header (Wizard)
    if (showProgress) {
      return (
        <>
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={20} style={{ color: safeTheme.darkText }} />
              </button>
            )}
            <h1 className="text-lg font-bold" style={{ color: safeTheme.darkText }}>{title}</h1>
          </div>

          <div className="flex-1 max-w-xl mx-auto flex flex-col items-center">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: safeTheme.grayText }}>{processName}</p>
            <div className="w-full flex items-center gap-2">
              <span className="text-xs font-bold whitespace-nowrap" style={{ color: safeTheme.primary }}>Step {currentStep}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentStep / totalSteps) * 100}%`,
                    backgroundColor: safeTheme.primary
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-400">of {totalSteps}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {rightAction || (
              <button className="text-sm font-semibold text-gray-500 hover:text-gray-900">Cancel</button>
            )}
          </div>
        </>
      );
    }

    // Standard Header Layouts
    return (
      <>
        {/* Left Side: Logo & Menu */}
        <div className={`flex items-center gap-4 ${layout === 'centered' ? 'flex-1' : ''} ${layout === 'search' ? 'shrink-0' : ''}`}>
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
              <ChevronLeft size={20} style={{ color: safeTheme.darkText }} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="font-black text-xl tracking-tight" style={{ color: safeTheme.darkText }}>
              {title}
            </div>
          </div>

          {/* Desktop Nav - If not centered or search heavy */}
          {layout === 'minimal' && (
            <nav className="hidden md:flex items-center gap-6 ml-6">
              {['Products', 'Solutions', 'Resources'].map(item => (
                <a key={item} href="#" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity" style={{ color: safeTheme.darkText }}>
                  {item}
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* Center: Search (if layout is search) OR Logo (if layout is centered) */}
        {layout === 'centered' && (
          <nav className="hidden md:flex items-center justify-center gap-8 flex-[2]">
            {['Products', 'Solutions', 'Pricing', 'Resources'].map(item => (
              <a key={item} href="#" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity" style={{ color: safeTheme.darkText }}>
                {item}
              </a>
            ))}
          </nav>
        )}

        {layout === 'search' && (
          <div className="flex-1 max-w-2xl px-8">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search for anything..."
                className="w-full bg-gray-100 border-transparent focus:bg-white border focus:border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm outline-none transition-all"
                style={{ borderRadius: `${safeTheme.borderRadius}px` }}
              />
            </div>
          </div>
        )}

        {/* Right Side: Actions */}
        <div className={`flex items-center justify-end gap-3 ${layout === 'centered' ? 'flex-1' : ''}`}>
          {showSearch && layout !== 'search' && (
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500">
              <Search size={20} />
            </button>
          )}

          {showNotifications && (
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          )}

          {showLanguage && (
            <button className="hidden md:flex items-center gap-1 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity" style={{ color: safeTheme.darkText }}>
              <Globe size={16} />
              <span>EN</span>
            </button>
          )}

          <div className="h-4 w-px bg-gray-200 mx-1 hidden md:block"></div>

          {showLogin && !showUser && (
            <button className="text-sm font-bold px-4 py-2 hover:bg-black/5 rounded-lg transition-colors" style={{ color: safeTheme.darkText }}>
              Log In
            </button>
          )}

          {(showUser || layout === 'user') && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 group outline-none"
              >
                <div
                  className="w-8 h-8 rounded-full overflow-hidden border group-hover:ring-2 group-hover:ring-offset-1 transition-all flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: safeTheme.secondary,
                    color: safeTheme.primary,
                    borderColor: `${safeTheme.primary}40`,
                    '--tw-ring-color': safeTheme.primary
                  } as React.CSSProperties}
                >
                  AD
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-bold text-gray-900">Alex Designer</p>
                    <p className="text-xs text-gray-500">alex@zap.design</p>
                  </div>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2.5 transition-colors">
                    <User size={16} /> Profile
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2.5 transition-colors">
                    <CreditCard size={16} /> Billing
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2.5 transition-colors">
                    <HelpCircle size={16} /> Support
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button
                    onClick={() => { onLogout?.(); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {rightAction}
        </div>
      </>
    );
  };

  return (
    <ContainerDevWrapper
      identity={{
        displayName: "GlobalHeader",
        filePath: "components/Header.tsx",
        type: "Organism/Section"
      }}
      className={`w-full z-30 ${disableSticky ? '' : 'sticky top-0'}`}
    >
      <header
        className={`w-full bg-white px-6 py-4 flex items-center justify-between transition-all border-b border-gray-100 ${className}`}
        style={{ fontFamily: safeTheme.fontFamily }}
      >
        {renderNavContent()}
      </header>
    </ContainerDevWrapper>
  );
};

export default Header;
