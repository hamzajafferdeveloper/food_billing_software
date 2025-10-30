import { Textarea } from '@/components/ui/textarea';
import { getStoredUniqueId } from '@/lib/utils';
import { RootState } from '@/store';
import { addToCart } from '@/store/cartSlice';
import { router } from '@inertiajs/react';
import { Minus, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
// import { Textarea } from "@/components/ui/textarea";

type Props = {
    image?: string;
    title: string;
    price: number;
    id: number;
    addons?: { name: string; price: number }[];
    extras?: { name: string; price: number }[];
};

export default function FoodCard({ image, title, price, id, addons, extras }: Props) {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const existingItem = cartItems.find((item) => item.id === id);
    const isAdded = Boolean(existingItem);
    const uniqueId = getStoredUniqueId();

    const [openModal, setOpenModal] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [instructions, setInstructions] = useState('');
    const [selectedAddons, setSelectedAddons] = useState<{ item_id: number; name: string; price: number }[]>([]);
    const [selectedExtras, setSelectedExtras] = useState<{ item_id: number; quantity: number; name: string; price: number }[]>([]);
    const [totalPrice, setTotalPrice] = useState(price);

    const increaseQty = () => setQuantity((prev) => prev + 1);
    const decreaseQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const handleOpenModal = () => {
        // Load existing values if editing item
        if (existingItem) {
            setQuantity(existingItem.quantity);
            setInstructions(existingItem.instructions || '');
            setSelectedAddons(existingItem.addons || []);
            setSelectedExtras(existingItem.extras || []);
            setTotalPrice(existingItem.totalPrice || price);
        } else {
            setQuantity(1);
            setInstructions('');
            setSelectedAddons([]);
            setSelectedExtras([]);
            setTotalPrice(price);
        }
        setOpenModal(true);
    };

    const handleAddToCart = () => {
        const payload = {
            food_item_id: id,
            quantity,
            instructions,
            addons: selectedAddons,
            extras: selectedExtras,
            totalPrice,
        };

        const url = isAdded ? `/${uniqueId}/update-cart-item` : `/${uniqueId}/add-to-cart`;

        router.post(url, payload, {
            preserveState: true,
            onSuccess: () => {
                // ✅ Success toast
                toast.success(isAdded ? 'Cart updated successfully!' : 'Added to cart!');
                dispatch(
                    addToCart({ id, name: title, price, image, quantity, instructions, addons: selectedAddons, extras: selectedExtras, totalPrice }),
                );
                setOpenModal(false);
            },
            onError: (errors) => {
                // ✅ Error toast
                console.log(errors);
                toast.error('Something went wrong. Please try again!');
            },
            onFinish: () => {
                console.log('Request completed!');
            },
        });
    };

    const calculateTotalPrice = () => {
        const addonsTotal = selectedAddons.reduce((total, addon) => total + Number(addon.price), 0);
        const extrasTotal = selectedExtras.reduce((total, extra) => total + Number(extra.price) * extra.quantity, 0);
        // const

        const unitTotal = price * quantity + addonsTotal + extrasTotal;
        // const total = Number((unitTotal * quantity).toFixed(2)); // include quantity and keep 2 decimals
        setTotalPrice(unitTotal);
    };

    useEffect(() => {
        calculateTotalPrice();
    }, [selectedAddons, selectedExtras, price, quantity]);

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
                        <div className="flex flex-col gap-3">
                            {/* Item Header */}
                            <div className="flex items-center gap-4 border-b pb-3">
                                <img src={`/storage/${image}`} alt={title} className="h-20 w-20 rounded-lg border object-cover" />
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                                    <p className="text-sm font-medium text-green-600">${price}</p>
                                </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-semibold text-gray-600">Quantity</p>
                                <div className="flex items-center gap-3 rounded-md bg-gray-400/20 text-black p-1">
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

                            {/* Addons */}
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold text-gray-600">Addons</p>
                                <div className="flex flex-wrap gap-2">
                                    {addons && addons.length > 0 ? (
                                        addons.map((addon) => {
                                            const isSelected = selectedAddons.some((a) => a.name === addon.name);

                                            return (
                                                <button
                                                    key={addon.name}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
                                                        } else {
                                                            setSelectedAddons([...selectedAddons, { item_id: id, ...addon }]);
                                                        }
                                                    }}
                                                    className={`flex h-14 w-32 items-center gap-3 rounded-xl border px-3 transition ${
                                                        isSelected ? 'border-[#e0b24f] bg-[#e0b24f]/20' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <div
                                                        className={`h-4 w-4 rounded-md ${isSelected ? 'bg-[#e0b24f]' : 'border border-[#e0b24f]'}`}
                                                    />
                                                    <div className="flex flex-col items-start">
                                                        <span className="truncate text-sm font-semibold text-gray-800">{addon.name}</span>
                                                        <span className="text-sm font-medium text-gray-600">${addon.price}</span>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-gray-600">No addons</p>
                                    )}
                                </div>
                            </div>

                            {/* Extras */}
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold text-gray-600">Extras</p>
                                <div className="flex flex-wrap gap-2">
                                    {extras && extras.length > 0 ? (
                                        extras.map((extra) => {
                                            const existing = selectedExtras.find((e) => e.name === extra.name);
                                            const qty = existing?.quantity ?? 0;

                                            const updateQty = (change: number) => {
                                                const newQty = Math.max(0, qty + change);
                                                if (newQty === 0) {
                                                    setSelectedExtras(selectedExtras.filter((e) => e.name !== extra.name));
                                                } else {
                                                    if (existing) {
                                                        setSelectedExtras(
                                                            selectedExtras.map((e) => (e.name === extra.name ? { ...e, quantity: newQty } : e)),
                                                        );
                                                    } else {
                                                        setSelectedExtras([
                                                            ...selectedExtras,
                                                            { item_id: id, name: extra.name, price: extra.price, quantity: 1 },
                                                        ]);
                                                    }
                                                }
                                            };

                                            return (
                                                <div
                                                    key={extra.name}
                                                    className={`flex h-16 w-36 items-center justify-between rounded-xl border p-2 ${
                                                        qty > 0 ? 'border-[#e0b24f] bg-[#e0b24f]/10' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="truncate text-sm font-semibold text-gray-800">{extra.name}</span>
                                                        <span className="text-sm text-gray-600">${extra.price}</span>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => updateQty(-1)}>
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="text-sm font-bold">{qty}</span>
                                                        <button onClick={() => updateQty(1)}>
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-gray-600">No extras</p>
                                    )}
                                </div>
                            </div>

                            {/* Instructions */}
                            <Textarea
                                className="w-full text-black"
                                placeholder="Special Instructions (Optional)"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                            />
                            {/* Buttons */}
                            <div className="flex w-full justify-end gap-2">
                                <button onClick={handleAddToCart} className="btn-primary w-full cursor-pointer !rounded-3xl px-4 py-2 text-white">
                                    {isAdded ? 'Update Item' : 'Add to Cart'} - ${totalPrice}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
