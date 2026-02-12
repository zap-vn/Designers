
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Upload, Check, Zap, MapPin, ChevronDown, Search, Calendar, Clock, Sparkles, Briefcase, Globe,
    ArrowLeft, Info, AlertTriangle, Wand2, Download, UploadCloud, Lock, ArrowRight, Building2
} from 'lucide-react';
import { GoogleGenAI, Type as GeminiType } from "@google/genai";
import Header from './Header';
import { ProjectConfig, UiKitData, ThemeState, ProjectFile } from '../types';
import { ContainerDevWrapper } from './DevDocBanner';
import { useStore } from '../store';
import { customerApi } from '../services/customer/customer.service';
import { StandardInput } from './atoms/StandardInput';
import { Button } from './atoms/Button';
import { IconSearchDropdown, IconOption } from './atoms/SelectInputs';
import businessTypesData from '../services/system/SystemBusinessType.json';
import countriesData from '../services/system/SystemCountry.json';
import languagesData from '../services/system/SystemLanguage.json';
import timezonesData from '../services/system/SystemTimeZone.json';
import dateFormatsData from '../services/system/SystemFormatDate.json';
import timeFormatsData from '../services/system/SystemTime.json';

interface SetupPageProps {
    onComplete: (config: ProjectConfig) => void;
    onImport?: (file: ProjectFile) => void;
    initialConfig?: ProjectConfig;
    themeState: ThemeState;
    hideHeader?: boolean;
    readOnly?: boolean;
    showClassNames?: boolean;
}

// Fallback Logo (Purple square with white triangle) - Ensures Inspector is never empty
const DEFAULT_LOGO_SVG = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIwIiBmaWxsPSIjN0UyMkNFIi8+PHBhdGggZD0iTTUwIDIwTDgwIDcwSDIwTDUwIDIwWiIgZmlsbD0iI0ZGRkZGRiIvPjwvc3ZnPg==`;

// Helper: Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

interface DropdownOption {
    label: string;
    value: string | number;
}


const useFontLoader = (fontFamily: string) => {
    useEffect(() => {
        if (!fontFamily || ['System', 'sans-serif', 'serif', 'monospace'].includes(fontFamily) || fontFamily.startsWith('-apple')) return;
        const fontName = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        const linkId = `font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
            document.head.appendChild(link);
        }
    }, [fontFamily]);
};

