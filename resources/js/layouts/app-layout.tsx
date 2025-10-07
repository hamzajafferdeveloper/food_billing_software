import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import ChiefSidebarLayout from './chief/chief-sidebar-layout';
import AdminSidebarLayout from './admin/admin-sidebar-layout';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { auth } = usePage<SharedData>().props;
    const roles = auth.roles;
    let Layout = AppLayoutTemplate;

    if(roles.includes('chief')) {
        Layout = ChiefSidebarLayout;
    } else if (roles.includes('admin')) {
        Layout = AdminSidebarLayout;
    } else if (roles.includes('customer')) {
        Layout = AppLayoutTemplate;
    }
    return (
        <Layout breadcrumbs={breadcrumbs} {...props}>
            {children}
        </Layout>
    );
};
