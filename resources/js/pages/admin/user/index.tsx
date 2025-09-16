import IndexPageHeader from '@/components/admin/index-page-header';
import CreateUserModal from '@/components/admin/modal/create-user-modal';
import { UserListTable } from '@/components/admin/user-list-table';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import user from '@/routes/admin/user';
import { type BreadcrumbItem } from '@/types';
import { ExistingEmail, Roles } from '@/types/data';
import { UserPagination } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Users',
        href: user.index().url,
    },
];

type Props = {
    usersPagination: UserPagination;
    roles: Roles[];
    existingEmails: ExistingEmail[];
};

export default function AllUsers({ usersPagination, roles, existingEmails }: Props) {
    const [onCreateModalOpen, setOnCreateModalOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');

    useEffect(() => {
        if (searchValue) {
            router.get(user.index().url, { search: searchValue }, { preserveState: true, replace: true });
        } else {
            router.get(user.index().url, {}, { preserveState: true, replace: true });
        }
    }, [searchValue]);
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
                    baseUrl={user.index().url}
                    searchPlaceHolder="Filter users..."
                />
                <UserListTable usersPagination={usersPagination} roles={roles} existingEmail={existingEmails} />
            </div>
            <CreateUserModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} roles={roles} existingEmail={existingEmails} />
        </AdminSidebarLayout>
    );
}
