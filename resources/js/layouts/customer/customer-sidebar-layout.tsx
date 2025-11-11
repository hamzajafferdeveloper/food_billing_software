import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { CustomerSideBar } from '@/components/customer/customer-sidebar';
import { type PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

export default function CustomerSideBarLayout({ children, uniqueId }: PropsWithChildren) {
    return (
        <AppShell variant="sidebar">
            <Toaster position="top-right" richColors />
            <CustomerSideBar uniqueId={uniqueId} />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                {children}
            </AppContent>
        </AppShell>
    );
}
