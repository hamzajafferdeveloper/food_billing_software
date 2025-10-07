import ChiefSidebarLayout from '@/layouts/chief/chief-layout';
import { newOrder } from '@/routes/chief';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'New Orders',
        href: newOrder().url,
    },
];

const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
};

interface Order {
    id: number;
    total_amount: string;
    payment_status: string;
    created_at: string;
    sender_number: string;
    transaction_id: string;
    customer?: {
        unique_id: string;
        table_id: number;
    };
    cart?: {
        customer_id: string;
        cart_items: {
            food_item_id: number;
            quantity: number;
        }[];
    };
}

export default function Dashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch function reused in interval
    const fetchOrders = () => {
        fetch('/chief/get-new-order')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }
                return response.json();
            })
            .then((data) => {
                // Handle both [{ data: [...] }] and { data: [...] }
                const formatted = Array.isArray(data) ? data[0]?.data || [] : data.data || [];
                setOrders(formatted);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        // Initial fetch
        fetchOrders();

        // Set interval to refetch every 5 minutes
        const interval = setInterval(fetchOrders, 60 * 1000);

        // Cleanup on unmount
        return () => clearInterval(interval);
    }, []);

    if (loading)
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#fce0a2] border-t-transparent"></div>
            </div>
        );

    if (error)
        return <div className="py-6 text-center font-semibold text-red-500">{error}</div>;

    return (
        <ChiefSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mx-auto mt-10 w-full px-5">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-lg transition duration-300 hover:shadow-2xl"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-700 dark:text-white">
                                        Table #{order.customer?.table_id ?? '—'}
                                    </h2>
                                    <span
                                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                                            statusColors[order.payment_status] || 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {order.payment_status}
                                    </span>
                                </div>
                                <p className="mb-2 flex justify-between text-gray-500 dark:text-white">
                                    <span className="font-semibold">Order #:</span> {order.id}
                                </p>
                                <p className="mb-2 flex justify-between text-gray-500 dark:text-white">
                                    <span className="font-semibold">Date:</span> {order.created_at}
                                </p>
                                <p className="mb-2 flex justify-between text-gray-500 dark:text-white">
                                    <span className="font-semibold">Amount:</span> {order.total_amount}
                                </p>
                                <p className="mb-2 flex justify-between text-gray-500 dark:text-white">
                                    <span className="font-semibold">Sender:</span> {order.sender_number}
                                </p>
                                <p className="flex justify-between text-gray-500 dark:text-white">
                                    <span className="font-semibold">Transaction ID:</span> {order.transaction_id}
                                </p>
                                <button className="mt-4 w-full cursor-pointer rounded-lg bg-[#fce0a2] py-2 font-semibold text-[#171717] transition hover:bg-[#e4c37d]">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ChiefSidebarLayout>
    );
}
