import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProjectConfig, ThemeState, DocPage, IconEntry, Tab } from './types';
import { standardUiKitData } from './components/standardUiKit';
import { STORAGE_KEYS } from './constants/storage';
import pkg from './package.json';

interface ZapState {
    // Role Awareness
    userRole: 'admin' | 'merchant';
    setUserRole: (role: 'admin' | 'merchant') => void;

    // Layered State
    masterConfig: ThemeState;
    merchantOverride: Partial<ThemeState>;
    computedTheme: ThemeState;

    // Project Config
    projectConfig: ProjectConfig;

    // UI State
    activeTab: Tab;
    activeDocPageId: string | null;
    docPages: DocPage[];
    isAuthenticated: boolean;
    isSetupComplete: boolean;
    hasUnsavedChanges: boolean;
    authData: any | null;
    customerDetail: any | null;

    // Dev Tools
    devTermMode: 'atomic' | 'zap';
    setDevTermMode: (mode: 'atomic' | 'zap') => void;
    activeHoverId: string | null;
    setActiveHoverId: (id: string | null) => void;

    // Actions
    setMasterConfig: (config: Partial<ThemeState> | ((prev: ThemeState) => Partial<ThemeState>)) => void;
    setMerchantOverride: (override: Partial<ThemeState> | ((prev: Partial<ThemeState>) => Partial<ThemeState>)) => void;
    setProjectConfig: (config: Partial<ProjectConfig> | ((prev: ProjectConfig) => Partial<ProjectConfig>)) => void;
    setDocPages: (pages: DocPage[] | ((prev: DocPage[]) => DocPage[])) => void;
    setActiveTab: (tab: Tab) => void;
    setActiveDocPageId: (id: string | null) => void;
    setIsAuthenticated: (val: boolean) => void;
    setIsSetupComplete: (val: boolean) => void;
    setAuthData: (data: any | null) => void;
    setCustomerDetail: (detail: any | null) => void;
    saveToStorage: () => void;
    loadFromStorage: () => void;
    logout: () => void;

    // Helpers
    updateComputedTheme: () => void;
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
    secondaryFontFamily: 'Inter',
    borderRadius: 12,
    btnPaddingX: 24,
    btnPaddingY: 12,
    buttonStyle: 'flat',
    fillMode: 'solid',
    gradientAngle: 135,
    depth: 1,
    iconGap: 8,
    buttonHoverOpacity: 90,
    inputBg: '#FFFFFF',
    inputFilledBg: '#F3F4F6',
    inputBorder: '#E5E7EB',
    inputPaddingX: 16,
    inputPaddingY: 12,
    layoutGap: 32,
    sectionPadding: 48,
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
    generatedContent: standardUiKitData,
    version: pkg.version
};

export const useStore = create<ZapState>()(
    (set, get) => ({
        userRole: 'admin',
        setUserRole: (role) => set({ userRole: role }),

        masterConfig: DEFAULT_THEME,
        merchantOverride: {},
        computedTheme: DEFAULT_THEME,

        projectConfig: DEFAULT_CONFIG,

        activeTab: 'ui-kit',
        activeDocPageId: 'overview',
        docPages: [],
        isAuthenticated: false,
        isSetupComplete: false,
        hasUnsavedChanges: false,
        authData: null,
        customerDetail: null,

        // Dev Defaults
        devTermMode: 'atomic',
        setDevTermMode: (mode) => set({ devTermMode: mode }),
        activeHoverId: null,
        setActiveHoverId: (id) => set({ activeHoverId: id }),

        setMasterConfig: (config) => {
            set((state) => ({
                masterConfig: {
                    ...state.masterConfig,
                    ...(typeof config === 'function' ? config(state.masterConfig) : config)
                },
                hasUnsavedChanges: true
            }));
            get().updateComputedTheme();
        },

        setMerchantOverride: (override) => {
            set((state) => ({
                merchantOverride: {
                    ...state.merchantOverride,
                    ...(typeof override === 'function' ? override(state.merchantOverride) : override)
                },
                hasUnsavedChanges: true
            }));
            get().updateComputedTheme();
        },

        setProjectConfig: (config) => set((state) => ({
            projectConfig: {
                ...state.projectConfig,
                ...(typeof config === 'function' ? config(state.projectConfig) : config)
            },
            hasUnsavedChanges: true
        })),

        setDocPages: (pages) => set((state) => ({
            docPages: typeof pages === 'function' ? pages(state.docPages) : pages,
            hasUnsavedChanges: true
        })),

        setActiveTab: (tab) => set({ activeTab: tab }),
        setActiveDocPageId: (id) => set({ activeDocPageId: id }),
        setIsAuthenticated: (val) => set({ isAuthenticated: val }),
        setIsSetupComplete: (val) => set({ isSetupComplete: val }),
        setAuthData: (data) => set({ authData: data }),
        setCustomerDetail: (detail) => set({ customerDetail: detail }),

        saveToStorage: () => {
            const state = get();
            const dataToSave = {
                userRole: state.userRole,
                masterConfig: state.masterConfig,
                merchantOverride: state.merchantOverride,
                projectConfig: state.projectConfig,
                docPages: state.docPages,
                isSetupComplete: state.isSetupComplete,
                isAuthenticated: state.isAuthenticated,
                authData: state.authData,
                customerDetail: state.customerDetail
            };
            localStorage.setItem(STORAGE_KEYS.ZAP_STORAGE, JSON.stringify(dataToSave));
            set({ hasUnsavedChanges: false });
        },

        loadFromStorage: () => {
            const stored = localStorage.getItem(STORAGE_KEYS.ZAP_STORAGE);
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    set({
                        ...data,
                        hasUnsavedChanges: false
                    });
                    get().updateComputedTheme();
                } catch (e) {
                    console.error("Failed to load state from storage", e);
                }
            }
        },

        logout: () => {
            set({
                isAuthenticated: false,
                isSetupComplete: false,
                hasUnsavedChanges: false,
                authData: null,
                customerDetail: null,
                projectConfig: DEFAULT_CONFIG,
                merchantOverride: {},
                docPages: [],
                activeTab: 'ui-kit',
                activeDocPageId: 'overview'
            });
            localStorage.removeItem(STORAGE_KEYS.ZAP_STORAGE);
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        },

        updateComputedTheme: () => {
            const { masterConfig, merchantOverride, projectConfig } = get();

            const theme = { ...masterConfig };
            (Object.keys(merchantOverride) as Array<keyof ThemeState>).forEach((key) => {
                const val = merchantOverride[key];
                if (val !== undefined) {
                    // @ts-ignore
                    theme[key] = val;
                }
            });

            const updatedConfig = { ...projectConfig };
            if (updatedConfig.generatedContent) {
                updatedConfig.generatedContent = {
                    ...updatedConfig.generatedContent,
                    colors: {
                        ...updatedConfig.generatedContent.colors,
                        primary: theme.primary,
                        primaryName: 'Active Brand',
                        secondary: theme.secondary,
                        secondaryName: 'Secondary Brand',
                        background: theme.background,
                        text: theme.darkText
                    }
                };
            }

            set({
                computedTheme: theme,
                projectConfig: updatedConfig
            });

            Object.entries(theme).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                    document.documentElement.style.setProperty(cssVarName, value.toString());
                    if (typeof value === 'number' && !key.toLowerCase().includes('opacity')) {
                        document.documentElement.style.setProperty(`${cssVarName}-px`, `${value}px`);
                    }
                }
            });
        }
    })
);
