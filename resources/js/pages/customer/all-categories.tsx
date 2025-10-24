import CategoryCard from '@/components/customer/card/category-card';
import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import CustomerSideBarLayout from '@/layouts/customer/customer-layout';
import { storeUniqueId } from '@/lib/utils';
import { FoodCategory } from '@/types/data';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function AllFoodCategories({ uniqueId, foodCategories }: { uniqueId: string; foodCategories: FoodCategory[] }) {
    useEffect(() => {
        storeUniqueId(uniqueId);
    }, [uniqueId]);
    return (
        <CustomerSideBarLayout uniqueId={uniqueId}>
            <Head title="All Food Categories" />
            <CustomerSidebarHeader uniqueId={uniqueId} />
            <div className="mt-8 grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {foodCategories.map((foodCategory) => (
                    <CategoryCard key={foodCategory.id} image={foodCategory.image} title={foodCategory.name} onAdd={() => {}} />
                ))}
            </div>
        </CustomerSideBarLayout>
    );
}
