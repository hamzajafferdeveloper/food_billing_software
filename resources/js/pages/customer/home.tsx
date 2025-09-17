import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import CustomerSideBarLayout from '@/layouts/customer/customer-layout';
import { storeUniqueId } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Home({ uniqueId }: { uniqueId: string }) {
    useEffect(() => {
        storeUniqueId(uniqueId);
    }, [uniqueId]);

    return (
        <CustomerSideBarLayout>
            <Head title="Home" />
             <CustomerSidebarHeader />
            <div className="flex flex-col gap-4 overflow-x-auto mt-8 rounded-xl">
                Hello
            </div>
        </CustomerSideBarLayout>
    );
}
