import IndexPageHeader from '@/components/admin/index-page-header';
import CreateRoomModal from '@/components/admin/modal/create-room-modal';
import { RoomListTable } from '@/components/admin/room-list-table';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import room from '@/routes/admin/room';
import { SharedData, type BreadcrumbItem } from '@/types';
import { roomsPagination } from '@/types/pagination';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Rooms',
        href: room.index().url,
    },
];

export default function Tables({ roomsPagination, filters  }: { roomsPagination: roomsPagination, filters: any }) {
    const { flash } = usePage<SharedData>().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast?.success(flash?.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const [onCreateModalOpen, setOnCreateModalOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>(filters.search || '');

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="All Rooms" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <IndexPageHeader
                    title="Rooms"
                    btnText="+ Add New"
                    onClick={() => {
                        setOnCreateModalOpen(true);
                    }}
                    baseUrl={room.index().url}
                    searchPlaceHolder="Filter rooms..."
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                />
                <RoomListTable roomsPagination={roomsPagination} />
            </div>
            {onCreateModalOpen && <CreateRoomModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} />}
        </AdminSidebarLayout>
    );
}
