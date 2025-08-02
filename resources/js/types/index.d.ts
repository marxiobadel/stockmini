import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash?: {
        status?: string;
        message?: string;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface Supplier {
    id: number;
    name: string;
    phone: string | null;
    address: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    name: string;
    quantity_in_stock: number;
    description: string | null;
    selling_price: number;
    purchasing_price: number | null;
    threshold_alert: number;
    category_id: number;
    unity_id: number;
    created_at: string;
    updated_at: string;
    category: Category;
    unity: Unity;
}

export interface Stock {
    id: number;
    quantity_in_stock: number;
    product_id: number;
    supplier_id: number;
    product: Product;
    supplier: Supplier;
    created_at: string;
    updated_at: string;
}

export interface Unity {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
};