const SetupPage: React.FC<SetupPageProps> = ({
    onComplete,
    onImport,
    initialConfig,
    themeState,
    hideHeader = false,
    readOnly = false,
    showClassNames
}) => {
    const safeTheme = themeState || {
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
        borderRadius: 16,
        btnPaddingX: 24,
        btnPaddingY: 16,
        inputBg: '#FFFFFF',
        inputBorder: '#E5E7EB',
        activeColor: '#7E22CE'
    };

    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Initializing...');
    const [apiError, setApiError] = useState<string | null>(null);
    const [useAI, setUseAI] = useState(false);

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const importInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (activeDropdown && !(e.target as Element).closest('button')) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeDropdown]);

    const toggleDropdown = (id: string) => (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveDropdown(prev => prev === id ? null : id);
    };

    const [formData, setFormData] = useState<ProjectConfig>(initialConfig || {
        merchantName: '',
        projectName: '',
        businessType: '',
        timezone: '',
        language: '',
        country: '',
        dateFormat: '',
        timeFormat: ''
    });

    const { authData, customerDetail, setCustomerDetail } = useStore();

    useEffect(() => {
        const fetchCustomerInfo = async () => {
            if (customerDetail) {
                // If data exists, just ensure form is hydrated
                setFormData(prev => ({
                    ...prev,
                    merchantName: customerDetail.MerchantName || prev.merchantName,
                    projectName: customerDetail.BusinessName || prev.projectName,
                    businessType: customerDetail.BussinessTypeId || prev.businessType,
                    country: customerDetail.Country || prev.country,
                    timezone: customerDetail.TimeZoneId || prev.timezone,
                    language: customerDetail.LanguageId ? (typeof customerDetail.LanguageId === 'number' ? customerDetail.LanguageId : prev.language) : prev.language
                }));
                return;
            }

            try {
                const userGuid = authData?.UserGuid || 'Customer/1';
                const data = await customerApi.getCustomerDetail(userGuid);
                setCustomerDetail(data);

                setFormData(prev => ({
                    ...prev,
                    merchantName: data.MerchantName || '',
                    projectName: data.BusinessName || prev.projectName,
                    businessType: data.BussinessTypeId || prev.businessType,
                    country: data.Country || 704,
                    timezone: data.TimeZoneId || "Central Standard Time",
                    language: data.LanguageId && typeof data.LanguageId === 'number' ? data.LanguageId : 136
                }));
            } catch (err) {
                console.error("Failed to fetch customer data", err);
            }
        };

        fetchCustomerInfo();
    }, [customerDetail, setCustomerDetail, authData]);

    useEffect(() => {
        if (hideHeader && !isExtracting && !readOnly) {
            onComplete(formData);
        }
    }, [formData, hideHeader, isExtracting, readOnly]);

    useFontLoader(safeTheme.fontFamily);

    const businessTypes: IconOption[] = (businessTypesData as any[]).map(item => ({
        id: item.SystemBussinessTypeId,
        label: item.BussinessType_en,
        description: item.BussinessType_vi || "Industry",
        value: item.SystemBussinessTypeId,
        icon: Briefcase
    }));

    const countries: IconOption[] = (countriesData as any[]).map(item => ({
        id: item.CountryId,
        label: item.Country,
        description: item.Region || item.FullName || "Location",
        value: item.CountryId,
        icon: MapPin
    }));

    const languages: IconOption[] = (languagesData as any[]).map(item => ({
        id: item.Id,
        label: item.DisplayName,
        description: item.EnglishName || "Language",
        value: item.Id,
        icon: Globe
    }));

    const timezones: IconOption[] = (timezonesData as any[]).map(item => ({
        id: item.TimeZoneId,
        label: item.DisplayName,
        description: item.BaseUtcOffset || "Timezone",
        value: item.TimeZoneId,
        icon: Clock
    }));

    const dateFormats: IconOption[] = (dateFormatsData as any[]).map(item => ({
        id: item.SystemFormatDateId,
        label: item.DisplayFormat,
        description: "Standard Format",
        value: item.SystemFormatDateId,
        icon: Calendar
    }));

    const timeFormats: IconOption[] = (timeFormatsData as any[]).map(item => ({
        id: item.TimeId,
        label: item.Time,
        description: "Clock Format",
        value: item.TimeId,
        icon: Clock
    }));

    const getCountryDefaults = (countryId: number | string) => {
        switch (Number(countryId)) {
            case 840: return { timezone: "Central Standard Time", language: 136, dateFormat: 5, timeFormat: 2 };
            case 704: return { timezone: "SE Asia Standard Time", language: 139, dateFormat: 1, timeFormat: 1 };
            case 276: return { timezone: "W. Europe Standard Time", language: 47, dateFormat: 1, timeFormat: 1 };
            default: return { timezone: "", language: 136, dateFormat: 1, timeFormat: 1 };
        }
    };

    useEffect(() => {
        if (formData.country) {
            const defaults = getCountryDefaults(formData.country);

            const isInitialLoad = initialConfig && initialConfig.country === formData.country && initialConfig.dateFormat === formData.dateFormat;
            if (!isInitialLoad) {
                setFormData(prev => ({
                    ...prev,
                    timezone: defaults.timezone || prev.timezone,
                    language: defaults.language || prev.language,
                    dateFormat: defaults.dateFormat,
                    timeFormat: defaults.timeFormat
                }));
            }
        }
    }, [formData.country, initialConfig]);

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); if (!isExtracting && !readOnly) setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (isExtracting || readOnly) return; if (e.dataTransfer.files && e.dataTransfer.files.length > 0) setFiles(Array.from(e.dataTransfer.files)); };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) setFiles(Array.from(e.target.files)); };

    const handleSampleData = () => {
        setUseAI(false);
        setFormData({
            merchantName: "pho24",
            projectName: "Orbit Financial",
            businessType: "Finance & Banking",
            country: "United States",
            language: "English",
            timezone: "(UTC-05:00) Eastern Time (US & Canada)",
            dateFormat: "MM/DD/YYYY",
            timeFormat: "12h (AM/PM)"
        });
        setFiles([new File([""], "sample-design-mockup.png", { type: "image/png" })]);
    };

    const handleImportClick = () => importInputRef.current?.click();

    const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const content = ev.target?.result as string;
                const parsed = JSON.parse(content) as ProjectFile;
                if (parsed.config && parsed.theme) {
                    if (onImport) onImport(parsed);
                    else setFormData(parsed.config);
                }
            } catch (err) { console.error("Import failed", err); setApiError("Failed to import project file. Invalid JSON."); }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const generateLogo = async (config: ProjectConfig, assets: File[]): Promise<{ url: string, description: string } | null> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Design a modern, versatile logo for "${config.projectName}", a ${config.businessType} company. The logo should be clean, professional, and suitable for an app icon. Use a white background.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] }
            });
            const firstCandidate = response.candidates?.[0];
            if (firstCandidate?.content?.parts) {
                for (const part of firstCandidate.content.parts) {
                    if (part.inlineData) {
                        const base64EncodeString = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        return { url: `data:${mimeType};base64,${base64EncodeString}`, description: prompt };
                    }
                }
            }
            return null;
        } catch (error) { console.error("Logo generation failed", error); return null; }
    };

    const generateUiKitContent = async (config: ProjectConfig, assets: File[]): Promise<UiKitData | null> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const hasImage = assets.length > 0 && assets[0].type.startsWith('image/');
            let model = 'gemini-3-flash-preview';
            let contents: any = [];
            const responseSchema = {
                type: GeminiType.OBJECT,
                properties: {
                    colors: {
                        type: GeminiType.OBJECT,
                        properties: {
                            primary: { type: GeminiType.STRING, description: "Main brand color" },
                            primaryName: { type: GeminiType.STRING },
                            secondary: { type: GeminiType.STRING, description: "Secondary/Accent color" },
                            secondaryName: { type: GeminiType.STRING },
                            background: { type: GeminiType.STRING, description: "Main page background" },
                            background2: { type: GeminiType.STRING, description: "Secondary background (cards/panels)" },
                            background3: { type: GeminiType.STRING, description: "Tertiary background (inputs/modals)" },
                            text: { type: GeminiType.STRING, description: "Primary dark text color" },
                            darkText: { type: GeminiType.STRING, description: "Heading text color" },
                            grayText: { type: GeminiType.STRING, description: "Body/Secondary text color" },
                            lightText: { type: GeminiType.STRING, description: "Text on dark backgrounds" },
                            primaryBtnText: { type: GeminiType.STRING, description: "Text color for primary button" },
                            secondaryBtnText: { type: GeminiType.STRING, description: "Text color for secondary button" },
                            tertiaryBtnText: { type: GeminiType.STRING, description: "Text color for tertiary/link button" },
                            inputBg: { type: GeminiType.STRING, description: "Background for input fields" },
                            inputFilledBg: { type: GeminiType.STRING, description: "Background for filled variant inputs" },
                            inputBorder: { type: GeminiType.STRING, description: "Border color for inputs" },
                            activeColor: { type: GeminiType.STRING, description: "Color for active states (focus rings, toggles)" },
                            formPlaceholderColor: { type: GeminiType.STRING },
                            formTextColor: { type: GeminiType.STRING },
                            formLabelColor: { type: GeminiType.STRING },
                            formErrorColor: { type: GeminiType.STRING },
                        },
                        required: ["primary", "secondary", "background", "text", "activeColor"]
                    },
                    buttons: { type: GeminiType.OBJECT, properties: { primaryLabel: { type: GeminiType.STRING }, secondaryLabel: { type: GeminiType.STRING }, neutralLabel: { type: GeminiType.STRING } }, required: ["primaryLabel", "secondaryLabel", "neutralLabel"] },
                    card: { type: GeminiType.OBJECT, properties: { title: { type: GeminiType.STRING }, subtitle: { type: GeminiType.STRING }, priceLabel: { type: GeminiType.STRING }, priceValue: { type: GeminiType.NUMBER }, details: { type: GeminiType.STRING }, actionPrimary: { type: GeminiType.STRING }, actionSecondary: { type: GeminiType.STRING }, tag: { type: GeminiType.STRING } }, required: ["title", "subtitle", "priceLabel", "priceValue", "details", "actionPrimary", "actionSecondary", "tag"] },
                    chat: { type: GeminiType.OBJECT, properties: { userMessage: { type: GeminiType.STRING }, agentMessage: { type: GeminiType.STRING }, inputPlaceholder: { type: GeminiType.STRING } }, required: ["userMessage", "agentMessage", "inputPlaceholder"] },
                    faqs: { type: GeminiType.ARRAY, items: { type: GeminiType.OBJECT, properties: { question: { type: GeminiType.STRING }, answer: { type: GeminiType.STRING } }, required: ["question", "answer"] } },
                    services: { type: GeminiType.ARRAY, items: { type: GeminiType.STRING } },
                    categories: { type: GeminiType.ARRAY, items: { type: GeminiType.STRING } },
                    notifications: { type: GeminiType.OBJECT, properties: { success: { type: GeminiType.STRING }, error: { type: GeminiType.STRING } }, required: ["success", "error"] },
                },
                required: ["colors", "buttons", "card", "chat", "faqs", "services", "categories", "notifications"]
            };

            if (hasImage) {
                model = 'gemini-2.5-flash-image';
                const file = assets[0];
                const base64Data = await fileToBase64(file);
                contents = [
                    { parts: [{ inlineData: { mimeType: file.type, data: base64Data.split(',')[1] } }, { text: `Analyze this image. Extract a comprehensive color palette for a "${config.businessType}" app named "${config.projectName}". Fill all color fields in the schema based on the image's branding. Also generate sample text content (FAQs, Chat) relevant to the business type. DO NOT EXTRACT FONTS.` }] }
                ];
            } else {
                const prompt = `Generate a UI Kit content strategy for a "${config.businessType}" application named "${config.projectName}" located in "${config.country}" using language "${config.language}". Return a strict JSON object with: 1. A detailed color palette including form states. 2. Content samples. DO NOT generate typography settings.`;
                contents = [{ role: 'user', parts: [{ text: prompt }] }];
            }

            const response = await ai.models.generateContent({ model: model, contents: contents, config: { responseMimeType: "application/json", responseSchema: responseSchema } });
            if (response.text) return JSON.parse(response.text) as UiKitData;
            return null;
        } catch (error: any) {
            console.error("Error generating content:", error);
            throw new Error("An unknown error occurred while contacting the AI service. Please check the console for details.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isExtracting || readOnly) return;
        setApiError(null);
        setIsExtracting(true);
    };

    useEffect(() => {
        if (!isExtracting) return;

        const extract = async () => {
            try {
                setProgress(0);
                setStatusText("Initializing...");
                await new Promise(res => setTimeout(res, 200));

                let generatedData: UiKitData | null = null;
                let logoData: { url: string; description?: string } | null = null;

                if (useAI) {
                    if (files.length > 0) setStatusText("Analyzing image & generating logo...");
                    else setStatusText("Generating brand identity & logo...");
                    setProgress(20);

                    const [contentResult, logoResult] = await Promise.all([
                        generateUiKitContent(formData, files),
                        generateLogo(formData, files)
                    ]);
                    generatedData = contentResult;
                    logoData = logoResult;
                } else {
                    setProgress(20);
                    setStatusText("Loading standard assets...");
                    const { standardUiKitData } = await import('./standardUiKit');
                    generatedData = standardUiKitData;
                    await new Promise(res => setTimeout(res, 1000));
                }

                // Fallback Logo Logic
                if (!logoData) {
                    if (files.length > 0 && files[0].type.startsWith('image/')) {
                        const base64 = await fileToBase64(files[0]);
                        logoData = { url: base64, description: 'Uploaded asset' };
                    } else {
                        logoData = { url: DEFAULT_LOGO_SVG, description: 'Standard Placeholder' };
                    }
                }

                if (!generatedData) throw new Error("Failed to load content. Please try again.");

                setProgress(90);
                setStatusText("Finalizing project...");
                await new Promise(res => setTimeout(res, 500));

                setProgress(100);
                const finalConfig: ProjectConfig = { ...formData, generatedContent: generatedData, logo: logoData };
                onComplete(finalConfig);

            } catch (error: any) {
                setApiError(error.message || "An unexpected error occurred.");
                setIsExtracting(false);
                setProgress(0);
            }
        };
        extract();
    }, [isExtracting]);

    const SetupContent = (
        <ContainerDevWrapper
            showClassNames={showClassNames}
            identity={{ displayName: "SetupCard", type: "Card/Container", value: "Configuration Form", filePath: "components/SetupPage.tsx" }}
            className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 relative"
        >
            <div className="mb-8 text-center md:text-left border-b border-gray-100 pb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: safeTheme.darkText }}>Project Setup</h1>
                        {readOnly && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                <Lock size={12} /> Master Record
                            </span>
                        )}
                    </div>
                    <p className="text-base max-w-2xl" style={{ color: safeTheme.grayText }}>
                        {readOnly ? "This project configuration is locked as a Master File." : "Enter your project details below. We'll use this information to configure your localized UI kit and content strategy."}
                    </p>
                </div>
            </div>

            <form id="setup-form" onSubmit={handleSubmit} className={`space-y-8 transition-opacity duration-500 ${isExtracting ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>

                {apiError && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex gap-3 items-start animate-in fade-in">
                        <AlertTriangle size={24} className="text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-red-900">Extraction Failed</h4>
                            <p className="text-xs text-red-700 mt-1">{apiError}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                        <ContainerDevWrapper showClassNames={showClassNames} identity={{ displayName: "MerchantNameInput", type: "Field", value: formData.merchantName, filePath: "state.formData.merchantName" }}>
                            <StandardInput
                                required
                                themeState={safeTheme}
                                label="Merchant Name"
                                icon={Building2}
                                placeholder="e.g. pho24"
                                value={formData.merchantName}
                                onChange={e => setFormData({ ...formData, merchantName: e.target.value })}
                                disabled={isExtracting || readOnly}
                                readOnly={true}
                            />
                        </ContainerDevWrapper>
                    </div>

                    <div className="space-y-6">
                        <ContainerDevWrapper showClassNames={showClassNames} identity={{ displayName: "ProjectNameInput", type: "Field", value: formData.projectName, filePath: "state.formData.projectName" }}>
                            <StandardInput
                                required
                                themeState={safeTheme}
                                label="Project Name"
                                icon={Zap}
                                placeholder="e.g. Fintech Dashboard v2"
                                value={formData.projectName}
                                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                                disabled={isExtracting || readOnly}
                                readOnly={readOnly}
                            />
                        </ContainerDevWrapper>

                        <ContainerDevWrapper showClassNames={showClassNames} identity={{ displayName: "BusinessTypeSelect", type: "Field", value: String(formData.businessType), filePath: "state.formData.businessType" }}>
                            <IconSearchDropdown
                                label="Business Type"
                                value={formData.businessType}
                                options={businessTypes}
                                onChange={(val) => setFormData({ ...formData, businessType: val })}
                                icon={Briefcase}
                                themeState={safeTheme}
                                isOpen={activeDropdown === 'businessType'}
                                onToggle={toggleDropdown('businessType')}
                                disabled={isExtracting || readOnly}
                                required
                                searchable={false}
                                hideLayoutToggle={true}
                            />
                        </ContainerDevWrapper>

                        {!readOnly && (
                            <>
                                <div className="pt-2">
                                    <label
                                        className="flex items-center justify-between gap-2 cursor-pointer select-none p-4 bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                                        style={{ borderRadius: `${safeTheme.borderRadius}px` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Wand2 size={20} style={{ color: safeTheme.primary }} />
                                            <div>
                                                <span className="font-bold text-sm" style={{ color: safeTheme.darkText }}>Use AI Content Generation</span>
                                                <p className="text-xs" style={{ color: safeTheme.grayText }}>Extract colors from uploaded image or generate based on type.</p>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200`} style={{ backgroundColor: useAI ? safeTheme.primary : '#d1d5db' }} onClick={(e) => { e.preventDefault(); if (!readOnly) setUseAI(!useAI); }}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${useAI ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </label>
                                </div>

                                <div className="pt-2">
                                    <div className="p-4 bg-blue-50 border border-blue-100 flex gap-3 items-start" style={{ borderRadius: `${safeTheme.borderRadius}px` }}>
                                        <Info size={18} className="text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-900">AI Auto-Configuration</h4>
                                            <p className="text-xs text-blue-700 mt-1">Selecting a country will automatically configure date, time, and currency formats for your region.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <ContainerDevWrapper showClassNames={showClassNames} identity={{ displayName: "AssetDropzone", type: "Field", value: "Drag & Drop", filePath: "state.files" }}>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 block mb-1.5">Reference Assets (Optional)</label>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`h-full min-h-[240px] border-2 border-dashed flex flex-col items-center justify-center text-center transition-all relative group bg-gray-50 ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}`}
                                style={{
                                    borderColor: isDragging ? safeTheme.primary : '#E5E7EB',
                                    borderRadius: `${safeTheme.borderRadius}px`
                                }}
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleFileChange}
                                    accept="image/*,video/*"
                                    multiple
                                    disabled={isExtracting || readOnly}
                                />
                                <div className="flex flex-col items-center gap-3 pointer-events-none p-6">
                                    {files.length > 0 ? (
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in" style={{ backgroundColor: safeTheme.secondary, color: safeTheme.primary }}>
                                            <Check size={24} strokeWidth={3} />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 group-hover:scale-110 transition-all duration-300">
                                            {readOnly ? <Lock size={20} /> : <Upload size={20} />}
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-bold text-sm text-gray-900 mb-1">
                                            {files.length > 0 ? `${files.length} file(s) selected` : (readOnly ? "Uploads Locked" : "Click or drag assets")}
                                        </p>
                                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                                            {readOnly ? "Reference assets cannot be changed in Master view." : "Upload screenshots or videos to extract styles."}
                                        </p>
                                    </div>
                                </div>

                                {files.length === 0 && !readOnly && (
                                    <div className="relative z-20 mt-2 flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSampleData();
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border shadow-sm text-[10px] font-bold transition-all hover:shadow-md"
                                            style={{ color: safeTheme.primary, borderColor: '#E5E7EB' }}
                                        >
                                            <Sparkles size={12} />
                                            <span>Use Sample Data</span>
                                        </button>

                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-[10px] text-gray-400">OR</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleImportClick();
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border shadow-sm text-[10px] font-bold transition-all hover:shadow-md text-gray-600 hover:text-gray-900"
                                            style={{ borderColor: '#E5E7EB' }}
                                        >
                                            <UploadCloud size={12} />
                                            <span>Import Data</span>
                                        </button>
                                        <input
                                            type="file"
                                            ref={importInputRef}
                                            onChange={handleJsonImport}
                                            accept=".json"
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </ContainerDevWrapper>
                </div>

                <div className="w-full h-px bg-gray-100 my-8"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContainerDevWrapper showClassNames={showClassNames} identity={{ displayName: "CountrySelect", type: "Field", value: String(formData.country), filePath: "state.formData.country" }}>
                        <IconSearchDropdown
                            label="Country"
                            value={formData.country}
                            options={countries}
                            onChange={(val) => setFormData({ ...formData, country: val })}
                            icon={MapPin}
                            themeState={safeTheme}
                            isOpen={activeDropdown === 'country'}
                            onToggle={toggleDropdown('country')}
                            disabled={isExtracting || readOnly}
                            required
                            searchable={false}
                            hideLayoutToggle={true}
                        />
                    </ContainerDevWrapper>

                    <ContainerDevWrapper showClassNames={showClassNames} identity={{ displayName: "LanguageSelect", type: "Field", value: String(formData.language), filePath: "state.formData.language" }}>
                        <IconSearchDropdown
                            label="Language"
                            value={formData.language}
                            options={languages}
                            onChange={(val) => setFormData({ ...formData, language: val })}
                            icon={Globe}
                            themeState={safeTheme}
                            isOpen={activeDropdown === 'language'}
                            onToggle={toggleDropdown('language')}
                            disabled={isExtracting || readOnly}
                            searchable={false}
                            hideLayoutToggle={true}
                        />
                    </ContainerDevWrapper>

                    <ContainerDevWrapper showClassNames={showClassNames} identity={{ displayName: "DateFormatSelect", type: "Field", value: String(formData.dateFormat), filePath: "state.formData.dateFormat" }}>
                        <IconSearchDropdown
                            label="Date Format"
                            value={formData.dateFormat}
                            options={dateFormats}
                            onChange={(val) => setFormData({ ...formData, dateFormat: val })}
                            icon={Calendar}
                            themeState={safeTheme}
                            isOpen={activeDropdown === 'dateFormat'}
                            onToggle={toggleDropdown('dateFormat')}
                            disabled={isExtracting || !formData.country || readOnly}
                            searchable={false}
                            hideLayoutToggle={true}
                        />
                    </ContainerDevWrapper>

                    <ContainerDevWrapper showClassNames={showClassNames} identity={{ displayName: "TimeFormatSelect", type: "Field", value: String(formData.timeFormat), filePath: "state.formData.timeFormat" }}>
                        <IconSearchDropdown
                            label="Time Format"
                            value={formData.timeFormat}
                            options={timeFormats}
                            onChange={(val) => setFormData({ ...formData, timeFormat: val })}
                            icon={Clock}
                            themeState={safeTheme}
                            isOpen={activeDropdown === 'timeFormat'}
                            onToggle={toggleDropdown('timeFormat')}
                            disabled={isExtracting || !formData.country || readOnly}
                            searchable={false}
                            hideLayoutToggle={true}
                        />
                    </ContainerDevWrapper>

                    <div className="md:col-span-2">
                        <ContainerDevWrapper showClassNames={showClassNames} identity={{ displayName: "TimezoneSelect", type: "Field", value: String(formData.timezone), filePath: "state.formData.timezone" }}>
                            <IconSearchDropdown
                                label="Time Zone"
                                value={formData.timezone}
                                options={timezones}
                                onChange={(val) => setFormData({ ...formData, timezone: val })}
                                icon={Clock}
                                themeState={safeTheme}
                                isOpen={activeDropdown === 'timezone'}
                                onToggle={toggleDropdown('timezone')}
                                disabled={isExtracting || readOnly}
                                searchable={false}
                                hideLayoutToggle={true}
                            />
                        </ContainerDevWrapper>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex justify-end">
                    {!readOnly && (
                        <Button
                            type="submit"
                            disabled={isExtracting || !formData.country || !formData.projectName || !formData.businessType}
                            themeState={safeTheme}
                            className="font-bold shadow-lg"
                            label={useAI ? "Generate & Continue" : "Next Step"}
                            iconTrailing={isExtracting ? undefined : ArrowRight}
                        />
                    )}
                </div>

            </form>

            {isExtracting && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-500 rounded-[2rem]">
                    <div className="w-full max-w-sm space-y-8 text-center">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: safeTheme.primary }}></div>
                            <div className="w-24 h-24 rounded-full border-4 border-gray-50 flex items-center justify-center bg-white relative z-10 shadow-lg">
                                <Zap size={32} style={{ color: safeTheme.primary }} fill="currentColor" />
                            </div>
                            <svg className="absolute inset-0 w-24 h-24 -rotate-90 z-20">
                                <circle
                                    cx="48" cy="48" r="44"
                                    fill="none"
                                    stroke={safeTheme.primary}
                                    strokeWidth="4"
                                    strokeDasharray="276"
                                    strokeDashoffset={276 - (276 * progress) / 100}
                                    className="transition-all duration-100 ease-linear"
                                />
                            </svg>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold mb-2" style={{ color: safeTheme.darkText }}>{statusText}</h3>
                            <p style={{ color: safeTheme.grayText }}>
                                {progress < 100 ? "Processing your assets..." : "Redirecting..."}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                            <div className={`h-1.5 rounded-full transition-colors duration-300 ${progress > 20 ? 'bg-green-500' : 'bg-gray-200'}`} />
                            <div className={`h-1.5 rounded-full transition-colors duration-300 ${progress > 50 ? 'bg-green-500' : 'bg-gray-200'}`} />
                            <div className={`h-1.5 rounded-full transition-colors duration-300 ${progress > 80 ? 'bg-green-500' : 'bg-gray-200'}`} />
                        </div>
                    </div>
                </div>
            )}
        </ContainerDevWrapper>
    );

    if (hideHeader) return SetupContent;

    return (
        <div className="flex h-full w-full overflow-hidden text-gray-900" style={{ fontFamily: safeTheme.fontFamily, backgroundColor: safeTheme.background2 }}>
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header theme={safeTheme} />
                <main className="flex-1 overflow-y-auto">
                    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-10 pb-20">
                        <ContainerDevWrapper showClassNames={showClassNames} identity={{ displayName: "ProjectSetupCanvas", type: "PageCanvas", filePath: "components/SetupPage.tsx" }}>
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {SetupContent}
                            </div>
                        </ContainerDevWrapper>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SetupPage;
