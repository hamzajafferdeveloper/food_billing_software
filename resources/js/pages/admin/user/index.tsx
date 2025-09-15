import IndexPageHeader from '@/components/admin/index-page-header';
import CreateUserModal from '@/components/admin/modal/create-user-modal';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import user from '@/routes/admin/user';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Users',
        href: user.index().url,
    },
];

export default function AllUsers() {
    const [onCreateModalOpen, setOnCreateModalOpen] = useState<boolean>(false);
    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="All Users" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <IndexPageHeader
                    title="Users"
                    btnText="+ Add New"
                    onClick={() => {
                        setOnCreateModalOpen(true);
                    }}
                />
            </div>
            <CreateUserModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} />
        </AdminSidebarLayout>
    );
}
