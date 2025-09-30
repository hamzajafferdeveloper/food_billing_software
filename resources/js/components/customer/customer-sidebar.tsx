import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { getStoredUniqueId } from '@/lib/utils';
import { home } from '@/routes/customer';
import { categories, items } from '@/routes/customer/food';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import AppLogo from '../app-logo';
import { HomeIcon, PizzaIcon, Utensils } from 'lucide-react';

const uniqueId = getStoredUniqueId();

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

export function CustomerSideBar() {
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
