import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { CustomerSideBar } from '@/components/customer/customer-sidebar';
import { type PropsWithChildren } from 'react';

export default function CustomerSideBarLayout({ children }: PropsWithChildren) {
    return (
        <AppShell variant="sidebar">
            <CustomerSideBar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                {children}
            </AppContent>
        </AppShell>
    );
}
