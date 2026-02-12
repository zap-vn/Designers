import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, Zap, Eye, EyeOff, Building2, AlertCircle } from 'lucide-react';
import { ThemeState } from '../types';
import Header from './Header';
import { loginApi } from '../services/login/login.service';
import { useStore } from '../store';
import { StandardInput } from './atoms/StandardInput';
import { Button } from './atoms/Button';

interface LoginScreenProps {
    onLogin: () => void;
    themeState: ThemeState;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, themeState }) => {
    const [merchantName, setMerchantName] = useState('pho24');
    const [email, setEmail] = useState('admin@pho24.vn');
    const [password, setPassword] = useState('backend3.0');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    // Refs for auto-focus on error
    const merchantRef = React.useRef<HTMLInputElement>(null);
    const emailRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);

    const { setAuthData, setIsSetupComplete } = useStore();

    // Reset general error when form changes
    useEffect(() => {
        if (generalError) setGeneralError(null);
    }, [merchantName, email, password]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        let firstErrorField: React.RefObject<HTMLInputElement | null> | null = null;

        // Merchant Name validation
        if (!merchantName.trim()) {
            newErrors.merchantName = 'Please enter your merchant name.';
            if (!firstErrorField) firstErrorField = merchantRef;
        }

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Email address is required.';
            if (!firstErrorField) firstErrorField = emailRef;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
            if (!firstErrorField) firstErrorField = emailRef;
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Please enter your password.';
            if (!firstErrorField) firstErrorField = passwordRef;
        }

        setErrors(newErrors);

        // Auto focus the first error field
        if (firstErrorField?.current) {
            firstErrorField.current.focus();
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleMerchantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setMerchantName(value);
        if (errors.merchantName) {
            setErrors(prev => ({ ...prev, merchantName: '' }));
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        setGeneralError(null);

        try {
            const response = await loginApi.loginV4({
                UserName: email,
                Password: password,
                MerchantName: merchantName,
                IsRemember: true
            });

            // Lưu dữ liệu Auth và reset Setup Status
            setAuthData(response);
            setIsSetupComplete(false); // Buộc người dùng vào trang Setup sau khi login

            onLogin();
        } catch (err: any) {
            // Mapping API errors to specific fields if possible, or general error
            const msg = err.message || '';
            if (msg.toLowerCase().includes('merchant')) {
                setErrors(prev => ({ ...prev, merchantName: err.message }));
            } else if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('credential')) {
                setErrors(prev => ({ ...prev, password: 'Incorrect email or password.' }));
            } else {
                setGeneralError(err.message || 'Authentication failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isFormEmpty = !merchantName.trim() || !email.trim() || !password.trim();

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#F9FAFB]" style={{ fontFamily: themeState.fontFamily }}>
            <Header
                title="ZAP"
                layout="minimal"
                theme={themeState}
                showLogin={false}
                showUser={false}
                disableSticky={true}
                className="bg-transparent border-transparent"
            />

            <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4 pb-20">
                {/* Modern Background Accents */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-pulse" style={{ backgroundColor: `${themeState.secondary}` }}></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-pulse delay-700" style={{ backgroundColor: '#E0E7FF' }}></div>
                </div>

                <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12 relative z-10 transition-all">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform -rotate-3 transition-transform hover:rotate-0">
                            <Zap size={32} className="text-white" fill="currentColor" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-gray-500 font-medium">Sign in to your account</p>
                    </div>

                    {generalError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] rounded-xl font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                            <AlertCircle size={14} className="shrink-0" />
                            {generalError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        <StandardInput
                            ref={merchantRef}
                            themeState={themeState}
                            label="MERCHANT NAME"
                            icon={Building2}
                            value={merchantName}
                            onChange={handleMerchantChange}
                            placeholder="e.g. pho24"
                            hasError={!!errors.merchantName}
                            errorText={errors.merchantName}
                        />

                        <StandardInput
                            ref={emailRef}
                            themeState={themeState}
                            label="EMAIL ADDRESS"
                            icon={Mail}
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="name@company.com"
                            hasError={!!errors.email}
                            errorText={errors.email}
                        />

                        <div className="relative">
                            <StandardInput
                                ref={passwordRef}
                                themeState={themeState}
                                label="PASSWORD"
                                icon={Lock}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                                }}
                                placeholder="••••••••"
                                hasError={!!errors.password}
                                errorText={errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-4 ${errors.password ? 'top-[36px]' : 'top-[42px]'} text-gray-400 hover:text-gray-900 transition-all z-20`}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || isFormEmpty}
                            themeState={themeState}
                            className="w-full mt-4 group"
                            label={isLoading ? "Authenticating..." : "Sign In"}
                            iconTrailing={isLoading ? undefined : ArrowRight}
                        />
                    </form>

                    <div className="mt-10 text-center border-t border-gray-50 pt-8">
                        <p className="text-xs text-gray-400 font-medium">
                            First time here? <a href="#" className="text-gray-900 underline font-bold decoration-indigo-500/30 hover:decoration-indigo-500">Contact Administrator</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
