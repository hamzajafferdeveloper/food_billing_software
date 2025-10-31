import ItemCard from '@/components/admin/card/item-card';
import IndexPageHeader from '@/components/admin/index-page-header';
import CreateItemModal from '@/components/admin/modal/create-item-modal';
import PaginationLink from '@/components/pagination-link';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import item from '@/routes/admin/food/item';
import { SharedData, type BreadcrumbItem } from '@/types';
import { FoodCategory, FoodItem } from '@/types/data';
import { FoodItemPagination } from '@/types/pagination';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Items',
        href: item.index().url,
    },
];

type Props = {
    itemsPagination: FoodItemPagination;
    categories: FoodCategory[];
};

export default function AllFoodItems({ itemsPagination, categories }: Props) {
    const [onCreateModalOpen, setOnCreateModalOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [allItems, setAllItems] = useState<FoodItem[]>(itemsPagination.data);
    const page = usePage<SharedData>();
    const { currency } = page.props;

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
                    baseUrl={item.index().url}
                    searchPlaceHolder="Filter items..."
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                />

                {/* List all Category */}
                <section>
                    {itemsPagination.data.length === 0 ? (
                        <p className="w-full text-center">No items found.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {itemsPagination.data.map((item) => (
                                <ItemCard key={item.id} data={item} categories={categories} currency={currency} />
                            ))}
                        </div>
                    )}
                    <PaginationLink pagination={itemsPagination} currentPageLink={item.index().url} />
                </section>
            </div>
            <CreateItemModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} categories={categories} currency={currency} />
        </AdminSidebarLayout>
    );
}
