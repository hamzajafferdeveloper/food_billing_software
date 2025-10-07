import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BadgeCheck, Bell, Package, PackageCheck, PlusCircle } from 'lucide-react';
import AppLogo from '../app-logo';
import { newOrder, confirmOrders, servedOrder } from '@/routes/chief';

const mainNavItems: NavItem[] = [
    {
        title: 'New Order',
        href: newOrder().url,
        icon: PlusCircle,
    },
    {
        title: 'Confirm Order',
        href: confirmOrders().url,
        icon: Bell,
    },
    {
        title: 'Served Order',
        href: servedOrder().url,
        icon: BadgeCheck,
    },
];

export function ChiefSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={newOrder()} prefetch>
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
