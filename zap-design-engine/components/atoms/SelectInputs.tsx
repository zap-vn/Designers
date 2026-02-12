import React, { useState, useRef, useEffect } from 'react';
import { ThemeState } from '../../types';
import {
    Search, X, Plus, ChevronDown, Check, Filter, AlignJustify, Grid, List,
    LayoutDashboard, User, Mail, Calendar, Shield, Settings, LayoutGrid
} from 'lucide-react';

export const SearchInputWidget = ({ themeState }: { themeState: ThemeState }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState(['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const filtered = items.filter(i => i.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClear = (e: React.MouseEvent) => { e.stopPropagation(); setQuery(''); setIsOpen(false); };
    const handleAdd = () => { if (query) { setItems([...items, query]); setQuery(query); setIsOpen(false); } };

    const variant = themeState.formVariant || 'outlined';
    const isActive = isOpen;
    const ringColor = (themeState.activeColor || themeState.primary);
    const borderColor = isActive ? ringColor : (variant === 'underlined' ? 'transparent' : (themeState.inputBorder || '#E5E7EB'));

    return (
        <div className="relative" ref={wrapperRef}>
            <label style={{ color: themeState.formLabelColor || themeState.darkText, fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: themeState.fontFamily }}>Search</label>
            <div className="relative w-full">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isOpen ? 'text-indigo-500' : 'text-gray-400'}`} style={{ color: isOpen ? (themeState.activeColor || themeState.primary) : undefined }}>
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search items..."
                    className="w-full outline-none transition-all"
                    style={{
                        backgroundColor: variant === 'filled' ? (themeState.inputFilledBg || '#F3F4F6') : (themeState.inputBg || '#FFFFFF'),
                        borderColor: borderColor,
                        borderBottomColor: variant === 'underlined' ? (isActive ? ringColor : (themeState.inputBorder || '#E5E7EB')) : borderColor,
                        borderWidth: variant === 'underlined' ? '0 0 2px 0' : '1px',
                        borderRadius: variant === 'underlined' ? '0' : `${themeState.borderRadius}px`,
                        paddingTop: `${themeState.inputPaddingY || 12}px`,
                        paddingBottom: `${themeState.inputPaddingY || 12}px`,
                        paddingLeft: '44px',
                        paddingRight: query ? '44px' : `${themeState.inputPaddingX || 16}px`,
                        color: themeState.formTextColor || themeState.darkText,
                        fontSize: '14px',
                        boxShadow: (isOpen && variant !== 'underlined') ? `0 0 0 ${themeState.formRingWidth || 4}px ${themeState.activeColor || themeState.primary}20` : 'none',
                        fontFamily: themeState.fontFamily
                    }}
                />
                {query && (
                    <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <X size={16} />
                    </button>
                )}
            </div>
            {isOpen && query && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200" style={{ borderRadius: `${themeState.borderRadius}px` }}>
                    {filtered.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto">
                            {filtered.map((item, idx) => (
                                <div key={idx} className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between" onClick={() => { setQuery(item); setIsOpen(false); }} style={{ fontFamily: themeState.fontFamily }}>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3">
                            <div className="text-center text-xs text-gray-400 mb-2 font-medium" style={{ fontFamily: themeState.fontFamily }}>No results for "{query}"</div>
                            <button onClick={handleAdd} className="w-full py-2.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: themeState.primary, color: themeState.primaryBtnText, fontFamily: themeState.fontFamily }}>
                                <Plus size={14} /> Add New Item
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const MultiSelectWidget = ({ themeState }: { themeState: ThemeState }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState<string[]>(['React', 'TypeScript']);
    const containerRef = useRef<HTMLDivElement>(null);
    const options = ['React', 'Vue', 'Angular', 'Svelte', 'TypeScript', 'Node.js', 'Tailwind', 'GraphQL'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        if (selectedValues.includes(option)) setSelectedValues(selectedValues.filter(s => s !== option));
        else setSelectedValues([...selectedValues, option]);
    };

    const removeOption = (option: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedValues(selectedValues.filter(s => s !== option));
    };

    const variant = themeState.formVariant || 'outlined';
    const isActive = isOpen;
    const ringColor = (themeState.activeColor || themeState.primary);
    const borderColor = isActive ? ringColor : (variant === 'underlined' ? 'transparent' : (themeState.inputBorder || '#E5E7EB'));

    return (
        <div className="relative" ref={containerRef}>
            <label style={{ color: themeState.formLabelColor || themeState.darkText, fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: themeState.fontFamily }}>Multi Select</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full min-h-[46px] flex items-center justify-between border transition-all cursor-pointer bg-white"
                style={{
                    backgroundColor: variant === 'filled' ? (themeState.inputFilledBg || '#F3F4F6') : (themeState.inputBg || '#FFFFFF'),
                    borderColor: borderColor,
                    borderBottomColor: variant === 'underlined' ? (isActive ? ringColor : (themeState.inputBorder || '#E5E7EB')) : borderColor,
                    borderWidth: variant === 'underlined' ? '0 0 2px 0' : '1px',
                    borderRadius: variant === 'underlined' ? '0' : `${themeState.borderRadius}px`,
                    padding: `4px ${themeState.inputPaddingX || 16}px`,
                    boxShadow: (isOpen && variant !== 'underlined') ? `0 0 0 ${themeState.formRingWidth || 4}px ${themeState.activeColor || themeState.primary}20` : 'none',
                }}
            >
                <div className="flex flex-wrap gap-1.5 flex-1 py-1">
                    {selectedValues.length > 0 ? (
                        selectedValues.map(val => (
                            <div key={val} className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded text-xs font-bold transition-colors animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: `${themeState.activeColor || themeState.primary}15`, color: themeState.activeColor || themeState.primary, fontFamily: themeState.fontFamily }}>
                                <span>{val}</span>
                                <div onClick={(e) => removeOption(val, e)} className="p-0.5 hover:bg-black/5 rounded-full cursor-pointer transition-colors">
                                    <X size={12} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <span className="text-sm py-1" style={{ color: themeState.formPlaceholderColor || '#9CA3AF', fontFamily: themeState.fontFamily }}>Select options...</span>
                    )}
                </div>
                <ChevronDown size={16} className={`text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200" style={{ borderRadius: `${themeState.borderRadius}px` }}>
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {options.map(option => {
                            const isSelected = selectedValues.includes(option);
                            return (
                                <button key={option} onClick={() => toggleOption(option)} className="w-full text-left px-3 py-2.5 text-sm rounded-md transition-colors flex items-center justify-between group hover:bg-gray-50" style={{ color: isSelected ? (themeState.activeColor || themeState.primary) : themeState.darkText }}>
                                    <span style={{ fontFamily: themeState.fontFamily, fontWeight: isSelected ? 600 : 400 }}>{option}</span>
                                    {isSelected && <Check size={14} className="shrink-0 animate-in zoom-in" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const DropdownSearchWidget = ({ themeState }: { themeState: ThemeState }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [items, setItems] = useState([
        { label: 'Web Development', category: 'Dev' },
        { label: 'Mobile App Design', category: 'Design' },
        { label: 'Cloud Hosting', category: 'Dev' },
        { label: 'Digital Marketing', category: 'Marketing' },
        { label: 'SEO Optimization', category: 'Marketing' },
        { label: 'Data Analytics', category: 'Data' }
    ]);
    const containerRef = useRef<HTMLDivElement>(null);
    const categories = ['All', 'Dev', 'Design', 'Marketing', 'Data'];

    const filteredItems = items.filter(i => {
        const matchesSearch = i.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || i.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddNew = () => { if (!searchQuery) return; const newItem = { label: searchQuery, category: 'Custom' }; setItems([...items, newItem]); setSelected(newItem.label); setSearchQuery(''); setIsOpen(false); setActiveFilter('All'); };

    const variant = themeState.formVariant || 'outlined';
    const isActive = isOpen;
    const ringColor = (themeState.activeColor || themeState.primary);
    const borderColor = isActive ? ringColor : (variant === 'underlined' ? 'transparent' : (themeState.inputBorder || '#E5E7EB'));

    return (
        <div className="relative" ref={containerRef}>
            <label style={{ color: themeState.formLabelColor || themeState.darkText, fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: themeState.fontFamily }}>Service Selection</label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between transition-all text-left group"
                style={{
                    backgroundColor: variant === 'filled' ? (themeState.inputFilledBg || '#F3F4F6') : (themeState.inputBg || '#FFFFFF'),
                    borderColor: borderColor,
                    borderBottomColor: variant === 'underlined' ? (isActive ? ringColor : (themeState.inputBorder || '#E5E7EB')) : borderColor,
                    borderWidth: variant === 'underlined' ? '0 0 2px 0' : '1px',
                    borderRadius: variant === 'underlined' ? '0' : `${themeState.borderRadius}px`,
                    padding: `${themeState.inputPaddingY || 12}px ${themeState.inputPaddingX || 16}px`,
                    boxShadow: (isOpen && variant !== 'underlined') ? `0 0 0 ${themeState.formRingWidth || 4}px ${themeState.activeColor || themeState.primary}20` : 'none',
                    color: selected ? (themeState.formTextColor || themeState.darkText) : (themeState.formPlaceholderColor || '#9CA3AF')
                }}
            >
                <span className="text-sm font-medium" style={{ fontFamily: themeState.fontFamily }}>{selected || 'Select Service'}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col" style={{ borderRadius: `${themeState.borderRadius}px` }}>
                    <div className="p-2 border-b border-gray-100 flex gap-2">
                        <div className="relative flex-1">
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-3 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none transition-colors focus:bg-white focus:border-purple-500" style={{ fontFamily: themeState.fontFamily, color: themeState.darkText }} autoFocus />
                        </div>
                        <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'}`} style={{ borderColor: showFilters ? themeState.primary : undefined, color: showFilters ? themeState.primary : undefined, backgroundColor: showFilters ? `${themeState.primary}10` : undefined }}>
                            <Filter size={14} />
                        </button>
                    </div>
                    {showFilters && (
                        <div className="px-2 py-2 border-b border-gray-100 flex gap-1.5 overflow-x-auto custom-scrollbar bg-gray-50/50">
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition-colors border ${activeFilter === cat ? 'border-transparent shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'}`} style={{ backgroundColor: activeFilter === cat ? themeState.primary : undefined, color: activeFilter === cat ? themeState.primaryBtnText : undefined }}>{cat}</button>
                            ))}
                        </div>
                    )}
                    <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                        {filteredItems.length > 0 ? (
                            <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-1" : "flex flex-col gap-0.5"}>
                                {filteredItems.map((item, idx) => (
                                    <button key={idx} onClick={() => { setSelected(item.label); setIsOpen(false); }} className={`text-left transition-colors rounded-md group ${viewMode === 'grid' ? 'p-3 flex flex-col items-center justify-center text-center border border-transparent hover:border-gray-200 hover:bg-gray-50' : 'px-3 py-2 flex items-center justify-between hover:bg-gray-50'}`} style={{ backgroundColor: selected === item.label ? `${themeState.primary}10` : undefined, color: selected === item.label ? themeState.primary : themeState.darkText }}>
                                        {viewMode === 'grid' && (
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2 font-bold text-gray-500 text-xs uppercase group-hover:bg-white group-hover:shadow-sm transition-all">{item.label.charAt(0)}</div>
                                        )}
                                        <div className="min-w-0">
                                            <div className={`text-xs ${selected === item.label ? 'font-bold' : 'font-medium'} truncate`} style={{ fontFamily: themeState.fontFamily }}>{item.label}</div>
                                            {viewMode === 'list' && (<div className="text-[9px] text-gray-400 mt-0.5">{item.category}</div>)}
                                        </div>
                                        {viewMode === 'list' && selected === item.label && (<Check size={14} className="shrink-0" />)}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-3">
                                <div className="text-center text-xs text-gray-400 mb-2 font-medium" style={{ fontFamily: themeState.fontFamily }}>No results for "{searchQuery}"</div>
                                {searchQuery && (
                                    <button onClick={handleAddNew} className="w-full py-2 rounded-lg text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: themeState.primary, color: themeState.primaryBtnText, fontFamily: themeState.fontFamily }}>
                                        <Plus size={12} /> Add "{searchQuery}"
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="p-2 border-t border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setViewMode('list'); }} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`} title="List View">
                            <AlignJustify size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setViewMode('grid'); }} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`} title="Grid View">
                            <Grid size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export interface IconOption {
    id: string | number;
    label: string;
    description?: string;
    image?: string;
    icon?: React.ElementType;
    value?: string | number;
}

interface IconSearchDropdownProps {
    label: string;
    value: string | number;
    options: IconOption[];
    onChange: (val: any) => void;
    themeState: ThemeState;
    isOpen: boolean;
    onToggle: () => void;
    disabled?: boolean;
    required?: boolean;
    icon?: React.ElementType; // Icon for the trigger
    searchable?: boolean;
    initialViewMode?: 'grid' | 'list';
    hideLayoutToggle?: boolean;
}

export const IconSearchDropdown: React.FC<IconSearchDropdownProps> = ({
    label,
    value,
    options,
    onChange,
    themeState,
    isOpen,
    onToggle,
    disabled = false,
    required = false,
    icon: TriggerIcon = Search,
    searchable = true,
    initialViewMode = 'list',
    hideLayoutToggle = false
}) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && searchable && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isOpen) setSearchQuery('');
    }, [isOpen, searchable]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onToggle();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onToggle]);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const selectedItem = options.find(i => i.value === value || i.label === value || i.id === value);
    const variant = themeState.formVariant || 'outlined';
    const isActive = isOpen;
    const ringColor = (themeState.activeColor || themeState.primary);
    const borderColor = isActive ? ringColor : (variant === 'underlined' ? 'transparent' : (themeState.inputBorder || '#E5E7EB'));

    return (
        <div className="relative" ref={containerRef}>
            <label style={{ color: themeState.formLabelColor || themeState.darkText, fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: themeState.fontFamily }}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <button
                type="button"
                onClick={!disabled ? onToggle : undefined}
                className={`w-full flex items-center justify-between transition-all text-left ${disabled ? 'opacity-70 cursor-not-allowed bg-gray-50' : 'cursor-pointer bg-white'}`}
                style={{
                    backgroundColor: variant === 'filled' ? (themeState.inputFilledBg || '#F3F4F6') : (themeState.inputBg || '#FFFFFF'),
                    borderColor: borderColor,
                    borderBottomColor: variant === 'underlined' ? (isActive ? ringColor : (themeState.inputBorder || '#E5E7EB')) : borderColor,
                    borderWidth: variant === 'underlined' ? '0 0 2px 0' : '1px',
                    borderRadius: variant === 'underlined' ? '0' : `${themeState.borderRadius}px`,
                    padding: selectedItem?.description ? '10px 16px' : `${themeState.inputPaddingY || 12}px ${themeState.inputPaddingX || 16}px`,
                    boxShadow: (isOpen && variant !== 'underlined') ? `0 0 0 ${themeState.formRingWidth || 4}px ${themeState.activeColor || themeState.primary}20` : 'none',
                    color: themeState.formTextColor || themeState.darkText
                }}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {selectedItem?.image ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                            <img src={selectedItem.image} alt={selectedItem.label} className="w-full h-full object-cover" />
                        </div>
                    ) : selectedItem?.icon ? (
                        <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
                            <selectedItem.icon size={18} style={{ color: themeState.primary }} />
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
                            <TriggerIcon size={18} style={{ color: themeState.primary }} />
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="text-sm font-bold truncate leading-tight" style={{ fontFamily: themeState.fontFamily }}>
                            {selectedItem?.label || 'Select Option'}
                        </div>
                        {selectedItem?.description && (
                            <div className="text-[11px] text-gray-500 truncate mt-0.5 leading-none">{selectedItem.description}</div>
                        )}
                    </div>
                </div>
                <ChevronDown size={18} className={`text-gray-400 shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 p-2" style={{ borderRadius: `${themeState.borderRadius}px` }}>
                    {searchable && (
                        <div className="px-2 pb-2 mb-2 border-b border-gray-100">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-gray-50 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:bg-white focus:ring-1 transition-all"
                                    style={{
                                        color: themeState.darkText,
                                        fontFamily: themeState.fontFamily,
                                        borderColor: '#E5E7EB'
                                    }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    )}
                    {!hideLayoutToggle && (
                        <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Layout</span>
                            <div className="flex bg-gray-100 rounded-lg p-0.5">
                                <button type="button" onClick={(e) => { e.stopPropagation(); setViewMode('list'); }} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <List size={12} />
                                </button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); setViewMode('grid'); }} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <LayoutGrid size={12} />
                                </button>
                            </div>
                        </div>
                    )}
                    <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar" : "flex flex-col gap-1 max-h-68 overflow-y-auto p-1 custom-scrollbar"}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(item => {
                                const isSelected = item.value === value || item.id === value;
                                const ItemIcon = item.icon || TriggerIcon;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange(item.value || item.id);
                                            onToggle();
                                        }}
                                        className={`rounded-lg transition-all hover:bg-gray-50 group border ${viewMode === 'grid' ? 'flex flex-col items-center justify-center gap-2 p-3 text-center' : 'flex items-center gap-3 p-2.5 w-full text-left'}`}
                                        style={{
                                            backgroundColor: isSelected ? `${themeState.primary}10` : 'transparent',
                                            borderColor: isSelected ? `${themeState.primary}30` : 'transparent'
                                        }}
                                    >
                                        <div className={`shrink-0 flex items-center justify-center ${viewMode === 'grid' ? 'w-12 h-12 rounded-xl mb-1' : 'w-10 h-10 rounded-full'} bg-gray-100 group-hover:bg-white transition-colors overflow-hidden border border-transparent group-hover:border-gray-100`}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                                            ) : (
                                                <ItemIcon size={viewMode === 'grid' ? 24 : 18} style={{ color: isSelected ? themeState.primary : themeState.grayText }} />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className={viewMode === 'grid' ? "text-[10px] font-bold truncate" : "text-sm font-bold truncate"} style={{ color: isSelected ? themeState.primary : themeState.darkText, fontFamily: themeState.fontFamily }}>
                                                {item.label}
                                            </div>
                                            {viewMode === 'list' && item.description && (
                                                <div className="text-[11px] text-gray-500 truncate mt-0.5">{item.description}</div>
                                            )}
                                        </div>
                                        {viewMode === 'list' && isSelected && (<Check size={18} className="ml-auto animate-in zoom-in" style={{ color: themeState.primary }} />)}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-8 text-center text-xs text-gray-400 font-medium">No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
