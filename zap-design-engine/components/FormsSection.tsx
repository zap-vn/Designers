
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ThemeState } from '../types';
import {
    Mail, Lock, Eye, Search, Filter, Calendar, Clock, Minus, Plus,
    AlignLeft, LayoutDashboard, LayoutTemplate, ChevronDown, User, Check,
    LogOut, LogIn, AlignJustify, Grid, Box, Copy, X, ChevronLeft, ChevronRight, AlertCircle, Circle,
    Settings, Shield, FileText, Image, BarChart, LayoutGrid, List, Sliders, Code2, MousePointerClick,
    Camera, Bell, Loader2
} from 'lucide-react';
import ColorPicker from './ColorPicker';
import { PhoneNumberInput } from './PhoneNumberInput';
import { CurrencyInput } from './CurrencyInput';
import { StarRatingInput } from './StarRatingInput';
import { CreditCardInput } from './CreditCardInput';
import { TagInput } from './TagInput';
import { ImageUploadDropzone } from './ImageUploadDropzone';
import { DateRangePicker } from './DateRangePicker';
import { OTPInput } from './OTPInput';
import { Avatar } from './Avatar'; // Import the new component
import { DevDocBanner, EnhancedDevContext, ContainerDevWrapper, DevWrapperContext } from './DevDocBanner';
import { InspectorHeader } from './InspectorHeader';
import { SliderWidget } from './atoms/SliderWidget';

// Atoms
import { StandardInput } from './atoms/StandardInput';
import { QuantityStepper, ModernStepper } from './atoms/Steppers';
import { SegmentControl, CheckboxGroup, RadioGroup, ToggleGroup } from './atoms/SelectionControls';
import { SearchInputWidget, MultiSelectWidget, DropdownSearchWidget, IconSearchDropdown } from './atoms/SelectInputs';
import { UserSessionSelector, ProfileSwitcher, AvatarWidget } from './atoms/UserWidgets';
import { Pagination } from './atoms/Pagination';

// ... (Keep existing Helper Components: FormElementPreview, PhoneNumberInput, etc.) ...

interface FormsSectionProps {
    themeState: ThemeState;
    showClassNames?: boolean;
    setShowClassNames?: (show: boolean) => void;
}

export interface FormElementPreviewProps {
    label: string;
    classLabel: string;
    showClassNames: boolean;
    children: React.ReactNode;
    alwaysShowLabel?: boolean;
    // Enhanced Dev Mode Props
    componentName?: string;
    stateVar?: string;
    filePath?: string;
    parentComponent?: string;
}

export const FormElementPreview: React.FC<FormElementPreviewProps> = ({
    label,
    classLabel,
    showClassNames,
    alwaysShowLabel,
    children,
    componentName = 'UnknownComponent',
    stateVar = 'internalState',
    filePath = 'components/FormsSection.tsx',
    parentComponent = 'FormsSection'
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const snippet = `"displayName": "${componentName}", "filePath": "${filePath}", "parentComponent": "${parentComponent}" I want to ....`;
        navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyClass = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(classLabel);
        // setCopied(true); // Optional: separate copy state for class?
        // setTimeout(() => setCopied(false), 2000);
    };

    // Dev Mode: Inspect Children for Props & Validation
    let debugProps: Record<string, any> = {};
    let validationRules: Record<string, any> = {};

    if (showClassNames && React.isValidElement(children)) {
        const childProps = children.props as Record<string, any>;

        // Extract relevant visual/state props
        const relevantKeys = ['label', 'type', 'placeholder', 'value', 'defaultValue', 'hasError', 'errorText', 'readOnly', 'disabled'];
        relevantKeys.forEach(key => {
            if (childProps[key] !== undefined && childProps[key] !== '') {
                debugProps[key] = childProps[key];
            }
        });

        // Extract validation rules
        if (childProps.required) validationRules['Required'] = 'true';
        if (childProps.pattern) validationRules['Pattern'] = childProps.pattern.toString();
        if (childProps.minLength) validationRules['Min'] = childProps.minLength;
        if (childProps.maxLength) validationRules['Max'] = childProps.maxLength;
        if (childProps.hasError) validationRules['Error'] = 'Active';
        if (childProps.type === 'email') validationRules['Type'] = 'Email';
        if (childProps.type === 'password') validationRules['Mask'] = 'True';
    }

    return (
        <div className={`group relative ${showClassNames ? 'pt-2' : ''}`}>
            <ContainerDevWrapper
                showClassNames={showClassNames}
                identity={{
                    displayName: componentName,
                    filePath: filePath,
                    parentComponent: parentComponent,
                    type: "Atom/Token", // Level 7: Token
                    architecture: "SYSTEMS // ENTRY",
                    value: label // Use label to make each instance unique
                }}
                atomic="Atom"
                className={`relative transition-all duration-200 ${showClassNames ? 'mt-4' : ''}`}
            >
                <FormElementInternalContent label={label} classLabel={classLabel} showClassNames={showClassNames} alwaysShowLabel={alwaysShowLabel ?? false} validationRules={validationRules}>
                    {children}
                </FormElementInternalContent>
            </ContainerDevWrapper>
        </div>
    );
};

