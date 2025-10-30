import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasSubMenu = item.subMenu && item.subMenu.length > 0;
                    const isActive =
                        page.url.startsWith(typeof item.href === 'string' ? item.href : item.href?.url) ||
                        item.subMenu?.some((sub) => page.url.startsWith(typeof sub.href === 'string' ? sub.href : sub.href?.url));

                    return (
                        <SidebarMenuItem key={item.title}>
                            {hasSubMenu ? (
                                // ====== Collapsible Dropdown for Submenus ======
                                <Collapsible defaultOpen={isActive}>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            className="flex w-full justify-between"
                                            tooltip={{ children: item.title }}
                                            isActive={isActive}
                                        >
                                            <div className="flex items-center gap-2">
                                                {item.icon && <item.icon className="h-4 w-4" />}
                                                <span>{item.title}</span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 opacity-70 transition-transform data-[state=open]:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    {item.subMenu && (
                                        <CollapsibleContent className="mt-1 ml-4 space-y-1 border-l pl-3">
                                            {item.subMenu.map((sub) => {
                                                const subActive = page.url.startsWith(typeof sub.href === 'string' ? sub.href : sub.href?.url);

                                                return (
                                                    <SidebarMenuButton
                                                        key={sub.title}
                                                        asChild
                                                        isActive={subActive}
                                                        tooltip={{ children: sub.title }}
                                                        className="w-full justify-start text-sm"
                                                    >
                                                        <Link href={sub.href} prefetch>
                                                            {sub.icon && <sub.icon className="h-4 w-4" />}
                                                            <span>{sub.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                );
                                            })}
                                        </CollapsibleContent>
                                    )}
                                </Collapsible>
                            ) : (
                                // ====== Regular Single Menu Item ======
                                <SidebarMenuButton asChild isActive={isActive} tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
