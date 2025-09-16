import CategoryCard from '@/components/admin/card/category-card';
import IndexPageHeader from '@/components/admin/index-page-header';
import CreateCategoryModal from '@/components/admin/modal/create-category-modal';
import { LoadMoreBtn } from '@/components/load-more-btn';
import PaginationLink from '@/components/pagination-link';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import category from '@/routes/admin/food/category';
import { type BreadcrumbItem } from '@/types';
import { FoodCategory } from '@/types/data';
import { FoodCategoryPagination } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Categories',
        href: category.index().url,
    },
];

export default function AllFoodCategories({ categoriesPagination }: { categoriesPagination: FoodCategoryPagination }) {
    const [onCreateModalOpen, setOnCreateModalOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [allCategories, setAllCategories] = useState<FoodCategory[]>(categoriesPagination.data);

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="All Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <IndexPageHeader
                    title="Food Categories"
                    btnText="+ Add New"
                    onClick={() => {
                        setOnCreateModalOpen(true);
                    }}
                    baseUrl={category.index().url}
                    searchPlaceHolder="Filter categories..."
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                />

                {/* List all Category */}
                <section>
                    {categoriesPagination.data.length === 0 ? (
                        <p className="w-full text-center">No categories found.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {categoriesPagination.data.map((category) => (
                                <CategoryCard key={category.id} data={category} />
                            ))}
                        </div>
                    )}
                    <PaginationLink pagination={categoriesPagination} currentPageLink={category.index().url} />
                    {/* <LoadMoreBtn /> */}
                </section>
            </div>

            <CreateCategoryModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} />
        </AdminSidebarLayout>
    );
}
