import CustomerSideBarLayout from '@/layouts/customer/customer-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export default ({ children, ...props }: AppLayoutProps) => (
    <CustomerSideBarLayout {...props}>
        {children}
    </CustomerSideBarLayout>
);
