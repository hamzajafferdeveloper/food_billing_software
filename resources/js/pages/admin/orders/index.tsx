import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import { cn } from '@/lib/utils';
import order from '@/routes/admin/order';
import { cart } from '@/routes/customer';
import { Room, SharedData, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Minus, Plus, Trash } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Carts',
        href: order.index().url,
    },
];

interface FoodItem {
    id: number;
    name: string;
    price: number;
    category?: string;
}

const cartSchema = z.object({
    room_id: z.number().min(1, 'Room is required'),
    cart_items: z.array(
        z.object({
            food_item_id: z.number().min(1, 'Food item is required'),
            quantity: z.number().min(1, 'Quantity must be at least 1'),
            instructions: z.string().optional(),
            addons: z.array(z.any()).optional(),
            extras: z.array(z.any()).optional(),
        }),
    ),
});

export default function CreateCart({ rooms }: { rooms: Room[] }) {
    const { flash, currency } = usePage<SharedData>().props as any;

    const [openRoomNumberPopover, setOpenRoomNumberPopover] = useState<boolean>(false);
    const [roomsData, setRoomsData] = useState<Room[]>(rooms || []);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [cartItems, setCartItems] = useState([
        { food_item_id: '', food_item: null as FoodItem | null, quantity: 1, instructions: '', addons: '', extras: '' },
    ]);

    // @ts-ignore
    const { post, processing, reset } = useForm({ room_id: '', cart_items: cartItems });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleAddItem = () => {
        setCartItems([...cartItems, { food_item_id: '', food_item: null, quantity: 1, instructions: '', addons: '', extras: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        setCartItems(cartItems.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: string, value: any) => {
        const updated = [...cartItems];
        // @ts-ignore
        updated[index][field] = value;
        setCartItems(updated);
    };

    const totalPrice = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const foodPrice = Number(item.food_item?.price ?? 0);
            const quantity = Number(item.quantity ?? 1);

            // @ts-ignore
            const addonsTotal = (item.addons || []).reduce((sum: number, a: any) => sum + Number(a.price || 0), 0);

            // @ts-ignore
            const extrasTotal = (item.extras || []).reduce((sum: number, e: any) => sum + Number(e.price || 0) * Number(e.quantity || 0), 0);

            return total + (foodPrice * quantity + addonsTotal + extrasTotal);
        }, 0);
    }, [cartItems]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRoom) {
            toast.error('Please select a room');
            return;
        }

        const payload = cartItems.map(({ food_item_id, quantity, instructions, addons, extras }) => ({
            food_item_id,
            quantity,
            instructions,
            addons: addons || [],
            extras: extras || [],
        }));

        const data = {
            room_id: selectedRoom.id,
            cart_items: payload,
            totalPrice: totalPrice,
        };

        // Validate using Zod
        const result = cartSchema.safeParse(data);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            // Show errors via toast
            if (errors.room_id) toast.error(errors.room_id[0]);
            if (errors.cart_items) {
                errors.cart_items.forEach((itemError, idx) => {
                    if (itemError.food_item_id) {
                        toast.error(`Item #${idx + 1}: ${itemError.food_item_id[0]}`);
                    }
                });
            }
            return;
        }

        // Submit if valid
        router.post(order.store().url, data, {
            onSuccess: () => {
                toast.success('Cart created successfully');
                setCartItems([]);
                setSelectedRoom(null);
            }
        });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Cart" />

            <div className="flex flex-col p-4">
                <Card className="mx-auto w-full max-w-3xl">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">Create New Order</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Select Room */}
                            <div>
                                <Label>Select Room</Label>
                                <Popover open={openRoomNumberPopover} onOpenChange={setOpenRoomNumberPopover}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between rounded-lg">
                                            {selectedRoom ? `${selectedRoom.number} - ${selectedRoom.type}` : 'Select Room'}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className={cn('max-h-[400px] w-[80vw] overflow-auto p-0 md:w-[720px]')}>
                                        <Command>
                                            <CommandInput placeholder="Search guest by room number..." />
                                            {roomsData && roomsData.length === 0 && <CommandEmpty>No room found.</CommandEmpty>}

                                            <CommandGroup className="!w-full">
                                                {roomsData.map((room) => (
                                                    <CommandItem
                                                        key={room.id}
                                                        value={room.number}
                                                        onSelect={() => {
                                                            setOpenRoomNumberPopover(false);
                                                            setSelectedRoom(room);
                                                        }}
                                                        className="cursor-pointer hover:bg-gray-100"
                                                    >
                                                        {room.number} - {room.type}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Cart Items */}
                            <div className="flex flex-col gap-3">
                                {cartItems.map((item, index) => (
                                    <FoodItemSelector
                                        key={index}
                                        currency={currency}
                                        index={index}
                                        item={item}
                                        onChange={handleChange}
                                        onRemove={handleRemoveItem}
                                        showRemove={cartItems.length > 1}
                                        cartItems={cartItems}
                                        setCartItems={setCartItems}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-between">
                                <Button type="button" variant="secondary" onClick={handleAddItem}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Another Item
                                </Button>

                                <div className="flex items-center gap-2">
                                    <p>
                                        Total Price:{' '}
                                        <span className="text-[#e0b24f]">
                                            {currency}
                                            {totalPrice.toFixed(2)}
                                        </span>
                                    </p>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Create Cart'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminSidebarLayout>
    );
}

/* Replace existing FoodItemSelector with this improved version */

function FoodItemSelector({
    index,
    item,
    onChange,
    currency,
    onRemove,
    showRemove,
    cartItems,
    setCartItems,
}: {
    index: number;
    item: any;
    currency: string;
    onChange: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
    showRemove: boolean;
    cartItems: any[];
    setCartItems: React.Dispatch<React.SetStateAction<any[]>>;
}) {
    const [openPopover, setOpenPopover] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedAddons, setSelectedAddons] = useState<any[]>(item.addons || []);
    const [selectedExtras, setSelectedExtras] = useState<any[]>(item.extras || []);

    // 🔹 Fetch search results
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/admin/orders/search-food-item?query=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                setSearchResults(Array.isArray(data) ? data : (data?.data ?? []));
            } catch (err) {
                console.error('Error fetching food items', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const formatPrice = (p: any) => {
        const n = typeof p === 'number' ? p : Number(p);
        return Number.isFinite(n) ? n.toFixed(2) : 'N/A';
    };

    const handleQuantityChange = (val: string) => {
        const parsed = parseInt(val);
        onChange(index, 'quantity', Number.isNaN(parsed) ? 1 : Math.max(1, parsed));
    };

    const handleSelectFood = (food: any) => {
        // Check if food is already in cartItems
        const existingIndex = cartItems.findIndex((c, i) => c.food_item?.id === food.id && i !== index);

        if (existingIndex !== -1) {
            // If found, just increase its quantity instead of adding duplicate
            const updated = [...cartItems];
            updated[existingIndex].quantity = Number(updated[existingIndex].quantity || 1) + 1;
            setCartItems(updated);
            toast.info(`${food.name} quantity updated.`);
            setOpenPopover(false);
            setSearchQuery('');
            return;
        }

        // If not found, select it for this slot
        onChange(index, 'food_item', food);
        onChange(index, 'food_item_id', food.id);
        onChange(index, 'addons', []);
        onChange(index, 'extras', []);
        setSelectedAddons([]);
        setSelectedExtras([]);
        setOpenPopover(false);
        setSearchQuery('');
    };

    // Keep selections synced with parent
    useEffect(() => {
        onChange(index, 'addons', selectedAddons);
    }, [selectedAddons]);

    useEffect(() => {
        onChange(index, 'extras', selectedExtras);
    }, [selectedExtras]);

    const food = item.food_item;

    const subTotal = useMemo(() => {
        const base = Number(food?.price || 0) * Number(item.quantity || 1);
        const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.price || 0), 0);
        const extrasTotal = selectedExtras.reduce((sum, e) => sum + Number(e.price || 0) * Number(e.quantity || 0), 0);
        return base + addonsTotal + extrasTotal;
    }, [food, item.quantity, selectedAddons, selectedExtras]);

    return (
        <div className="relative space-y-4 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
                <Label className="font-semibold">Item #{index + 1}</Label>
                {showRemove && (
                    <Button variant="destructive" size="icon" onClick={() => onRemove(index)}>
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Food search */}
            <div className="flex gap-2">
                <div className={food ? 'w-1/2' : 'w-full'}>
                    <Label>Search Food Item</Label>
                    <Popover open={openPopover} onOpenChange={setOpenPopover}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                                {food ? food.name : 'Search food item'}
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="max-h-[400px] overflow-auto p-0">
                            <Command>
                                <CommandInput placeholder="Search food item..." value={searchQuery} onValueChange={setSearchQuery} />
                                {loading && <CommandEmpty>Searching...</CommandEmpty>}
                                {!loading && searchResults.length === 0 && searchQuery.length >= 2 && (
                                    <CommandEmpty>No food items found</CommandEmpty>
                                )}
                                <CommandGroup>
                                    {searchResults.map((food) => (
                                        <CommandItem
                                            key={food.id}
                                            value={food.name}
                                            onSelect={() => handleSelectFood(food)}
                                            className="cursor-pointer hover:!bg-gray-300/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                {food.image && (
                                                    <img src={`/storage/${food.image}`} alt={food.name} className="h-10 w-10 rounded object-cover" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{food.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {food.category ? `${food.category} • ` : ''}
                                                        {currency}
                                                        {formatPrice(food.price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                {food && (
                    <div className="w-1/2">
                        <Label>Quantity</Label>
                        <Input type="number" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(e.target.value)} />
                    </div>
                )}
            </div>

            {/* Show details only after food item selected */}
            {food && (
                <>
                    <div>
                        <Label>Instructions</Label>
                        <Textarea
                            placeholder="Special instructions..."
                            value={item.instructions || ''}
                            onChange={(e) => onChange(index, 'instructions', e.target.value)}
                        />
                    </div>

                    {/* 🔹 Addons */}
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-gray-600">Addons</p>
                        <div className="flex flex-wrap gap-2">
                            {food.addons?.length ? (
                                // @ts-ignore
                                food.addons.map((addon) => {
                                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                                    return (
                                        <button
                                            key={addon.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedAddons((prev) => (isSelected ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]))
                                            }
                                            className={`flex h-14 w-32 items-center gap-3 rounded-xl border px-3 transition ${
                                                isSelected ? 'border-[#e0b24f] bg-[#e0b24f]/20' : 'border-gray-300'
                                            }`}
                                        >
                                            <div className={`h-4 w-4 rounded-md ${isSelected ? 'bg-[#e0b24f]' : 'border border-[#e0b24f]'}`} />
                                            <div className="flex flex-col items-start">
                                                <span className="truncate text-sm font-semibold text-gray-800">{addon.name}</span>
                                                <span className="text-sm font-medium text-gray-600">
                                                    {currency}
                                                    {addon.price}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-600">No addons</p>
                            )}
                        </div>
                    </div>

                    {/* 🔹 Extras */}
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-gray-600">Extras</p>
                        <div className="flex flex-wrap gap-2">
                            {food.extras?.length ? (
                                //@ts-ignore
                                food.extras.map((extra) => {
                                    const existing = selectedExtras.find((e) => e.id === extra.id);
                                    const qty = existing?.quantity ?? 0;

                                    const updateQty = (change: number) => {
                                        const newQty = Math.max(0, qty + change);
                                        if (newQty === 0) {
                                            setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id));
                                        } else {
                                            if (existing) {
                                                setSelectedExtras(selectedExtras.map((e) => (e.id === extra.id ? { ...e, quantity: newQty } : e)));
                                            } else {
                                                setSelectedExtras([...selectedExtras, { ...extra, quantity: 1 }]);
                                            }
                                        }
                                    };

                                    return (
                                        <div
                                            key={extra.id}
                                            className={`flex h-16 w-36 items-center justify-between rounded-xl border p-2 ${
                                                qty > 0 ? 'border-[#e0b24f] bg-[#e0b24f]/10' : 'border-gray-300'
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="truncate text-sm font-semibold text-gray-800">{extra.name}</span>
                                                <span className="text-sm text-gray-600">
                                                    {currency}
                                                    {extra.price}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button type="button" onClick={() => updateQty(-1)}>
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="text-sm font-bold">{qty}</span>
                                                <button type="button" onClick={() => updateQty(1)}>
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
                    <div className="flex justify-end pt-2">
                        <p className="text-base font-semibold">
                            Subtotal:{' '}
                            <span className="text-[#e0b24f]">
                                {currency}
                                {subTotal.toFixed(2)}
                            </span>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
