import ChiefSidebarLayout from '@/layouts/chief/chief-layout';
import { handlePrintReceipt } from '@/lib/utils';
import { newOrder } from '@/routes/chief';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Order } from '@/types/data';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'New Orders', href: newOrder().url }];

const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
};

export default function Dashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [serving, setServing] = useState(false);
    const modalRef = useRef<HTMLDivElement | null>(null);

    const page = usePage<SharedData>();
    const { currency, name } = page.props;

    /** Fetch all confirmed orders **/
    const fetchOrders = () => {
        fetch('/chief/get-confirmed-order')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch orders');
                return res.json();
            })
            .then((data) => {
                const formatted = Array.isArray(data) ? data[0]?.data || [] : data.data || [];
                setOrders(formatted);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 60000);
        return () => clearInterval(interval);
    }, []);

    /** Close modal when clicking outside **/
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setSelectedOrder(null);
            }
        };
        if (selectedOrder) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedOrder]);

    /** View order details **/
    const viewOrderDetails = (id: number) => {
        setLoading(true);
        fetch(`/chief/get-order-details/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setSelectedOrder(data.data);
            })
            .finally(() => setLoading(false));
    };

    /** 🧾 Print selected order receipt **/
    const printReceipt = async (order: Order) => {
        if (!order?.id) return;
        handlePrintReceipt(order);
    };

    /** ✅ Serve order & auto print if payment = cash **/
    const handleServeOrder = () => {
        if (!selectedOrder) return;
        setServing(true);

        // ✅ Auto print receipt if payment type = cash
        if (selectedOrder.payment_type?.toLowerCase() === 'cash') {
            printReceipt(selectedOrder);
        }

        router.post(
            `/chief/serve-order/${selectedOrder.id}`,
            {},
            {
                onSuccess: () => {
                    toast.success('Order served successfully');

                    fetchOrders();
                    setSelectedOrder(null);
                },
                onError: (err) => {
                    console.error(err);
                    toast.error('Failed to serve order');
                },
                onFinish: () => setServing(false),
            },
        );
    };

    /** Error fallback **/
    if (error)
        return (
            <ChiefSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="py-6 text-center font-semibold text-red-500">{error}</div>
            </ChiefSidebarLayout>
        );

    return (
        <ChiefSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mx-auto mt-10 w-full px-5">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="rounded-xl bg-white p-6 shadow-lg transition duration-300 hover:shadow-2xl dark:bg-gray-900"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-700 dark:text-white">
                                            {order.customer?.table_id ? `Table ${order.customer?.table_id}` : `Room No: ${order.room?.number}`}
                                        </h2>
                                        <span
                                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                                                statusColors[order.payment_status] || 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            Payment: {order.payment_status}
                                        </span>
                                    </div>

                                    <p className="mb-2 flex justify-between text-gray-500 dark:text-white">
                                        <span className="font-semibold">Order #:</span> {order.id}
                                    </p>
                                    <p className="mb-2 flex justify-between text-gray-500 dark:text-white">
                                        <span className="font-semibold">Date:</span> {order.created_at}
                                    </p>
                                    <p className="mb-2 flex justify-between text-gray-500 dark:text-white">
                                        <span className="font-semibold">Amount:</span> {currency}
                                        {order.total_amount}
                                    </p>

                                    <button
                                        onClick={() => viewOrderDetails(order.id)}
                                        className="mt-4 w-full cursor-pointer rounded-lg bg-[#fce0a2] py-2 font-semibold text-[#171717] transition hover:bg-[#e4c37d]"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="py-6 text-center font-semibold text-gray-500">No confirmed orders found.</p>
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#fce0a2] border-t-transparent"></div>
                </div>
            )}

            {/* 🧾 Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div
                        ref={modalRef}
                        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
                    >
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Order #{selectedOrder.id} Details</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-full bg-gray-200 px-3 py-1 text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Table:</span> #{selectedOrder.customer?.table_id ?? '—'}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Total Amount:</span> {currency}
                                {selectedOrder.total_amount}
                            </p>

                            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Cart Items</h3>

                            <div className="flex flex-col gap-3">
                                {selectedOrder.cart?.cart_items?.map((item, idx) => {
                                    const addonsCost = item.addons?.reduce((sum, a) => sum + Number(a.price || 0), 0) || 0;
                                    const extrasCost = item.extras?.reduce((sum, e) => sum + Number(e.price || 0) * Number(e.quantity || 0), 0) || 0;
                                    const subtotal = Number(item.food_item?.price || 0) * item.quantity + addonsCost + extrasCost;

                                    return (
                                        <div
                                            key={idx}
                                            className="rounded-xl border border-gray-300 bg-white p-5 shadow-md transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {item.food_item?.image && (
                                                        <img
                                                            src={`/storage/${item.food_item.image}`}
                                                            className="h-16 w-16 rounded-lg object-cover shadow"
                                                        />
                                                    )}
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                                            {item.food_item?.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Base Price: {currency} {item.food_item?.price}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="rounded-full bg-yellow-200 px-4 py-1 text-sm font-bold text-gray-900 dark:bg-yellow-500 dark:text-black">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex justify-end border-t pt-2">
                                                <span className="text-md font-bold text-gray-900 dark:text-white">
                                                    Subtotal: {currency}
                                                    {subtotal.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-300"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleServeOrder}
                                disabled={serving}
                                className="rounded-lg bg-green-500 px-4 py-2 font-semibold text-white transition hover:bg-green-600 disabled:opacity-70"
                            >
                                {serving ? 'Serving...' : 'Mark as Served'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ChiefSidebarLayout>
    );
}
