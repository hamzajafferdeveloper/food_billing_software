import IndexPageHeader from '@/components/admin/index-page-header';
import CreateUserModal from '@/components/admin/modal/create-user-modal';
import { UserListTable } from '@/components/admin/user-list-table';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import user from '@/routes/admin/user';
import { type BreadcrumbItem } from '@/types';
import { ExistingEmail, Roles } from '@/types/data';
import { UserPagination } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Users',
        href: user.index().url,
    },
];

type Props = {
    usersPagination: UserPagination,
    roles: Roles[]
    existingEmails: ExistingEmail[];
}

export default function AllUsers({ usersPagination, roles, existingEmails }: Props) {
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
                <UserListTable usersPagination={usersPagination} roles={roles} existingEmail={existingEmails}/>
            </div>
            <CreateUserModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} roles={roles} existingEmail={existingEmails} />
        </AdminSidebarLayout>
    );
}
