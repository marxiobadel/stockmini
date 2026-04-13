import { Package, ShieldCheck, Store } from 'lucide-react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            {/* Main Container */}
            <div className="max-w-6xl w-full bg-white rounded-3xl sm:shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px]">

                {/* Left Side - Branding & Image (Hidden on smaller screens) */}
                <div className="hidden lg:flex lg:w-5/12 relative bg-blue-900 flex-col justify-between overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2000&auto=format&fit=crop"
                            alt="Entrepôt moderne"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-blue-950/75 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/40 to-transparent"></div>
                    </div>

                    {/* Content Over Image */}
                    <div className="relative z-10 p-12 flex flex-col h-full text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                                <Store className="w-8 h-8 text-blue-100" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">{import.meta.env.VITE_APP_NAME}</h2>
                                <p className="text-blue-200 text-sm font-medium">Gros & Détail</p>
                            </div>
                        </div>

                        <div className="mt-auto pb-8">
                            <h1 className="text-4xl font-bold leading-tight mb-6">
                                Votre partenaire de <span className="text-blue-300">confiance</span> pour vos ventes.
                            </h1>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-blue-100">
                                    <Package className="w-5 h-5 text-blue-300" />
                                    <span>Tarifs préférentiels pour les grossistes</span>
                                </li>
                                <li className="flex items-center gap-3 text-blue-100">
                                    <Store className="w-5 h-5 text-blue-300" />
                                    <span>Catalogue complet pour les détaillants</span>
                                </li>
                                <li className="flex items-center gap-3 text-blue-100">
                                    <ShieldCheck className="w-5 h-5 text-blue-300" />
                                    <span>Paiements sécurisés et livraison rapide</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-7/12 flex flex-col justify-center p-4 sm:p-8 md:p-12 lg:p-20 bg-white">
                    <div className="max-w-md w-full mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
