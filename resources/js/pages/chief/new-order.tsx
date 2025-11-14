import ChiefSidebarLayout from '@/layouts/chief/chief-layout';
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

export default function NewOrder() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [serving, setServing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null }); // 👈 custom confirm dialog state
    const modalRef = useRef<HTMLDivElement | null>(null);
    const page = usePage<SharedData>();
    const { currency } = page.props;

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
                    toast.success('Order Confirmed Successfully');
                    setSelectedOrder(null);
                    fetchOrders();
                },
                onError: () => toast.error('Failed to Confirm Order'),
            },
        );
    };

    const handleServeOrder = (id: number) => {
        if (!id) return;
        setServing(true);

        router.post(
            `/chief/serve-order/${id}`,
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
                    toast.success('Order Declined Successfully');
                    setConfirmModal({ open: false, id: null });
                    setSelectedOrder(null);
                    fetchOrders();
                },
                onError: () => toast.error('Failed to Decline Order'),
            },
        );
    };

    const handleUpdatePaymentStatus = (orderId: number, paymentStatus: string) => {
        router.post(
            `/chief/update_payment_status/order_id=${orderId}`,
            { payment_status: paymentStatus },
            {
                onSuccess: () => {
                    toast.success('Payment Status Updated Successfully');
                    handleServeOrder(orderId);
                    setSelectedOrder(null);
                    fetchOrders();
                },
                onError: () => toast.error('Failed to Update Payment Status'),
            },
        );
    };

    if (error)
        return (
            <>
                <ChiefSidebarLayout breadcrumbs={breadcrumbs}>
                    <Head title="Dashboard" />
                    <div className="py-6 text-center font-semibold text-red-500">{error}</div>
                </ChiefSidebarLayout>
            </>
        );

    return (
        <ChiefSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* Orders Grid */}
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mx-auto mt-10 w-full px-5">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {orders.length > 0 ? (
                            <>
                                {orders.map((order) => (
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
                                        <p className="mb-2 flex justify-between text-gray-500 dark:text-white">
                                            <span className="font-semibold">Sender:</span> {order.payment?.sender_number ?? '—'}
                                        </p>
                                        <p className="flex justify-between text-gray-500 dark:text-white">
                                            <span className="font-semibold">Transaction ID:</span> {order.payment?.transaction_id ?? '—'}
                                        </p>
                                        {order.waiter_id ? (
                                            <p className="flex justify-between text-gray-500 dark:text-white">
                                                <span className="font-semibold">Waiter ID:</span> {order.waiter?.name ?? '—'} #{order.waiter?.id}
                                            </p>
                                        ) : (
                                            <p className="flex justify-between text-gray-500 dark:text-white">
                                                <span className="font-semibold">Order Placed By Customer</span>
                                            </p>
                                        )}

                                        {/* View Details Button */}
                                        <div
                                            className={
                                                order?.payment_type === 'cash' && order?.payment_status === 'pending'
                                                    ? 'flex justify-between gap-2'
                                                    : 'flex flex-col'
                                            }
                                        >
                                            <button
                                                onClick={() => handleUpdatePaymentStatus(order.id, 'completed')}
                                                className={`mt-4 cursor-pointer rounded-lg bg-green-600 py-2 font-semibold text-white transition hover:bg-green-700 ${order?.payment_type === 'cash' && order?.payment_status === 'pending' ? 'w-1/2' : 'hidden'}`}
                                            >
                                                Cash Paid
                                            </button>
                                            <button
                                                onClick={() => viewOrderDetails(order.id)}
                                                className={`mt-4 cursor-pointer rounded-lg bg-[#fce0a2] py-2 font-semibold text-[#171717] transition hover:bg-[#e4c37d] ${order?.payment_type === 'cash' && order?.payment_status === 'pending' ? 'w-1/2' : 'w-full'}`}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="py-6 text-center font-semibold text-gray-500">No New orders found.</p>
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#fce0a2] border-t-transparent"></div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div
                        ref={modalRef}
                        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{selectedOrder.id}</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-full bg-gray-200 p-1 px-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Customer Info */}
                        <div className="mt-4 grid grid-cols-2 gap-y-2 text-gray-700 dark:text-gray-300">
                            <p>
                                <strong className="font-medium">Table:</strong> #{selectedOrder.customer?.table_id ?? '—'}
                            </p>
                            <p>
                                <strong className="font-medium">Total:</strong> {currency}
                                {selectedOrder.total_amount}
                            </p>
                            <p>
                                <strong className="font-medium">Sender:</strong> {selectedOrder.payment?.sender_number}
                            </p>
                            <p>
                                <strong className="font-medium">Transaction ID:</strong> {selectedOrder.payment?.transaction_id}
                            </p>
                        </div>

                        {/* Cart Items */}
                        <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Cart Items</h3>

                        <div className="mt-3 space-y-4">
                            {selectedOrder.cart?.cart_items?.map((item, idx) => {
                                const addonsCost = item.addons?.reduce((sum, a) => sum + Number(a.price || 0), 0) || 0;
                                const extrasCost = item.extras?.reduce((sum, e) => sum + Number(e.price || 0) * Number(e.quantity || 0), 0) || 0;
                                console.log(item);
                                // @ts-ignore
                                const calculatedSubtotal = Number(item.food_item?.price * item.quantity) + addonsCost + extrasCost;
                                return (
                                    <div
                                        key={idx}
                                        className="rounded-xl border border-gray-300 bg-white p-5 shadow-md transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
                                    >
                                        {/* ✅ Main Food Row */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {item.food_item?.image && (
                                                    <img
                                                        src={`/storage/${item.food_item.image}`}
                                                        className="h-16 w-16 rounded-lg object-cover shadow"
                                                    />
                                                )}
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{item.food_item?.name}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Base Price: {currency} {item.food_item?.price}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="rounded-full bg-yellow-200 px-4 py-1 text-sm font-bold text-gray-900 dark:bg-yellow-500 dark:text-black">
                                                Qty: {item.quantity}
                                            </span>
                                        </div>

                                        {/* Special Instructions */}
                                        <div className="mt-4">
                                            <p className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">
                                                Special Instructions
                                            </p>

                                            {item.instructions ? (
                                                <p className="rounded-md bg-yellow-200 p-2 text-sm text-gray-800 dark:text-gray-400">
                                                    {item.instructions}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic dark:text-gray-400">No Extras selected</p>
                                            )}
                                        </div>

                                        {/* ✅ Addons Section */}
                                        <div className="mt-4">
                                            <p className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">
                                                Add-ons
                                            </p>

                                            {item.addons && item.addons.length > 0 ? (
                                                <div className="space-y-2">
                                                    {item.addons.map((addon, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-700"
                                                        >
                                                            <span className="text-gray-800 dark:text-gray-200">➕ {addon.name}</span>
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {currency}
                                                                {addon.price}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic dark:text-gray-400">No Add-ons selected</p>
                                            )}
                                        </div>

                                        {/* ✅ Extras Section */}
                                        <div className="mt-4">
                                            <p className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">
                                                Extras
                                            </p>

                                            {item.extras && item.extras.length > 0 ? (
                                                <div className="space-y-2">
                                                    {item.extras.map((extra, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm dark:bg-blue-800/40"
                                                        >
                                                            <span className="text-gray-800 dark:text-gray-200">
                                                                ⚡ {extra.name} × {extra.quantity}
                                                            </span>
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {currency} {Number(extra.price) * Number(extra.quantity)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic dark:text-gray-400">No Extras selected</p>
                                            )}
                                        </div>

                                        {/* ✅ Subtotal */}
                                        <div className="mt-5 flex justify-end border-t pt-3 dark:border-gray-700">
                                            <span className="text-md font-bold text-gray-900 dark:text-white">
                                                Subtotal: {currency}
                                                {calculatedSubtotal}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
                            >
                                Close
                            </button>

                            <button
                                onClick={() => declineOrder(selectedOrder.id)}
                                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                            >
                                Decline
                            </button>

                            <button
                                onClick={() => confirmOrder(selectedOrder.id)}
                                disabled={selectedOrder.payment_status === 'pending'}
                                className={`rounded-lg px-4 py-2 font-semibold transition ${
                                    selectedOrder.payment_status === 'pending'
                                        ? 'cursor-not-allowed bg-gray-400 text-gray-700'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
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
