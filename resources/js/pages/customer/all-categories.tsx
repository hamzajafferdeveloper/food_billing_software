import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import CustomerSideBarLayout from '@/layouts/customer/customer-layout';
import { Head } from '@inertiajs/react';

export default function AllFoodCategories() {
    return (
        <CustomerSideBarLayout>
            <Head title="All Food Categories" />
            <CustomerSidebarHeader />
            <div className="mt-8 flex flex-col gap-4 overflow-x-auto rounded-xl">All Food Categories</div>
        </CustomerSideBarLayout>
    );
}
