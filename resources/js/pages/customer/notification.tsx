import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import CustomerSideBarLayout from '@/layouts/customer/customer-layout';
import { storeUniqueId } from '@/lib/utils';

export default function Notification({ uniqueId }: { uniqueId: string }) {
    const [statusMessage, setStatusMessage] = useState('Waiting for chef approval');

    useEffect(() => {
        storeUniqueId(uniqueId);

        const fetchOrderStatus = async () => {
            try {
                const response = await fetch(`/${uniqueId}/order-status?unique_id=`);
                if (!response.ok) return;

                const data = await response.json();

                // If order exists and status is confirmed
                if (data?.data?.status === 'confirmed') {
                    setStatusMessage('Order has been confirmed, wait for serving');
                } else if (data?.data?.status === 'completed') {
                    setStatusMessage('Order has been served');
                }  else if (data?.data?.status === 'declined') {
                    setStatusMessage('Order has been declined');
                } else {
                    setStatusMessage('Waiting for chef approval');
                }
            } catch (error) {
                console.error('Error fetching order status:', error);
            }
        };

        // Fetch every second
        fetchOrderStatus();
        const interval = setInterval(fetchOrderStatus, 1000);

        return () => clearInterval(interval);
    }, [uniqueId]);

    return (
        <CustomerSideBarLayout>
            <Head title="Order Status" />
            <CustomerSidebarHeader />

            <section className="flex mt-40 items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-800 animate-pulse">
                        {statusMessage}
                    </h1>
                </div>
            </section>
        </CustomerSideBarLayout>
    );
}
