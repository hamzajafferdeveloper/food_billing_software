import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
// import { dashboard } from '@/routes';
import { cn, getStoredUniqueId } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import AppLogo from '../app-logo';
import { CustomerNavMain } from './customer-nav-main';
import { categories, items } from '@/routes/customer/food';
import { home } from '@/routes/customer';

const uniqueId = getStoredUniqueId();

console.log(uniqueId);

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
        <Sidebar collapsible="offcanvas" className={cn('w-[25rem] rounded-md shadow-xl pt-8')} variant="floating">
            <SidebarHeader className='flex justify-between items-center mt-6'>
                <Link href="#" className='flex items-center gap-2'>
                    <AppLogo />
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <CustomerNavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
