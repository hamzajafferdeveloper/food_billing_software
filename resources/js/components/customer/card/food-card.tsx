import { getStoredUniqueId } from '@/lib/utils';
import { RootState } from '@/store';
import { addToCart } from '@/store/cartSlice';
import { router } from '@inertiajs/react';
import { useDispatch, useSelector } from 'react-redux';

export default function FoodCard({ image, title, price, id }: { id: number; image?: string; title: string; price: number }) {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const isAdded = cartItems.some((item) => item.id === id);
    const uniqueId = getStoredUniqueId();

    const handleAdd = () => {
        dispatch(addToCart({ id, name: title, price, image, quantity: 1 }));

        router.post(
            `/${uniqueId}/add-to-cart`,
            { food_item_id: id, quantity: 1 },
            {
                preserveState: true,
                onError: (errors) => {
                    console.error(errors);
                },
            },
        );
    };

    return (
        <div className="flex w-full flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm sm:w-64">
            <img src={`/storage/${image}`} alt={title} className="mb-3 h-24 w-24 rounded-full object-cover" />
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="mb-4 text-sm text-gray-500">${price}</p>

            <button
                onClick={handleAdd}
                disabled={isAdded}
                className={`flex max-w-[200px] w-full justify-center cursor-pointer items-center gap-2 text-white transition btn-primary`}
            >
                {isAdded ? (
                    'Added'
                ) : (
                    '+ Add Item'
                )}
            </button>
        </div>
    );
}
