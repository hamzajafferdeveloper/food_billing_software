import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { cn, getStoredUniqueId } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import AppLogo from '../app-logo';
import { categories, items } from '@/routes/customer/food';
import { home } from '@/routes/customer';
import { NavMain } from '@/components/nav-main';

const uniqueId = getStoredUniqueId();

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: home(uniqueId || '').url,
    },
        {
        title: 'All Food Items',
        href: items(uniqueId || '').url,
    },
        {
        title: 'Food Categories',
        href: categories(uniqueId || '').url,
    },
];

export function CustomerSideBar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className='flex justify-between items-center mt-6'>
                <Link href="#" className='flex items-center gap-2'>
                    <AppLogo />
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
