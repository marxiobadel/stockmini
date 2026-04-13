import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Store } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Connectez-vous à votre compte" description="Entrez votre email et votre mot de passe ci-dessous pour vous connecter">
            <Head title="Connexion" />

            <div className="flex lg:hidden items-center gap-3 mb-10">
                <div className="bg-blue-50 p-3 rounded-xl">
                    <Store className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{import.meta.env.VITE_APP_NAME}</h2>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Gros & Détail</p>
                </div>
            </div>

            <div className="text-center lg:text-left mb-10">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Bon retour !
                </h2>
                <p className="text-slate-500 mt-3 text-base">
                    Veuillez vous connecter pour accéder à votre espace de ventes.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                        Adresse e-mail
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            tabIndex={1}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-colors duration-200 placeholder:text-slate-400"
                            placeholder="contact@votreentreprise.com"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>
                {/* Password Input */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                            Mot de passe
                        </label>
                        {canResetPassword && (
                            <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                Mot de passe oublié ?
                            </a>
                        )}
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-colors duration-200 placeholder:text-slate-400"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" aria-hidden="true" />
                            ) : (
                                <Eye className="h-5 w-5" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>
                {/* Remember Me */}
                <div className="flex items-center">
                    <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                    />
                    <label htmlFor="remember" className="ml-3 block text-sm text-slate-600 cursor-pointer select-none">
                        Se souvenir de moi sur cet appareil
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 group"
                >
                    {processing ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <>
                            Se connecter
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
