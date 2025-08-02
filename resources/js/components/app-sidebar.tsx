import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Archive, House, LayoutGrid, Package, PackageCheck, ShoppingBag } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Tableau de bord',
        href: route('dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Catégories',
        href: route('categories.index'),
        icon: Archive,
    },
    {
        title: 'Fournisseurs',
        href: route('suppliers.index'),
        icon: House,
    },
    {
        title: 'Produits',
        href: route('products.index'),
        icon: Package,
    },
    {
        title: 'Stocks',
        href: route('stocks.index'),
        icon: PackageCheck,
    },
    {
        title: 'Ventes',
        href: route('orders.index'),
        icon: ShoppingBag,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
