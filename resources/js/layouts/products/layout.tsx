import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const productNavItems: NavItem[] = [
    {
        title: 'Catégories',
        href: route('categories.index'),
        icon: null,
    },
    {
        title: 'Produits',
        href: route('products.index'),
        icon: null,
    },
    {
        title: 'Stocks',
        href: route('stocks.index'),
        icon: null,
    },
];

export default function ProductsLayout({ children }: PropsWithChildren) {
    const currentPath = window.location.pathname;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] outline-none">
                        {productNavItems.map((item, index) => (
                            <Link
                                key={`${item.href}-${index}`}
                                href={item.href}
                                as='button'
                                className={cn(
                                    'text-[#666D80] hover:text-primary',
                                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring',
                                    'rounded-md border border-transparent px-2 py-1 focus-visible:outline-1',
                                    'inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5',
                                    'text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px]',
                                    'disabled:pointer-events-none disabled:opacity-50',
                                    {'bg-white text-primary': typeof item.href === "string" && item.href.endsWith(currentPath)})}>
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-10">{children}</div>
        </div>
    );
}