// Sub-component to consume context and render labels
const FormElementInternalContent: React.FC<{
    label: string,
    classLabel: string,
    showClassNames: boolean,
    alwaysShowLabel: boolean,
    validationRules: Record<string, any>,
    children: React.ReactNode
}> = ({ label, classLabel, showClassNames, alwaysShowLabel, validationRules, children }) => {
    const { isHovered, isLocked } = React.useContext(DevWrapperContext) as { isHovered: boolean, isLocked: boolean };
    const visible = isHovered || isLocked || alwaysShowLabel;

    return (
        <>
            {/* Visual Label (Label above component) */}
            {visible && (
                <div className="flex items-center justify-between mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
                    {/* Class Label badge moved here if showClassNames */}
                    {showClassNames && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{classLabel}</span>}
                </div>
            )}

            {children}

            {/* Validation Overlay - Preserved as internal detail */}
            {visible && showClassNames && Object.keys(validationRules).length > 0 && (
                <div className="absolute -bottom-3 right-3 px-2 py-0.5 bg-orange-600 text-white text-[9px] font-mono font-bold rounded shadow-lg z-20 flex items-center gap-2 cursor-help pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-200" title="Active Validation Rules">
                    <AlertCircle size={10} />
                    <div className="flex gap-2 divide-x divide-white/20">
                        {Object.entries(validationRules).map(([k, v]) => (
                            <span key={k} className="pl-2 first:pl-0 flex gap-1">
                                <span className="opacity-70">{k}:</span>
                                <span>{v}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};




const FormsSection: React.FC<FormsSectionProps> = ({ themeState, showClassNames = false, setShowClassNames }) => {
    // Interactive State
    const [demoColor, setDemoColor] = useState(themeState.primary);
    const [phoneValue, setPhoneValue] = useState('0912345678');
    const [currencyValue, setCurrencyValue] = useState('1250000.00');
    const [ratingValue, setRatingValue] = useState(4);
    const [ccValue, setCcValue] = useState('4242 4242 4242 4242');
    const [tags, setTags] = useState<string[]>(['Gluten Free', 'Vegan', 'Organic']);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [dateValue, setDateValue] = useState('1/25/2026');
    const [showCalendar, setShowCalendar] = useState(false);

    // Navigation Dropdown State
    const [navigationValue, setNavigationValue] = useState('dashboard');
    const [showNavigationDropdown, setShowNavigationDropdown] = useState(false);

    const calendarRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(new Date(2026, 0, 25));
    const [rangeStart, setRangeStart] = useState<Date | null>(new Date(2026, 1, 6));
    const [rangeEnd, setRangeEnd] = useState<Date | null>(new Date(2026, 1, 13));
    const [timeValue, setTimeValue] = useState('10:30');
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const timeDropdownRef = useRef<HTMLDivElement>(null);
    const [otpValue, setOtpValue] = useState('123456');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const timeOptions = useMemo(() => { const options = []; for (let i = 0; i < 24; i++) { const hour = i; options.push(`${hour < 10 ? '0' + hour : hour}:00`); options.push(`${hour < 10 ? '0' + hour : hour}:30`); } return options; }, []);
    const handleCalendarNav = (dir: 'next' | 'prev', e: React.MouseEvent) => { e.stopPropagation(); const newDate = new Date(viewDate); newDate.setMonth(viewDate.getMonth() + (dir === 'next' ? 1 : -1)); setViewDate(newDate); };
    const handleDayClick = (day: number) => { const newDate = new Date(currentYear, currentMonth, day); setDateValue(`${newDate.getMonth() + 1}/${newDate.getDate()}/${newDate.getFullYear()}`); setShowCalendar(false); };
    useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setShowCalendar(false); if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) setShowTimeDropdown(false); }; document.addEventListener('click', handleClickOutside); return () => document.removeEventListener('click', handleClickOutside); }, []);
    useEffect(() => { const styleId = 'dynamic-placeholder-styles'; let styleTag = document.getElementById(styleId); if (!styleTag) { styleTag = document.createElement('style'); styleTag.id = styleId; document.head.appendChild(styleTag); } styleTag.innerHTML = ` .custom-placeholder::placeholder { color: ${themeState.formPlaceholderColor || '#9CA3AF'} !important; opacity: 1; } .custom-placeholder::-webkit-input-placeholder { color: ${themeState.formPlaceholderColor || '#9CA3AF'} !important; } .custom-placeholder::-moz-placeholder { color: ${themeState.formPlaceholderColor || '#9CA3AF'} !important; } `; }, [themeState.formPlaceholderColor]);

    return (
        <ContainerDevWrapper
            showClassNames={showClassNames}
            identity={{
                displayName: "FormsSection",
                filePath: "components/FormsSection.tsx",
                parentComponent: "App",
                type: "Region/Zone", // Level 4: Zone
                architecture: "ARCHITECTURE // SYSTEMS // FORMS"
            }}
            atomic="Organism"
            className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-300 relative"
        >

            <DevDocBanner
                visible={!!showClassNames}
                devContext={{
                    identity: {
                        displayName: "FormsSection",
                        filePath: "components/FormsSection.tsx",
                        parentComponent: "App",
                        htmlTag: "section",
                        type: "Region/Zone"
                    },
                    structure: {
                        structuralRole: "Region/Zone", // Level 4: Zone
                        architecture: "ARCHITECTURE // SYSTEMS // FORMS"
                    },
                    state: {
                        sourceVar: "themeState",
                        dataType: "ThemeState",
                        handlerProp: "setThemeState"
                    },
                    styling: {
                        tailwindClasses: "max-w-5xl mx-auto space-y-12",
                        themeTokens: ["formVariant", "formLabelStyle", "formDensity", "inputBg", "borderRadius"]
                    }
                }}
                context="canvas"
            />

            <InspectorHeader
                title="Form System"
                badge="Canvas"
                showClassNames={!!showClassNames}
                showInspectorToggle={false}
            />

            {/* Description (Preserved below header) */}
            <div className="mb-8">
                <p className="text-gray-500">Standardized input fields, selectors, and form patterns.</p>
                {themeState.formSimulateData && (
                    <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        <Check size={12} /> Data Simulation Active
                    </div>
                )}
            </div>

            {/* Section 1: Components Grid */}
            <ContainerDevWrapper
                showClassNames={showClassNames}
                identity={{
                    displayName: "InputGrid",
                    type: "Organism/Block", // Level 5: Block
                    architecture: "SYSTEMS // INPUT GRID",
                    filePath: "components/FormsSection.tsx"
                }}
            >
                <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <div className="mb-8 pb-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold" style={{ color: themeState.darkText }}>Input Elements</h3>
                        <div className="text-xs text-gray-400 font-mono">
                            {themeState.formVariant} • {themeState.formLabelStyle} • {themeState.formDensity}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">

                        <FormElementPreview label="Standard Input" classLabel=".input-field" showClassNames={showClassNames ?? false} componentName="StandardInput" stateVar="uncontrolled">
                            <StandardInput themeState={themeState} label="Full Name" type="text" placeholder="Enter full name" />
                        </FormElementPreview>

                        <FormElementPreview label="Email (Error State)" classLabel=".input-error" showClassNames={showClassNames ?? false} componentName="StandardInput" stateVar="uncontrolled">
                            <StandardInput
                                themeState={themeState}
                                label="Email Address"
                                icon={Mail}
                                type="email"
                                defaultValue="invalid-email"
                                hasError={true}
                                errorText="Please enter a valid email address."
                            />
                        </FormElementPreview>

                        <FormElementPreview label="Secure Password" classLabel=".input-password" showClassNames={showClassNames ?? false} componentName="StandardInput" stateVar="uncontrolled">
                            <StandardInput themeState={themeState} label="Password" icon={Lock} rightIcon={Eye} type="password" placeholder="••••••••" />
                        </FormElementPreview>

                        <FormElementPreview label="Phone Number" classLabel=".input-phone" showClassNames={showClassNames ?? false} componentName="PhoneNumberInput" stateVar="phoneValue">
                            <PhoneNumberInput
                                themeState={themeState}
                                label="Phone Number"
                                value={phoneValue}
                                onChange={setPhoneValue}
                            />
                        </FormElementPreview>

                        <FormElementPreview label="Currency / Price" classLabel=".input-currency" showClassNames={showClassNames ?? false} componentName="CurrencyInput" stateVar="currencyValue">
                            <CurrencyInput
                                themeState={themeState}
                                label="Price"
                                value={currencyValue}
                                onChange={setCurrencyValue}
                                placeholder="0.00"
                            />
                        </FormElementPreview>

                        <FormElementPreview label="Credit Card" classLabel=".input-cc" showClassNames={showClassNames ?? false} componentName="CreditCardInput" stateVar="ccValue">
                            <CreditCardInput
                                themeState={themeState}
                                label="Card Number"
                                value={ccValue}
                                onChange={setCcValue}
                                placeholder="0000 0000 0000 0000"
                            />
                        </FormElementPreview>

                        <FormElementPreview label="Star Rating" classLabel=".input-rating" showClassNames={showClassNames ?? false} componentName="StarRatingInput" stateVar="ratingValue">
                            <StarRatingInput
                                themeState={themeState}
                                label="Rating"
                                value={ratingValue}
                                onChange={setRatingValue}
                                showValueLabel={true}
                            />
                        </FormElementPreview>

                        <FormElementPreview label="Tag Input" classLabel=".input-tags" showClassNames={showClassNames ?? false} componentName="TagInput" stateVar="tags">
                            <TagInput
                                themeState={themeState}
                                label="Allergens"
                                tags={tags}
                                onChange={setTags}
                                placeholder="Add allergen..."
                            />
                        </FormElementPreview>

                        <FormElementPreview label="Image Upload" classLabel=".input-dropzone" showClassNames={showClassNames ?? false} componentName="ImageUploadDropzone" stateVar="uploadedFiles">
                            <ImageUploadDropzone
                                themeState={themeState}
                                files={uploadedFiles}
                                onFilesChange={setUploadedFiles}
                                label="Product Images"
                            />
                        </FormElementPreview>

                        <FormElementPreview label="Search Input" classLabel=".input-search" showClassNames={showClassNames ?? false} componentName="SearchInputWidget" stateVar="internal">
                            <SearchInputWidget themeState={themeState} />
                        </FormElementPreview>

                        <FormElementPreview label="Dropdown Search" classLabel=".dropdown-search" showClassNames={showClassNames ?? false} componentName="DropdownSearchWidget" stateVar="internal">
                            <DropdownSearchWidget themeState={themeState} />
                        </FormElementPreview>

                        <FormElementPreview label="Multi Select" classLabel=".input-multiselect" showClassNames={showClassNames ?? false} componentName="MultiSelectWidget" stateVar="internal">
                            <MultiSelectWidget themeState={themeState} />
                        </FormElementPreview>

                        <FormElementPreview label="Quick Navigate" classLabel=".quick-navigate" showClassNames={showClassNames ?? false} componentName="IconSearchDropdown" stateVar="navigationValue">
                            <IconSearchDropdown
                                label="Navigation"
                                value={navigationValue}
                                options={[
                                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, value: 'dashboard' },
                                    { id: 'profile', label: 'Profile', icon: User, value: 'profile' },
                                    { id: 'messages', label: 'Messages', icon: Mail, value: 'messages' },
                                    { id: 'calendar', label: 'Calendar', icon: Calendar, value: 'calendar' },
                                    { id: 'security', label: 'Security', icon: Shield, value: 'security' },
                                    { id: 'settings', label: 'Settings', icon: Settings, value: 'settings' }
                                ]}
                                onChange={(val) => setNavigationValue(val)}
                                themeState={themeState}
                                isOpen={showNavigationDropdown}
                                onToggle={() => setShowNavigationDropdown(!showNavigationDropdown)}
                            />
                        </FormElementPreview>

                        <FormElementPreview label="Date Picker" classLabel=".date-picker" showClassNames={showClassNames ?? false} componentName="StandardInput (Date)" stateVar="dateValue">
                            <div className="relative" ref={calendarRef}>
                                <StandardInput
                                    themeState={themeState}
                                    label="Select Date"
                                    value={dateValue}
                                    rightIcon={Calendar}
                                    readOnly
                                    onClick={() => setShowCalendar(!showCalendar)}
                                    active={showCalendar}
                                />
                                {showCalendar && (
                                    <div className="absolute top-full left-0 w-full mt-2 p-4 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <button onClick={(e) => handleCalendarNav('prev', e)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><ChevronLeft size={16} /></button>
                                            <span className="font-bold text-sm text-gray-900">{monthNames[currentMonth]} {currentYear}</span>
                                            <button onClick={(e) => handleCalendarNav('next', e)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><ChevronRight size={16} /></button>
                                        </div>
                                        <div className="grid grid-cols-7 mb-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {[...Array(firstDayOfWeek)].map((_, i) => <div key={`empty-${i}`} />)}
                                            {[...Array(daysInMonth)].map((_, i) => {
                                                const day = i + 1;
                                                const isSelected = day === parseInt(dateValue.split('/')[1]);
                                                return (
                                                    <button
                                                        key={day}
                                                        onClick={() => handleDayClick(day)}
                                                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all ${isSelected ? 'font-bold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
                                                        style={{ backgroundColor: isSelected ? themeState.primary : undefined, color: isSelected ? themeState.primaryBtnText : undefined }}
                                                    >
                                                        {day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FormElementPreview>

                        <FormElementPreview label="Date Range Picker" classLabel=".date-range-picker" showClassNames={showClassNames ?? false} componentName="DateRangePicker" stateVar="rangeStart/End">
                            <DateRangePicker
                                themeState={themeState}
                                label="Trip Duration"
                                startDate={rangeStart}
                                endDate={rangeEnd}
                                onChange={(start, end) => { setRangeStart(start); setRangeEnd(end); }}
                            />
                        </FormElementPreview>

                        <FormElementPreview label="Time Picker" classLabel=".time-picker" showClassNames={showClassNames ?? false} componentName="StandardInput (Time)" stateVar="timeValue">
                            <div className="relative" ref={timeDropdownRef}>
                                <StandardInput
                                    themeState={themeState}
                                    label="Select Time"
                                    value={timeValue}
                                    rightIcon={Clock}
                                    readOnly
                                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                                    active={showTimeDropdown}
                                />
                                {showTimeDropdown && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto custom-scrollbar">
                                        <div className="grid grid-cols-2">
                                            {timeOptions.map((t) => (
                                                <div
                                                    key={t}
                                                    onClick={() => { setTimeValue(t); setShowTimeDropdown(false); }}
                                                    className="px-4 py-2.5 cursor-pointer text-sm flex items-center justify-between transition-colors border-b border-gray-50 last:border-0 even:border-l hover:bg-gray-50"
                                                    style={{ color: timeValue === t ? themeState.primary : themeState.darkText, fontWeight: timeValue === t ? 'bold' : 'normal', backgroundColor: timeValue === t ? `${themeState.primary}10` : undefined }}
                                                >
                                                    <span>{t}</span>
                                                    {timeValue === t && <Check size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FormElementPreview>

                        <FormElementPreview label="Quantity Stepper" classLabel=".quantity-stepper" showClassNames={showClassNames ?? false} componentName="QuantityStepper" stateVar="internal">
                            <QuantityStepper themeState={themeState} label="Guests" />
                        </FormElementPreview>

                        <FormElementPreview label="Modern Stepper" classLabel=".modern-stepper" showClassNames={showClassNames ?? false} componentName="ModernStepper" stateVar="internal">
                            <ModernStepper themeState={themeState} label="Quantity" />
                        </FormElementPreview>

                        <FormElementPreview label="OTP / PIN Code" classLabel=".input-otp" showClassNames={showClassNames ?? false} componentName="OTPInput" stateVar="otpValue">
                            <div className="relative">
                                <label style={{
                                    color: themeState.formLabelColor || themeState.darkText,
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    marginBottom: '6px',
                                    display: 'block',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontFamily: themeState.fontFamily
                                }}>Security Code</label>
                                <OTPInput
                                    themeState={themeState}
                                    value={otpValue}
                                    onChange={setOtpValue}
                                    length={6}
                                />
                            </div>
                        </FormElementPreview>

                        <FormElementPreview label="Segment Control" classLabel=".segment-control" showClassNames={showClassNames ?? false} componentName="SegmentControl" stateVar="internal">
                            <SegmentControl themeState={themeState} label="Frequency" options={['Daily', 'Weekly', 'Monthly']} />
                        </FormElementPreview>

                        <FormElementPreview label="Slider (Standard)" classLabel=".slider-standard" showClassNames={showClassNames ?? false} componentName="SliderWidget" stateVar="internal">
                            <SliderWidget themeState={themeState} label="Volume" defaultValue={30} />
                        </FormElementPreview>

                        <FormElementPreview label="Slider (Stepped)" classLabel=".slider-stepped" showClassNames={showClassNames ?? false} componentName="SliderWidget" stateVar="internal">
                            <SliderWidget
                                themeState={themeState}
                                label="Opacity"
                                defaultValue={75}
                                withMarkers={true}
                                step={25}
                                note="Discrete steps: 0, 25, 50, 75, 100. Useful for selecting fixed tiers."
                            />
                        </FormElementPreview>

                        <FormElementPreview label="Read Only" classLabel=".input-readonly" showClassNames={showClassNames ?? false} componentName="StandardInput" stateVar="static">
                            <StandardInput themeState={themeState} label="License Key" type="text" value="XXXX-YYYY-ZZZZ" readOnly />
                        </FormElementPreview>

                        <FormElementPreview label="User Session" classLabel=".user-session-widget" showClassNames={showClassNames ?? false} componentName="UserSessionSelector" stateVar="internal">
                            <UserSessionSelector themeState={themeState} />
                        </FormElementPreview>

                        <FormElementPreview label="Profile Switcher" classLabel=".profile-switcher-widget" showClassNames={showClassNames ?? false} componentName="ProfileSwitcher" stateVar="internal">
                            <ProfileSwitcher themeState={themeState} />
                        </FormElementPreview>

                        {/* NEW AVATAR WIDGET */}
                        <FormElementPreview label="Avatar" classLabel=".avatar-widget" showClassNames={showClassNames ?? false} componentName="AvatarWidget" stateVar="internal">
                            <AvatarWidget themeState={themeState} />
                        </FormElementPreview>

                        <FormElementPreview label="Color Input" classLabel=".input-color" showClassNames={showClassNames ?? false} componentName="ColorPicker" stateVar="demoColor">
                            <div className="relative">
                                <label style={{
                                    color: themeState.formLabelColor || themeState.darkText,
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    marginBottom: '6px',
                                    display: 'block',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontFamily: themeState.fontFamily
                                }}>Brand Color</label>
                                <ColorPicker
                                    label="Brand Color"
                                    value={demoColor}
                                    onChange={setDemoColor}
                                />
                            </div>
                        </FormElementPreview>

                        <FormElementPreview label="Checkbox" classLabel=".checkbox" showClassNames={showClassNames ?? false} alwaysShowLabel componentName="CheckboxGroup" stateVar="internal">
                            <CheckboxGroup themeState={themeState} />
                        </FormElementPreview>

                        <FormElementPreview label="Radio Button" classLabel=".radio-button" showClassNames={showClassNames ?? false} alwaysShowLabel componentName="RadioGroup" stateVar="internal">
                            <RadioGroup themeState={themeState} />
                        </FormElementPreview>

                        <FormElementPreview label="Toggle Switch" classLabel=".toggle-switch" showClassNames={showClassNames ?? false} alwaysShowLabel componentName="ToggleGroup" stateVar="internal">
                            <ToggleGroup themeState={themeState} />
                        </FormElementPreview>

                        <FormElementPreview label="Text Area" classLabel=".input-textarea" showClassNames={showClassNames ?? false} componentName="StandardInput" stateVar="uncontrolled">
                            <StandardInput themeState={themeState} label="Description" multiline maxLength={500} placeholder="Enter detailed description..." />
                        </FormElementPreview>

                    </div>
                </section>
            </ContainerDevWrapper>
        </ContainerDevWrapper>
    );
};

export default FormsSection;
