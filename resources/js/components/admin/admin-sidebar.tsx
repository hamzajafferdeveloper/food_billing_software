import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Pizza, Sofa, User2Icon, UserRound, Utensils } from 'lucide-react';
import AppLogo from '../app-logo';
import { dashboard } from '@/routes/admin';
import category from '@/routes/admin/food/category';
import item from '@/routes/admin/food/item';
import user from '@/routes/admin/user';
import table from '@/routes/admin/table';
import waiter from '@/routes/admin/waiter';
import { items, sale } from '@/routes/admin/reports';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Food Categories',
        href: category.index().url,
        icon: Utensils,
    },
    {
        title: 'Food Items',
        href: item.index().url,
        icon: Pizza,
    },
    {
        title: 'Users',
        href: user.index().url,
        icon: User2Icon,
    },
    {
        title: 'Tables',
        href: table.index().url,
        icon: Sofa
    },
    {
        title: 'Waiter',
        href: waiter.index().url,
        icon: UserRound
    },
    {
        title: 'Reports',
        href: '/',
        icon: LayoutGrid,
        subMenu: [
            {
                title: 'Sales Report',
                href: sale().url,
            },
            {
                title: 'Item Report',
                href: items().url,
            }

        ]
    }
];

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
