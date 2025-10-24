import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import CustomerSideBarLayout from '@/layouts/customer/customer-layout';
import { storeUniqueId } from '@/lib/utils';
import { RootState } from '@/store';
import { clearCart, setCart } from '@/store/cartSlice';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function Cart({ uniqueId }: { uniqueId: string }) {
    const reduxCartItems = useSelector((state: RootState) => state.cart.items);
    const dispatch = useDispatch();
    const [cartItems, setCartItems] = useState(reduxCartItems);

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
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
            },
            body: JSON.stringify({
                food_item_id: itemId,
                quantity: newQuantity,
            }),
        });

        if (!response.ok) {
            console.error('Failed to update quantity');
            return;
        }

        const data = await response.json();

        // ✅ Match new format from backend: { items: [], total: number }
        setCartItems(data.items);
        dispatch(setCart(data.items));

    } catch (err) {
        console.error('Error updating quantity:', err);
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
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
            },
            body: JSON.stringify({
                food_item_id: itemId,
            }),
        });

        if (!response.ok) {
            console.error('Failed to remove item');
            return;
        }

        const data = await response.json();

        // ✅ Match new format
        setCartItems(data.items);
        dispatch(setCart(data.items));

    } catch (err) {
        console.error('Error removing item:', err);
    }
};


    /** 💳 Checkout **/
    const handleOnCheckOutClick = () => {
        dispatch(clearCart());
        router.get(`/${uniqueId}/checkout`);
    };

    return (
        <CustomerSideBarLayout uniqueId={uniqueId}>
            <Head title="Cart" />
            <CustomerSidebarHeader uniqueId={uniqueId}/>

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

                    {/* Items */}
                    <div className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 items-center px-6 py-4 transition-all hover:bg-gray-200/60">
                                {/* Product */}
                                <div className="col-span-5 flex items-center">
                                    <img src={`/storage/${item.image}`} alt={item.name} className="h-16 w-16 rounded-md object-cover shadow" />
                                    <div className="ml-4">
                                        <h2 className="text-base font-medium text-gray-800">{item.name}</h2>
                                        <p className="text-sm text-gray-500">ID: {item.id}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="col-span-2 text-center text-gray-700">${item.price}</div>

                                {/* Quantity Controls */}
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

                                {/* Subtotal */}
                                <div className="col-span-1 text-right font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>

                                {/* Remove Button */}
                                <div className="col-span-1 text-right">
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="rounded-md bg-red-100 px-2 py-1 text-sm text-red-600 hover:bg-red-200"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Total */}
                    <div className="flex items-center justify-between border-t bg-gray-400/30 px-6 py-4">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-xl font-bold text-green-600">
                            ${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
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
                            onClick={() => handleOnCheckOutClick()}
                            className="btn-primary flex w-full max-w-xs justify-center rounded-lg font-semibold shadow transition"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </CustomerSideBarLayout>
    );
}
