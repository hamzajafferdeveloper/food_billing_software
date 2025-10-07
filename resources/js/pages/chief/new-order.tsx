import ChiefSidebarLayout from '@/layouts/chief/chief-layout';
import { newOrder } from '@/routes/chief';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'New Orders', href: newOrder().url }];

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
    customer?: {
        unique_id: string;
        table_id: number;
    };
    cart?: {
        id: number;
        customer_id: string;
        cart_items: {
            food_item_id: number;
            quantity: number;
            food_item?: {
                name: string;
                price: number;
                image?: string;
            };
        }[];
    };
    payment?: {
        sender_number: string;
        transaction_id: string;
    };
}

export default function NewOrder() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null }); // 👈 custom confirm dialog state
    const modalRef = useRef<HTMLDivElement | null>(null);

    const fetchOrders = () => {
        fetch('/chief/get-new-order')
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

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setSelectedOrder(null);
            }
        };
        if (selectedOrder) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedOrder]);

    const viewOrderDetails = (id: number) => {
        setLoading(true);
        fetch(`/chief/get-order-details/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setSelectedOrder(data.data);
            })
            .finally(() => setLoading(false));
    };

    const confirmOrder = (id: number) => {
        router.post(
            `/chief/confirm-order/${id}`,
            {},
            {
                onSuccess: () => {
                    alert('✅ Order confirmed!');
                    setSelectedOrder(null);
                    fetchOrders();
                },
                onError: () => alert('❌ Failed to confirm order.'),
            },
        );
    };

    const declineOrder = (id: number) => {
        // instead of browser confirm, open custom modal
        setConfirmModal({ open: true, id });
    };

    const handleDeclineConfirm = () => {
        if (!confirmModal.id) return;
        router.post(
            `/chief/decline-order/${confirmModal.id}`,
            {},
            {
                onSuccess: () => {
                    alert('⚠️ Order declined!');
                    setConfirmModal({ open: false, id: null });
                    setSelectedOrder(null);
                    fetchOrders();
                },
                onError: () => alert('❌ Failed to decline order.'),
            },
        );
    };

    if (loading)
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#fce0a2] border-t-transparent"></div>
            </div>
        );

    if (error) return <div className="py-6 text-center font-semibold text-red-500">{error}</div>;

    return (
        <ChiefSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* Orders Grid */}
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mx-auto mt-10 w-full px-5">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-xl bg-white p-6 shadow-lg transition duration-300 hover:shadow-2xl dark:bg-gray-900"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-700 dark:text-white">Table #{order.customer?.table_id ?? '—'}</h2>
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
                                    <span className="font-semibold">Amount:</span> {order.total_amount}
                                </p>
                                <p className="mb-2 flex justify-between text-gray-500 dark:text-white">
                                    <span className="font-semibold">Sender:</span> {order.payment?.sender_number}
                                </p>
                                <p className="flex justify-between text-gray-500 dark:text-white">
                                    <span className="font-semibold">Transaction ID:</span> {order.payment?.transaction_id}
                                </p>

                                <button
                                    onClick={() => viewOrderDetails(order.id)}
                                    className="mt-4 w-full cursor-pointer rounded-lg bg-[#fce0a2] py-2 font-semibold text-[#171717] transition hover:bg-[#e4c37d]"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div ref={modalRef} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
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
                                <span className="font-semibold">Total Amount:</span> {selectedOrder.total_amount}
                            </p>

                            {/* Cart Items */}
                            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Cart Items</h3>

                            {selectedOrder.cart?.cart_items?.length ? (
                                <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {selectedOrder.cart.cart_items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between px-4 py-3 transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.food_item?.image && (
                                                        <img
                                                            src={`/storage/${item.food_item.image}`}
                                                            alt={item.food_item.name}
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                            {item.food_item?.name ?? `Item #${item.food_item_id}`}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Rs. {item.food_item?.price ?? '-'}</p>
                                                    </div>
                                                </div>
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-3 text-center text-sm text-gray-500 italic dark:text-gray-400">No food items found in this order.</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-300"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => declineOrder(selectedOrder.id)}
                                className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600"
                            >
                                Decline
                            </button>
                                <button
                                    onClick={() => confirmOrder(selectedOrder.id)}
                                    className={`rounded-lg bg-green-500 px-4 py-2 font-semibold cursor-pointer transition ${selectedOrder.payment_status === 'pending' ? 'hover:bg-green-600 text-red-800 opacity-50 pointer-events-none' : 'hover:bg-green-600  text-white'} `}
                                >
                                    {selectedOrder.payment_status === 'pending' ? 'Payment Pending' : 'Confirm'}
                                </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Custom Confirm Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl dark:bg-gray-900">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Confirm Decline</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Are you sure you want to decline this order?</p>

                        <div className="mt-5 flex justify-center gap-3">
                            <button
                                onClick={() => setConfirmModal({ open: false, id: null })}
                                className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeclineConfirm}
                                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                            >
                                Yes, Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ChiefSidebarLayout>
    );
}
