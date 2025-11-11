import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomerSideBarLayout from '@/layouts/customer/customer-layout';
import { storeUniqueId } from '@/lib/utils';
import { RootState } from '@/store';
import { clearCart, setCart } from '@/store/cartSlice';
import { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export default function Cart({ uniqueId }: { uniqueId: string }) {
    const reduxCartItems = useSelector((state: RootState) => state.cart.items);
    const [openPaymentTypeModal, setOpenPaymentTypeModal] = useState<boolean>(false);
    const dispatch = useDispatch();
    const [cartItems, setCartItems] = useState(reduxCartItems);
    const page = usePage<SharedData>();
    const { currency, name } = page.props;
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        storeUniqueId(uniqueId);
    }, [uniqueId]);

    // Fetch cart on mount
    useEffect(() => {
        const fetchCart = async () => {
            try {
                if (!uniqueId) return;
                const response = await fetch(`/${uniqueId}/get-cart`);
                if (!response.ok) return;

                const data = await response.json();
                setCartItems(data.items);
                dispatch(setCart(data.items));
            } catch (err) {
                console.error('Failed to fetch cart:', err);
            }
        };
        fetchCart();
    }, [uniqueId, dispatch]);

    /** ✅ Update Quantity **/
    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            const response = await fetch(`/${uniqueId}/update-cart-item-quantity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    food_item_id: itemId,
                    quantity: newQuantity,
                }),
            });

            if (!response.ok) {
                toast.error('Failed to update quantity');
                return;
            }

            const data = await response.json();

            toast.success('Quantity updated successfully');

            // ✅ Match new format from backend: { items: [], total: number }
            setCartItems(data.items);
            dispatch(setCart(data.items));
        } catch (err) {
            toast.error('Error updating quantity');
        }
    };

    /** 🗑️ Remove Item **/
    const handleRemoveItem = async (itemId: number) => {
        try {
            const response = await fetch(`/${uniqueId}/remove-from-cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    food_item_id: itemId,
                }),
            });

            if (!response.ok) {
                toast.error('Failed to remove item');
                return;
            }

            const data = await response.json();

            toast.success('Item removed successfully');

            // ✅ Match new format
            setCartItems(data.items);
            dispatch(setCart(data.items));
        } catch (err) {
            toast.error('Error removing item');
        }
    };

    /** 💳 Checkout **/
    const handleOnCheckOutClick = (selectedPaymentType: string) => {

        dispatch(clearCart());
        // console.log('Selected Payment Type:', selectedPaymentType);
        router.get(`/${uniqueId}/checkout/payment_type=${selectedPaymentType}`);
    };

    /** 🧾 Print receipt function **/
    const printReceipt = () => {
        if (!printRef.current) return;

        const printContents = printRef.current.innerHTML;
        const printWindow = window.open('', '', 'width=900,height=600');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Receipt</title>
                <style>
                    @page { size: 80mm auto; margin: 5mm; }
                    body {
                        font-family: 'Courier New', monospace;
                        width: 80mm;
                        margin: 0 auto;
                        color: #000;
                    }
                    .receipt-header {
                        text-align: center;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 5px;
                        margin-bottom: 10px;
                    }
                    .receipt-header h2 {
                        margin: 0;
                        font-size: 16px;
                        font-weight: bold;
                    }
                    .receipt-body table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    .receipt-body th, .receipt-body td {
                        text-align: left;
                        padding: 2px 0;
                    }
                    .receipt-body tr:not(:last-child) {
                        border-bottom: 1px dotted #ddd;
                    }
                    .receipt-footer {
                        border-top: 1px dashed #000;
                        text-align: center;
                        font-size: 13px;
                        margin-top: 10px;
                        padding-top: 5px;
                    }
                </style>
            </head>
            <body>${printContents}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CustomerSideBarLayout uniqueId={uniqueId}>
            <Head title="Cart" />
            <CustomerSidebarHeader uniqueId={uniqueId} />

            {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <img src="/storage/images/empty-cart.jpg" alt="Empty cart" className="mb-6 h-40 w-40 opacity-70" />
                    <p className="text-lg font-medium text-gray-600">Your cart is empty 🛒</p>
                </div>
            ) : (
                <div className="mx-auto mt-6 w-full max-w-5xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Table Header */}
                    <div className="flex items-center justify-between border-b bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
                        <h1 className="text-xl font-bold text-gray-800">Shopping Cart</h1>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">{cartItems.length} items</span>
                    </div>

                    {/* Hidden Printable Receipt */}
                    <div ref={printRef} style={{ display: 'none' }}>
                        <div className="receipt-header">
                            <h2>{name}</h2>
                            <p>Order Receipt</p>
                            <p>Date: {new Date().toLocaleString()}</p>
                        </div>

                        <div className="receipt-body">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>x{item.quantity}</td>
                                            <td>
                                                {currency}
                                                {(item.price * item.quantity).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="receipt-footer">
                            <p>
                                <strong>Total:</strong> {currency}
                                {total.toFixed(2)}
                            </p>
                            <p>Payment: Cash</p>
                            <p>Thank you for dining with us!</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-gray-200">
                        {cartItems.map((item) => {
                            const addonsCost = item.addons?.reduce((sum, a) => sum + Number(a.price || 0), 0) || 0;
                            const extrasCost = item.extras?.reduce((sum, e) => sum + Number(e.price || 0) * Number(e.quantity || 0), 0) || 0;
                            const calculatedSubtotal = Number(item.price * item.quantity) + addonsCost + extrasCost;

                            return (
                                <div key={item.id} className="">
                                    <div className="grid grid-cols-12 items-center border-b border-amber-200 px-6 py-4 transition-all hover:bg-gray-200/60">
                                        {/* Product */}
                                        <div className="col-span-5 flex items-center">
                                            <img
                                                src={`/storage/${item.image}`}
                                                alt={item.name}
                                                className="h-16 w-16 rounded-md object-cover shadow"
                                            />
                                            <div className="ml-4">
                                                <h2 className="text-base font-medium text-gray-800">{item.name}</h2>
                                                <p className="text-sm text-gray-500">ID: {item.id}</p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="col-span-2 text-center text-gray-700">
                                            {currency}
                                            {item.price}
                                        </div>

                                        {/* Quantity */}
                                        <div className="col-span-3 flex items-center justify-center space-x-3">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                className="rounded-full bg-gray-200 px-2 py-1 text-lg font-bold text-gray-700 hover:bg-gray-300"
                                            >
                                                −
                                            </button>
                                            <span className="inline-block w-6 text-center text-sm font-medium text-gray-700">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                className="rounded-full bg-gray-200 px-2 py-1 text-lg font-bold text-gray-700 hover:bg-gray-300"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* ✅ Updated Subtotal (includes addons + extras) */}
                                        <div className="col-span-1 text-right font-semibold text-gray-900">
                                            {}
                                            {calculatedSubtotal.toFixed(2)}
                                        </div>

                                        {/* Remove */}
                                        <div className="col-span-1 text-right">
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="rounded-md bg-red-100 px-2 py-1 text-sm text-red-600 hover:bg-red-200"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* ✅ Addons + Extras Section */}
                                    <div className="px-6 pb-4 text-sm">
                                        {/* Addons */}
                                        {item.addons && item.addons?.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="mb-1 font-medium text-gray-700">Addons:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.addons.map((addon, index) => (
                                                        <span
                                                            key={index}
                                                            className="rounded-md border border-yellow-300 bg-yellow-100 px-2 py-1 text-xs text-yellow-800"
                                                        >
                                                            {addon.name} (+{currency}
                                                            {addon.price})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Extras */}
                                        {item.extras && item.extras?.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="mb-1 font-medium text-gray-700">Extras:</h4>
                                                <ul className="space-y-1 text-gray-600">
                                                    {item.extras.map((extra, idx) => (
                                                        <li key={idx} className="flex justify-between">
                                                            <span>
                                                                {extra.name} × {extra.quantity}
                                                            </span>
                                                            <span className="font-semibold text-gray-800">
                                                                +{currency}
                                                                {(extra.price * extra.quantity).toFixed(2)}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer / Total */}
                    <div className="flex items-center justify-between border-t bg-gray-400/30 px-6 py-4">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-xl font-bold text-green-600">
                            {currency}
                            {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                        </span>
                    </div>

                    {/* Checkout Button */}
                    <div className="mt-4 flex justify-evenly px-6 pb-6">
                        <button
                            onClick={() => router.get(`/${uniqueId}/home`)}
                            className="mr-4 w-full max-w-xs rounded-lg bg-gray-200 px-6 py-2 font-semibold text-gray-700 shadow transition hover:bg-gray-300"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setOpenPaymentTypeModal(true)}
                            className="btn-primary flex w-full max-w-xs justify-center rounded-lg font-semibold shadow transition"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
            {/* Payment Type Modal */}
            {openPaymentTypeModal && (
                <Dialog open={openPaymentTypeModal} onOpenChange={setOpenPaymentTypeModal}>
                    <form>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Select Payment Type</DialogTitle>
                                <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <Button className="btn-primary" onClick={() => handleOnCheckOutClick('cash')}>
                                    Cash
                                </Button>
                                <Button className="btn-primary" onClick={() => handleOnCheckOutClick('online')}>
                                    Online
                                </Button>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button className="w-full" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </form>
                </Dialog>
            )}
        </CustomerSideBarLayout>
    );
}
