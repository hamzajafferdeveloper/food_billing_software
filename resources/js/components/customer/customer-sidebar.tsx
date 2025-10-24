import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { home } from '@/routes/customer';
import { categories, items } from '@/routes/customer/food';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { HomeIcon, PizzaIcon, Utensils } from 'lucide-react';
import AppLogo from '../app-logo';

export function CustomerSideBar({ uniqueId }: { uniqueId: string }) {

    console.log('uniqueId', uniqueId)

    const mainNavItems: NavItem[] = [
        {
            title: 'Home',
            icon: HomeIcon,
            href: home(uniqueId || '').url,
        },
        {
            title: 'All Food Items',
            icon: PizzaIcon,
            href: items(uniqueId || '').url,
        },
        {
            title: 'Food Categories',
            icon: Utensils,
            href: categories(uniqueId || '').url,
        },
    ];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <Link href="#" className="flex items-center gap-2">
                    <AppLogo />
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
