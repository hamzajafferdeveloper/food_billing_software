import TableWithQrCodeCard from '@/components/admin/card/table-with-qrcode-card';
import IndexPageHeader from '@/components/admin/index-page-header';
import CreateTableModal from '@/components/admin/modal/create-table-modal';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import table from '@/routes/admin/table';
import { type BreadcrumbItem } from '@/types';
import { TableWithQrCode } from '@/types/data';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Tables',
        href: table.index().url,
    },
];

export default function Tables({ tables }: { tables: TableWithQrCode[] }) {
    const [onCreateModalOpen, setOnCreateModalOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="All Tables" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <IndexPageHeader
                    title="All Table"
                    btnText="+ Add New"
                    onClick={() => {
                        setOnCreateModalOpen(true);
                    }}
                    baseUrl={table.index().url}
                    searchPlaceHolder="Filter by there number..."
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                />
                {/* List all tables */}
                <section>
                    {tables.length === 0 ? (
                        <p className="w-full text-center">No table found.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 space-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                            {tables.map((table) => (
                                <TableWithQrCodeCard key={table.id} data={table} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
            <CreateTableModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} />
        </AdminSidebarLayout>
    );
}
