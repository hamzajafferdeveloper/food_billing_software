import ItemCard from '@/components/admin/card/item-card';
import IndexPageHeader from '@/components/admin/index-page-header';
import CreateItemModal from '@/components/admin/modal/create-item-modal';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import item from '@/routes/admin/food/item';
import { type BreadcrumbItem } from '@/types';
import { FoodCategory } from '@/types/data';
import { FoodItemPagination } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Items',
        href: item.index().url,
    },
];

type Props = {
    ItemsPagination: FoodItemPagination;
    categories: FoodCategory[];
};

export default function AllFoodItems({ ItemsPagination, categories }: Props) {
    const [onCreateModalOpen, setOnCreateModalOpen] = useState<boolean>(false);
    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="All Items" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <IndexPageHeader
                    title="Food Items"
                    btnText="+ Add New"
                    onClick={() => {
                        setOnCreateModalOpen(true);
                    }}
                />

                {/* List all Category */}
                <section>
                    {ItemsPagination.data.length === 0 ? (
                        <p>No items found.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {ItemsPagination.data.map((item) => (
                                <ItemCard key={item.id} data={item} categories={categories} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
            <CreateItemModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} categories={categories} />
        </AdminSidebarLayout>
    );
}
