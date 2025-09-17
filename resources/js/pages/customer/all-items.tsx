import FoodCard from '@/components/customer/card/food-card';
import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import CustomerSideBarLayout from '@/layouts/customer/customer-layout';
import { FoodItem } from '@/types/data';
import { Head } from '@inertiajs/react';

export default function AllFoodItems({ foodItems }: { foodItems: FoodItem[] }) {
    return (
        <CustomerSideBarLayout>
            <Head title="All Food Items" />
            <CustomerSidebarHeader />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {foodItems.map((foodItem) => (
                    <FoodCard key={foodItem.id} image={foodItem.image} title={foodItem.name} price={foodItem.price} onAdd={() => {}} />
                ))}
            </div>
        </CustomerSideBarLayout>
    );
}
