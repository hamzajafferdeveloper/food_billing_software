import IndexPageHeader from '@/components/admin/index-page-header';
import CreateWaiterModal from '@/components/admin/modal/create-waiter-modal';
import { WaiterListTable } from '@/components/admin/waiter-list-table';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import user from '@/routes/admin/user';
import waiter from '@/routes/admin/waiter';
import { type BreadcrumbItem } from '@/types';
import { ExistingEmail, Roles } from '@/types/data';
import { UserPagination } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Waiter',
        href: waiter.index().url,
    },
];

type Props = {
    usersPagination: UserPagination;
    existingEmails: ExistingEmail[];
};

export default function AllWaiter({ usersPagination, existingEmails }: Props) {
    const [onCreateModalOpen, setOnCreateModalOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="All Waiter" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <IndexPageHeader
                    title="Waiter"
                    btnText="+ Add New"
                    onClick={() => {
                        setOnCreateModalOpen(true);
                    }}
                    baseUrl={waiter.index().url}
                    searchPlaceHolder="Filter waiter..."
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                />
                <WaiterListTable usersPagination={usersPagination} existingEmail={existingEmails} />
            </div>
            <CreateWaiterModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} existingEmail={existingEmails} />
        </AdminSidebarLayout>
    );
}
