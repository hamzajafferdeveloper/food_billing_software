import { Textarea } from '@/components/ui/textarea';
import { getStoredUniqueId } from '@/lib/utils';
import { RootState } from '@/store';
import { addToCart } from '@/store/cartSlice';
import { router } from '@inertiajs/react';
import { Minus, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { Textarea } from "@/components/ui/textarea";

export default function FoodCard({ image, title, price, id }: { id: number; image?: string; title: string; price: number }) {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const existingItem = cartItems.find((item) => item.id === id);
    const isAdded = Boolean(existingItem);
    const uniqueId = getStoredUniqueId();

    const [openModal, setOpenModal] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [instructions, setInstructions] = useState('');

    const increaseQty = () => setQuantity((prev) => prev + 1);
    const decreaseQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const handleOpenModal = () => {
        // Load existing values if editing item
        if (existingItem) {
            setQuantity(existingItem.quantity);
            setInstructions(existingItem.instructions || '');
        } else {
            setQuantity(1);
            setInstructions('');
        }
        setOpenModal(true);
    };

    const handleAddToCart = () => {
        const payload = { food_item_id: id, quantity, instructions };

        if (isAdded) {
            router.post(`/${uniqueId}/update-cart-item`, payload, { preserveState: true });
        } else {
            router.post(`/${uniqueId}/add-to-cart`, payload, { preserveState: true });
        }

        dispatch(addToCart({ id, name: title, price, image, quantity, instructions }));
        setOpenModal(false);
    };

    return (
        <>
            <div className="flex w-full flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm sm:w-64">
                <img src={`/storage/${image}`} alt={title} className="mb-3 h-24 w-24 rounded-full object-cover" />
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                <p className="mb-4 text-sm text-gray-500">${price}</p>

                <button
                    onClick={handleOpenModal}
                    className="btn-primary flex w-full max-w-[200px] cursor-pointer items-center justify-center gap-2 text-white transition"
                >
                    {isAdded ? 'Edit Item' : '+ Add Item'}
                </button>
            </div>

            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="animate-fadeIn w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setOpenModal(false)}
                                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-red-500 hover:bg-red-300/30"
                            >
                                <X className="h-4 w-4 text-red-500" />
                            </button>
                        </div>
                        {/* Item Header */}
                        <div className="mb-4 flex items-center gap-4 border-b pb-3">
                            <img src={`/storage/${image}`} alt={title} className="h-20 w-20 rounded-lg border object-cover" />
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                                <p className="text-sm font-medium text-green-600">${price}</p>
                            </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mb-4 flex items-center gap-3">
                            <p className="text-sm font-semibold text-gray-600">Quantity</p>
                            <div className="flex items-center gap-3 rounded-md bg-gray-400/20 p-1">
                                <button
                                    onClick={decreaseQty}
                                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[#e0b24f] hover:bg-[#e0b24f]/30"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-lg font-bold">{quantity}</span>
                                <button
                                    onClick={increaseQty}
                                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[#e0b24f] hover:bg-[#e0b24f]/30"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Instructions */}
                        <Textarea
                            className="w-full"
                            placeholder="Special Instructions (Optional)"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />

                        {/* Buttons */}
                        <div className="mt-5 flex w-full justify-end gap-2">
                            <button onClick={handleAddToCart} className="btn-primary w-full cursor-pointer !rounded-3xl px-4 py-2 text-white">
                                {isAdded ? 'Update Item' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
