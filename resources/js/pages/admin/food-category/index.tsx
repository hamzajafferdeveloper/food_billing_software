import CategoryCard from '@/components/admin/card/category-card';
import IndexPageHeader from '@/components/admin/index-page-header';
import CreateCategoryModal from '@/components/admin/modal/create-category-modal';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import category from '@/routes/admin/food/category';
import { type BreadcrumbItem } from '@/types';
import { FoodCategoryPagination } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Categories',
        href: category.index().url,
    },
];

export default function AllFoodCategories({ CategoriesPagination }: { CategoriesPagination: FoodCategoryPagination }) {
    const [onCreateModalOpen, setOnCreateModalOpen] = useState<boolean>(false);
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
                />

                {/* List all Category */}
                <section>
                    {CategoriesPagination.data.length === 0 ? (
                        <p>No categories found.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {CategoriesPagination.data.map((category) => (
                                <CategoryCard key={category.id} data={category} />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <CreateCategoryModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} />
        </AdminSidebarLayout>
    );
}
