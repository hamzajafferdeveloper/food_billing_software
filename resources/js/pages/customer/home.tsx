import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import { AllItemSection } from '@/components/customer/section/all-items-section';
import CustomerSideBarLayout from '@/layouts/customer/customer-layout';
import { storeUniqueId } from '@/lib/utils';
import { FoodItemPagination } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Home({ uniqueId, foodItems }: { uniqueId: string; foodItems: FoodItemPagination }) {
    useEffect(() => {
        storeUniqueId(uniqueId);
    }, [uniqueId]);

    return (
        <CustomerSideBarLayout uniqueId={uniqueId}>
            <Head title="Home" />
            <CustomerSidebarHeader uniqueId={uniqueId} />
            <AllItemSection uniqueId={uniqueId} foodItems={foodItems} />
        </CustomerSideBarLayout>
    );
}
