
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    LayoutGrid, LayoutTemplate, Save, CheckCircle, XCircle, AlertTriangle,
    ExternalLink, X, FileText, RotateCcw, Trash2, Palette, Type,
    MousePointerClick, Sparkles, ClipboardList, Map, ArrowLeft, FilePlus,
    ChevronLeft, ChevronRight, ChevronDown, BookOpen, RefreshCw, Folder,
    Briefcase, Plus, Search, Sun, Moon
} from 'lucide-react';
import Header from './Header';
import LoginScreen from './LoginScreen';
import SetupPage from './SetupPage';
import UiKitSection, { UiKitInspector } from './UiKitSection';
import { ContainerDevWrapper } from './DevDocBanner';
import FormsSection from './FormsSection';
import IconsSection from './IconsSection';
import TemplateSection from './TemplateSection';
import TemplateInspector from './TemplateInspector';
import DocsSection from './DocsSection';
import DocsInspector from './DocsInspector';
import SiteMapSection from './SiteMapSection';
import LivePreview from './LivePreview';
import { ProjectConfig, ThemeState, Tab, ProjectFile, DocPage, IconEntry, TemplateConfig } from '../types';
import { ExportModal } from './ExportModal';
import { standardUiKitData } from './standardUiKit';
import { STATIC_SITE_NODES, SiteNode } from './appRegistry';
import { STORAGE_KEYS } from '../constants/storage';
import {
    getMerchantOverviewBlocks,
    getColorsPageBlocks,
    getTypographyPageBlocks,
    getButtonsPageBlocks,
    getIconsPageBlocks
} from './docHelpers';

// ... constants and types ...
type ViewMode = 'builder' | 'preview';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    action?: { label: string; onClick: () => void };
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    active?: boolean;
    onClick?: () => void;
    children?: NavItem[];
    action?: React.ReactNode;
}


const DEFAULT_THEME: ThemeState = {
    primary: '#7E22CE',
    secondary: '#F3E8FF',
    lightText: '#FFFFFF',
    darkText: '#1C1C1E',
    grayText: '#8E8E93',
    background: '#FFFFFF',
    background2: '#F9FAFB',
    background3: '#F3F4F6',
    primaryBtnText: '#FFFFFF',
    secondaryBtnText: '#1C1C1E',
    tertiaryBtnText: '#7E22CE',
    fontFamily: 'Inter',
    borderRadius: 12,
    btnPaddingX: 24,
    btnPaddingY: 12,
    buttonStyle: 'flat',
    fillMode: 'solid',
    gradientAngle: 135,
    depth: 1,
    iconGap: 8,
    buttonHoverOpacity: 90,

    // Form Defaults
    inputBg: '#FFFFFF',
    inputFilledBg: '#F3F4F6',
    inputBorder: '#E5E7EB',
    inputPaddingX: 16,
    inputPaddingY: 12,
    activeColor: '#7E22CE',
    hoverOpacity: 10,

    formLabelStyle: 'top',
    formVariant: 'outlined',
    formDensity: 'comfortable',
    formPlaceholderColor: '#9CA3AF',
    formTextColor: '#1C1C1E',
    formLabelColor: '#374151',
    formErrorColor: '#EF4444',
    formRingWidth: 4,
    formSimulateData: false
};

const DEFAULT_CONFIG: ProjectConfig = {
    merchantName: '',
    projectName: '',
    businessType: '',
    timezone: '',
    language: '',
    country: '',
    dateFormat: '',
    timeFormat: '',
    generatedContent: standardUiKitData
};

