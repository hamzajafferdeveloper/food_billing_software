import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { CustomerSideBar } from '@/components/customer/customer-sidebar';
import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import { type PropsWithChildren } from 'react';

export default function CustomerSideBarLayout({ children }: PropsWithChildren) {
    return (
        <AppShell variant="sidebar">
            <aside className="p-8">
                <CustomerSideBar />
            </aside>
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <section className='p-8 pl-0'>

                    {children}
                </section>
            </AppContent>
        </AppShell>
    );
}