const App: React.FC = () => {
    // --- State ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('ui-kit');
    const [viewMode, setViewMode] = useState<ViewMode>('builder');
    const [activeTemplateSection, setActiveTemplateSection] = useState('Data Lists & Tables');

    const [projectConfig, setProjectConfig] = useState<ProjectConfig>(DEFAULT_CONFIG);
    const [themeState, setThemeState] = useState<ThemeState>(DEFAULT_THEME);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [history, setHistory] = useState<ProjectFile[]>([]);
    const [isBrowserOpen, setIsBrowserOpen] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const [docPages, setDocPages] = useState<DocPage[]>([]);
    const [activeDocPageId, setActiveDocPageId] = useState<string | null>(null);

    const [showClassNames, setShowClassNames] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isExplorerOpen, setIsExplorerOpen] = useState(true);
    const [isInspectorOpen, setIsInspectorOpen] = useState(true);

    const [activeUiKitCategory, setActiveUiKitCategory] = useState('Brand Colors');
    const [selectedSiteNode, setSelectedSiteNode] = useState<SiteNode | null>(null);
    const [currentIcons, setCurrentIcons] = useState<IconEntry[]>([]);

    // Track selected icon for Inspector
    const [selectedIcon, setSelectedIcon] = useState<IconEntry | null>(null);

    // Navigation State
    const [expandedNavItems, setExpandedNavItems] = useState<string[]>(['design-system', 'docs']);
    const [navSearchTerm, setNavSearchTerm] = useState('');

    const [isExportOpen, setIsExportOpen] = useState(false);

    const importFileRef = useRef<HTMLInputElement>(null);

    // Load History on Mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.HISTORY_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }
    }, []);

    useEffect(() => {
        if (projectConfig.generatedContent?.icons) {
            setCurrentIcons(projectConfig.generatedContent.icons);
            // Default select the first icon if none selected
            if (!selectedIcon && projectConfig.generatedContent.icons.length > 0) {
                setSelectedIcon(projectConfig.generatedContent.icons[0]);
            }
        }
    }, [projectConfig.generatedContent]);

    // --- Helpers ---
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', action?: { label: string; onClick: () => void }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, type, message, action }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const saveToHistory = (manual: boolean = false) => {
        const newFile: ProjectFile = {
            id: Date.now().toString(),
            name: projectConfig.projectName || 'Untitled Project',
            timestamp: new Date().toISOString(),
            config: { ...projectConfig, generatedContent: { ...projectConfig.generatedContent!, icons: currentIcons } },
            theme: themeState,
            docs: docPages
        };

        const newHistory = [newFile, ...history].slice(0, 20); // Keep last 20
        setHistory(newHistory);
        localStorage.setItem(STORAGE_KEYS.HISTORY_KEY, JSON.stringify(newHistory));
        setHasUnsavedChanges(false);

        if (manual) showToast('Version saved successfully', 'success');
    };

    const loadVersion = (file: ProjectFile) => {
        setProjectConfig(file.config);
        setThemeState(file.theme);
        if (file.docs) setDocPages(file.docs);
        if (file.config.generatedContent?.icons) setCurrentIcons(file.config.generatedContent.icons);
        setIsBrowserOpen(false);
        showToast(`Loaded version: ${file.name}`, 'success');
    };

    const deleteVersion = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newHistory = history.filter(h => h.id !== id);
        setHistory(newHistory);
        localStorage.setItem(STORAGE_KEYS.HISTORY_KEY, JSON.stringify(newHistory));
    };

    const handleImportClick = () => importFileRef.current?.click();

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const content = ev.target?.result as string;
                const parsed = JSON.parse(content) as ProjectFile;
                if (parsed.config && parsed.theme) {
                    loadVersion(parsed);
                }
            } catch (err) {
                showToast('Invalid project file', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleCurrentExport = () => {
        const file: ProjectFile = {
            id: Date.now().toString(),
            name: projectConfig.projectName,
            timestamp: new Date().toISOString(),
            config: projectConfig,
            theme: themeState,
            docs: docPages
        };
        const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectConfig.projectName.toLowerCase().replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Project exported', 'success');
    };

    // --- Specific Handlers ---
    const handleSetupComplete = (config: ProjectConfig) => {
        setProjectConfig(config);

        // 1. APPLY EXTRACTED THEME TO STATE
        // If AI returned colors, update the active theme state immediately
        let activeTheme = { ...themeState };
        if (config.generatedContent?.colors) {
            const aiColors = config.generatedContent.colors;
            activeTheme = {
                ...activeTheme,
                primary: aiColors.primary,
                secondary: aiColors.secondary,
                background: aiColors.background,
                darkText: aiColors.text,
                primaryBtnText: '#FFFFFF', // Fallback or could be calculated
                // Propagate to other tokens
                activeColor: aiColors.primary,
                tertiaryBtnText: aiColors.primary
            };

            if (config.generatedContent.typography?.fontFamily) {
                activeTheme.fontFamily = config.generatedContent.typography.fontFamily;
            }

            setThemeState(activeTheme);
        }

        // 2. GENERATE STANDARD DOCUMENTATION PAGES
        const overviewPage: DocPage = {
            id: 'overview',
            title: 'Overview',
            lastModified: Date.now(),
            blocks: getMerchantOverviewBlocks(config, activeTheme, config.generatedContent?.icons || [])
        };

        const colorsPage: DocPage = {
            id: 'colors',
            title: 'Colors',
            lastModified: Date.now(),
            blocks: getColorsPageBlocks(activeTheme)
        };

        const typographyPage: DocPage = {
            id: 'typography',
            title: 'Typography',
            lastModified: Date.now(),
            blocks: getTypographyPageBlocks(config, activeTheme)
        };

        const buttonsPage: DocPage = {
            id: 'buttons',
            title: 'Buttons',
            lastModified: Date.now(),
            blocks: getButtonsPageBlocks(activeTheme)
        };

        const iconsPage: DocPage = {
            id: 'icons',
            title: 'Icons',
            lastModified: Date.now(),
            blocks: getIconsPageBlocks(config.generatedContent?.icons || [])
        };

        setDocPages([overviewPage, colorsPage, typographyPage, buttonsPage, iconsPage]);
        setActiveDocPageId('overview');

        setIsSetupComplete(true);
        setHasUnsavedChanges(true);
    };

    const handleSetupImport = (file: ProjectFile) => {
        loadVersion(file);
        setIsSetupComplete(true);
    };

    const handleThemeUpdate = (newTheme: ThemeState) => {
        setThemeState(newTheme);

        // Keep projectConfig.generatedContent.colors in sync for exports/history
        if (projectConfig.generatedContent) {
            setProjectConfig(prev => ({
                ...prev,
                generatedContent: {
                    ...prev.generatedContent!,
                    colors: {
                        ...prev.generatedContent!.colors,
                        primary: newTheme.primary,
                        secondary: newTheme.secondary,
                        background: newTheme.background,
                        text: newTheme.darkText
                    }
                }
            }));
        }

        setHasUnsavedChanges(true);
    };

    const handleConfigUpdate = (newConfig: ProjectConfig) => {
        setProjectConfig(newConfig);
        setHasUnsavedChanges(true);
    };

    const handleTemplateConfigUpdate = (newTemplateConfig: TemplateConfig) => {
        setProjectConfig(prev => ({
            ...prev,
            templateConfig: { ...prev.templateConfig, ...newTemplateConfig }
        }));
        setHasUnsavedChanges(true);
    };

    const handleIconsUpdate = (newIcons: IconEntry[]) => {
        setCurrentIcons(newIcons);
        setProjectConfig(prev => ({
            ...prev,
            generatedContent: { ...prev.generatedContent!, icons: newIcons }
        }));
        setHasUnsavedChanges(true);
    };

    // Docs
    const handleDocsCreatePage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const newPage: DocPage = {
            id: Date.now().toString(),
            title: 'New Page',
            lastModified: Date.now(),
            blocks: []
        };
        setDocPages(prev => [...prev, newPage]);
        setActiveDocPageId(newPage.id);
        setActiveTab('docs');
        if (!expandedNavItems.includes('docs')) setExpandedNavItems(prev => [...prev, 'docs']);
        setHasUnsavedChanges(true);
    };

    const handleDocsDeletePage = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDocPages(prev => prev.filter(p => p.id !== id));
        if (activeDocPageId === id) setActiveDocPageId(null);
        setHasUnsavedChanges(true);
    };

    const handleDocsUpdatePage = (id: string, updates: Partial<DocPage>) => {
        setDocPages(prev => prev.map(p => p.id === id ? { ...p, ...updates, lastModified: Date.now() } : p));
        setHasUnsavedChanges(true);
    };

    const handleDocsRegenerateOverview = () => {
        // Regenerate ALL standard pages with current theme
        const updatedPages = [...docPages];

        const updateOrAddPage = (id: string, title: string, blocks: any[]) => {
            const idx = updatedPages.findIndex(p => p.id === id);
            if (idx >= 0) {
                updatedPages[idx] = { ...updatedPages[idx], blocks, lastModified: Date.now() };
            } else {
                updatedPages.push({ id, title, blocks, lastModified: Date.now() });
            }
        };

        updateOrAddPage('overview', 'Overview', getMerchantOverviewBlocks(projectConfig, themeState, currentIcons));
        updateOrAddPage('colors', 'Colors', getColorsPageBlocks(themeState));
        updateOrAddPage('typography', 'Typography', getTypographyPageBlocks(projectConfig, themeState));
        updateOrAddPage('buttons', 'Buttons', getButtonsPageBlocks(themeState));
        updateOrAddPage('icons', 'Icons', getIconsPageBlocks(currentIcons));

        setDocPages(updatedPages);
        showToast('All documentation pages refreshed with current theme', 'success');
    };

    const handleRefreshAssets = () => {
        showToast('Assets index refreshed', 'success');
    };

    // Pagination for history
    const paginatedHistory = history;
    const [viewingFile, setViewingFile] = useState<ProjectFile | null>(null);

    // --- Navigation Tree Logic ---
    const toggleNavExpand = (id: string) => {
        setExpandedNavItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const navigationTree: NavItem[] = useMemo(() => [
        {
            id: 'project',
            label: 'Project',
            icon: Briefcase,
            active: activeTab === 'project',
            onClick: () => setActiveTab('project')
        },
        {
            id: 'design-system',
            label: 'Design System',
            icon: LayoutGrid,
            children: [
                { id: 'ds-colors', label: 'Brand Colors', icon: Palette, active: activeTab === 'ui-kit' && activeUiKitCategory === 'Brand Colors', onClick: () => { setActiveTab('ui-kit'); setActiveUiKitCategory('Brand Colors'); } },
                { id: 'ds-type', label: 'Typography', icon: Type, active: activeTab === 'ui-kit' && activeUiKitCategory === 'Typography', onClick: () => { setActiveTab('ui-kit'); setActiveUiKitCategory('Typography'); } },
                { id: 'ds-btns', label: 'Buttons', icon: MousePointerClick, active: activeTab === 'ui-kit' && activeUiKitCategory === 'Buttons', onClick: () => { setActiveTab('ui-kit'); setActiveUiKitCategory('Buttons'); } },
                { id: 'ds-icons', label: 'Icons', icon: Sparkles, active: activeTab === 'ui-kit' && activeUiKitCategory === 'Icons', onClick: () => { setActiveTab('ui-kit'); setActiveUiKitCategory('Icons'); } },
                { id: 'ds-forms', label: 'Forms', icon: ClipboardList, active: activeTab === 'forms', onClick: () => setActiveTab('forms') },
            ]
        },
        {
            id: 'templates',
            label: 'Templates',
            icon: LayoutTemplate,
            active: activeTab === 'templates',
            onClick: () => setActiveTab('templates')
        },
        {
            id: 'docs',
            label: 'Documentation',
            icon: BookOpen,
            action: (
                <button onClick={handleDocsCreatePage} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 transition-colors" title="New Page">
                    <Plus size={14} />
                </button>
            ),
            children: [
                { id: 'doc-refresh', label: 'Refresh All Pages', icon: RefreshCw, onClick: handleDocsRegenerateOverview },
                ...docPages.map(page => ({
                    id: `doc-${page.id}`,
                    label: page.title,
                    icon: FileText,
                    active: activeTab === 'docs' && activeDocPageId === page.id,
                    onClick: () => { setActiveTab('docs'); setActiveDocPageId(page.id); },
                    action: (
                        <button onClick={(e) => handleDocsDeletePage(page.id, e)} className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={12} />
                        </button>
                    )
                }))
            ]
        },
        {
            id: 'sitemap',
            label: 'Site Map',
            icon: Map,
            onClick: () => setActiveTab('sitemap'),
            active: activeTab === 'sitemap' && !selectedSiteNode,
            children: STATIC_SITE_NODES.map(node => ({
                id: `node-${node.id}`,
                label: node.name,
                icon: node.icon || FileText,
                active: activeTab === 'sitemap' && selectedSiteNode?.id === node.id,
                onClick: () => { setActiveTab('sitemap'); setSelectedSiteNode(node); }
            }))
        }
    ], [activeTab, activeUiKitCategory, activeDocPageId, docPages, selectedSiteNode, expandedNavItems]);

    const filteredNavigationTree = useMemo(() => {
        if (!navSearchTerm) return navigationTree;

        const term = navSearchTerm.toLowerCase();

        const filterItems = (items: NavItem[]): NavItem[] => {
            return items.reduce((acc, item) => {
                const matches = item.label.toLowerCase().includes(term);
                const filteredChildren = item.children ? filterItems(item.children) : [];

                if (matches || filteredChildren.length > 0) {
                    acc.push({
                        ...item,
                        children: filteredChildren.length > 0 ? filteredChildren : item.children,
                    });
                }
                return acc;
            }, [] as NavItem[]);
        };

        return filterItems(navigationTree);
    }, [navigationTree, navSearchTerm]);

    // Auto-expand parents when searching
    useEffect(() => {
        if (navSearchTerm) {
            const getAllParentIds = (items: NavItem[]): string[] => {
                let ids: string[] = [];
                items.forEach(item => {
                    if (item.children && item.children.length > 0) {
                        ids.push(item.id);
                        ids = [...ids, ...getAllParentIds(item.children)];
                    }
                });
                return ids;
            };
            const idsToExpand = getAllParentIds(filteredNavigationTree);
            setExpandedNavItems(prev => Array.from(new Set([...prev, ...idsToExpand])));
        }
    }, [navSearchTerm, filteredNavigationTree]);

    // --- Hover Color Logic ---
    const getOpacityHex = (hex: string, opacity: number) => {
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        const alpha = opacity / 100;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const navHoverBg = getOpacityHex(themeState.primary, themeState.hoverOpacity || 10);

    const renderNavItem = (item: NavItem, depth = 0) => {
        const isExpanded = expandedNavItems.includes(item.id) || (navSearchTerm.length > 0 && item.children && item.children.length > 0);
        const hasChildren = !!item.children && item.children.length > 0;
        const isActive = item.active;

        return (
            <div key={item.id} className="relative">
                <div
                    onClick={() => {
                        if (item.onClick) item.onClick();
                        if (hasChildren) toggleNavExpand(item.id);
                    }}
                    className={`
                        w-full flex items-center justify-between py-2 rounded-lg transition-all duration-200 group cursor-pointer
                        ${depth === 0 ? 'px-3 mb-0.5' : 'px-2 mb-0'}
                        ${isActive ? 'bg-opacity-10 font-semibold' : 'text-gray-600 font-medium hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-hover-text)]'}
                    `}
                    style={{
                        backgroundColor: isActive ? `${themeState.primary}15` : 'transparent',
                        color: isActive ? themeState.primary : undefined,
                        paddingLeft: depth > 0 ? `${depth * 12 + 12}px` : undefined,
                        '--nav-hover-bg': navHoverBg,
                        '--nav-hover-text': themeState.primary
                    } as React.CSSProperties}
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {item.icon && (
                            <item.icon
                                size={18}
                                className={`shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                            />
                        )}
                        <span className={`truncate ${depth === 0 ? 'text-sm' : 'text-[13px]'}`}>
                            {item.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {item.action && (
                            <div onClick={(e) => e.stopPropagation()}>
                                {item.action}
                            </div>
                        )}
                        {hasChildren && (
                            <div className={`transform transition-transform duration-200 text-gray-400 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                                <ChevronDown size={14} />
                            </div>
                        )}
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div className="space-y-0.5 my-1 animate-in slide-in-from-left-1 duration-200">
                        {item.children!.map(child => renderNavItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    // --- Render ---

    if ((viewMode as ViewMode) === 'preview') {
        return (
            <div className="relative">
                <LivePreview
                    initialData={{ projectConfig, themeState }}
                    onExit={() => setViewMode('builder')}
                />
            </div>
        );
    }

    if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} themeState={themeState} />;

    if (!isSetupComplete) return <SetupPage onComplete={handleSetupComplete} onImport={handleSetupImport} initialConfig={projectConfig} themeState={themeState} />;

    return (
        <ContainerDevWrapper
            showClassNames={showClassNames}
            identity={{
                displayName: "ZAP Studio Shell",
                filePath: "components/App.tsx",
                type: "Organism/Shell", // Level 1: Shell
                architecture: "ENVIRONMENT // STUDIO FRAME"
            }}
            atomic="Organism"
            className={`flex flex-col h-screen bg-white text-gray-900 overflow-hidden font-sans ${isDarkMode ? 'dark' : ''}`}
        >

            {/* Hidden File Input for Imports */}
            <input
                type="file"
                ref={importFileRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
            />

            {/* Toast Overlay */}
            <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => {
                    let Icon = CheckCircle;
                    let iconColor = themeState.primary;
                    switch (t.type) {
                        case 'success': Icon = CheckCircle; iconColor = '#22c55e'; break;
                        case 'error': Icon = XCircle; iconColor = '#ef4444'; break;
                        case 'warning': Icon = AlertTriangle; iconColor = '#eab308'; break;
                    }
                    return (
                        <div key={t.id} role="alert" className="pointer-events-auto flex items-center gap-3 px-4 py-3 shadow-xl min-w-[300px] text-white animate-in slide-in-from-right-5 fade-in border border-white/10"
                            style={{ backgroundColor: themeState.darkText, borderRadius: `${themeState.borderRadius}px` }}>
                            <Icon size={20} style={{ color: iconColor }} />
                            <div className="flex-grow">
                                <p className="text-sm font-medium" style={{ color: themeState.lightText }}>{t.message}</p>
                                {t.action && (
                                    <button onClick={t.action.onClick} className="text-xs font-bold underline mt-1 hover:opacity-80 flex items-center gap-1" style={{ color: themeState.primary }}>
                                        {t.action.label} <ExternalLink size={10} />
                                    </button>
                                )}
                            </div>
                            <button onClick={() => removeToast(t.id)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
                        </div>
                    );
                })}
            </div>

            {/* History Browser Modal */}
            {isBrowserOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Project History</h2>
                                <p className="text-sm text-gray-500">Restore or manage your previous design iterations.</p>
                            </div>
                            <button onClick={() => setIsBrowserOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {paginatedHistory.map((file) => (
                                <div key={file.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer" onClick={() => { setViewingFile(file); }}>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{file.name}</h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                <span>{new Date(file.timestamp).toLocaleDateString()}</span>
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-gray-500">{file.config.businessType || 'General'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); loadVersion(file); }} className="p-2 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><RotateCcw size={18} /></button>
                                        <button onClick={(e) => deleteVersion(file.id, e)} className="p-2 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Global Builder Header - Always persistent at top level */}
            <Header
                isBuilder={true}
                projectName={projectConfig.projectName || "Orbit Financial"}
                viewMode={viewMode as 'builder' | 'preview'}
                onViewModeChange={(mode) => setViewMode(mode)}
                theme={themeState}

                // Wire up the new menu actions
                onOpenProject={() => setIsBrowserOpen(true)}
                onImportFile={handleImportClick}
                onSaveVersion={() => saveToHistory(true)}
                onExport={() => {
                    handleDocsRegenerateOverview();
                    setIsExportOpen(true);
                }}
                onWorkspaceSettings={() => showToast('Workspace settings coming soon', 'info')}
            />

            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                theme={themeState}
                config={projectConfig}
                docs={docPages}
                onToast={showToast}
            />

            {/* Main Layout - Toggle content based on ViewMode */}
            <div className="flex-1 flex overflow-hidden bg-[#F9FAFB] relative">

                {/* PREVIEW MODE: Full Screen Component */}
                {(viewMode === 'preview') ? (
                    <div className="absolute inset-0 z-40 bg-white">
                        <LivePreview
                            initialData={{ projectConfig, themeState }}
                            onExit={() => setViewMode('builder')}
                        />
                    </div>
                ) : (
                    /* BUILDER MODE: 3-Column Layout */
                    <>
                        {/* LEFT SIDEBAR: Main Navigation */}
                        <aside className={`h-full bg-white border-r border-gray-200 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden shrink-0 flex flex-col ${isExplorerOpen ? 'w-[280px]' : 'w-0 border-none'}`}>

                            <div className="p-4 border-b border-gray-100 shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Navigation</h3>
                                    {/* Dark Mode Toggle Added Here */}
                                    <div className={`flex rounded-lg p-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                                        <button
                                            onClick={() => setIsDarkMode(false)}
                                            className={`p-1 rounded-md transition-all ${!isDarkMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <Sun size={12} />
                                        </button>
                                        <button
                                            onClick={() => setIsDarkMode(true)}
                                            className={`p-1 rounded-md transition-all ${isDarkMode ? 'bg-slate-700 shadow-sm text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <Moon size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Filter pages..."
                                        value={navSearchTerm}
                                        onChange={(e) => setNavSearchTerm(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-purple-500 focus:bg-white transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="px-3 py-2 flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
                                {filteredNavigationTree.map(item => renderNavItem(item))}
                                {filteredNavigationTree.length === 0 && (
                                    <div className="p-4 text-center text-xs text-gray-400 italic">
                                        No matching items found.
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                                <button
                                    onClick={() => saveToHistory(true)} // Manual save
                                    disabled={!hasUnsavedChanges}
                                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${hasUnsavedChanges
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-white border border-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    style={hasUnsavedChanges ? { backgroundColor: themeState.primary } : {}}
                                >
                                    <Save size={14} />
                                    {hasUnsavedChanges ? 'Save Changes' : 'All Saved'}
                                </button>
                            </div>
                        </aside>

                        {/* CENTER: Main Canvas */}
                        <main className="flex-1 flex flex-col relative bg-white min-w-0 overflow-hidden">

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-hidden flex flex-col relative">
                                {/* Editor or Config Views */}
                                {activeTab === 'docs' ? (
                                    <DocsSection
                                        config={projectConfig}
                                        activePage={docPages.find(p => p.id === activeDocPageId)}
                                        updatePage={handleDocsUpdatePage}
                                        themeState={themeState}
                                        showClassNames={showClassNames}
                                    />
                                ) : activeTab === 'ui-kit' ? (
                                    <UiKitSection
                                        config={projectConfig}
                                        themeState={themeState}
                                        showClassNames={showClassNames}
                                        setThemeState={handleThemeUpdate}
                                        setShowClassNames={setShowClassNames}
                                        onUpdateConfig={handleConfigUpdate}
                                        activeCategory={activeUiKitCategory}
                                        // Pass down icon handling props
                                        onSelectIcon={(icon) => setSelectedIcon(icon)}
                                        selectedIcon={selectedIcon}
                                        isDarkMode={isDarkMode}
                                    />
                                ) : activeTab === 'icons' ? (
                                    // When Icons tab is active, main canvas shows Live Preview to provide context
                                    <div className="flex-1 h-full">
                                        <LivePreview initialData={{ projectConfig, themeState }} isEmbedded={true} />
                                    </div>
                                ) : activeTab === 'forms' ? (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                                        <FormsSection
                                            themeState={themeState}
                                            showClassNames={showClassNames}
                                            setShowClassNames={setShowClassNames}
                                        />
                                    </div>
                                ) : activeTab === 'sitemap' ? (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        <SiteMapSection
                                            themeState={themeState}
                                            docPages={docPages}
                                            projectConfig={projectConfig}
                                            selectedNode={selectedSiteNode}
                                            onSelectNode={setSelectedSiteNode}
                                            showClassNames={showClassNames}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 pb-32">
                                            {activeTab === 'project' && <SetupPage onComplete={handleConfigUpdate} onImport={handleSetupImport} initialConfig={projectConfig} themeState={themeState} hideHeader={true} readOnly={false} showClassNames={showClassNames} />}
                                            {activeTab === 'templates' && (
                                                <TemplateSection
                                                    config={projectConfig}
                                                    themeState={themeState}
                                                    activeSection={activeTemplateSection}
                                                    onSectionChange={setActiveTemplateSection}
                                                    showClassNames={showClassNames}
                                                />
                                            )}                </div>
                                    </div>
                                )}
                            </div>
                        </main>

                        {/* RIGHT SIDEBAR: Inspector */}
                        <aside className={`h-full bg-white border-l border-gray-200 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden shrink-0 ${isInspectorOpen ? 'w-[320px]' : 'w-0 border-none'}`}>
                            {activeTab === 'docs' && (
                                <DocsInspector
                                    config={projectConfig}
                                    themeState={themeState}
                                    icons={currentIcons}
                                    onRefreshAssets={handleRefreshAssets}
                                    showClassNames={showClassNames}
                                />
                            )}
                            {activeTab === 'icons' && (
                                // Render IconsSection as the "Icons Inspector"
                                <IconsSection
                                    config={projectConfig}
                                    themeState={themeState}
                                    icons={currentIcons}
                                    onUpdate={handleIconsUpdate}
                                    selectedIcon={selectedIcon}
                                    showClassNames={showClassNames}
                                    setShowClassNames={setShowClassNames}
                                    isDarkMode={isDarkMode}
                                />
                            )}
                            {activeTab === 'ui-kit' && (
                                activeUiKitCategory === 'Icons' ? (
                                    <IconsSection
                                        config={projectConfig}
                                        themeState={themeState}
                                        icons={currentIcons}
                                        onUpdate={handleIconsUpdate}
                                        selectedIcon={selectedIcon}
                                        showClassNames={showClassNames}
                                        setShowClassNames={setShowClassNames}
                                        isDarkMode={isDarkMode}
                                    />
                                ) : (
                                    <UiKitInspector
                                        activeCategory={activeUiKitCategory}
                                        themeState={themeState}
                                        setThemeState={handleThemeUpdate}
                                        showClassNames={showClassNames}
                                        setShowClassNames={setShowClassNames}
                                        config={projectConfig}
                                        onUpdateConfig={handleConfigUpdate}
                                        onCategoryChange={setActiveUiKitCategory}
                                        isDarkMode={isDarkMode}
                                    />
                                )
                            )}
                            {activeTab === 'forms' && (
                                <UiKitInspector
                                    activeCategory='Form Elements'
                                    themeState={themeState}
                                    setThemeState={handleThemeUpdate}
                                    showClassNames={showClassNames}
                                    setShowClassNames={setShowClassNames}
                                    config={projectConfig}
                                    onUpdateConfig={handleConfigUpdate}
                                    onCategoryChange={setActiveUiKitCategory}
                                    isDarkMode={isDarkMode}
                                />
                            )}
                            {activeTab === 'templates' && (
                                <TemplateInspector
                                    config={projectConfig}
                                    onUpdateConfig={(newTemplateConfig) => handleConfigUpdate({ ...projectConfig, templateConfig: newTemplateConfig })}
                                    themeState={themeState}
                                    showClassNames={showClassNames}
                                    setShowClassNames={setShowClassNames}
                                    activeSection={activeTemplateSection}
                                />
                            )}
                        </aside>
                    </>
                )}
            </div>
        </ContainerDevWrapper>
    );
};

export default App;
