import { ConfirmDialog } from '@/components/confirm-dialogbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import item from '@/routes/admin/food/item';
import { SharedData } from '@/types';
import { FoodCategory, FoodItem } from '@/types/data';
import { router, usePage } from '@inertiajs/react';
import { Pen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import EditItemModal from '../modal/edit-item-modal';

const ItemCard = ({ data, categories, currency }: { data: FoodItem; categories: FoodCategory[]; currency: string }) => {
    const { auth } = usePage<SharedData>().props;
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

    function number_format(number: number) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    }

    return (
        <div>
            <Card className="group relative max-w-sm gap-0 overflow-hidden py-0 shadow-xl">
                <CardHeader className="relative p-0">
                    {/* Image */}
                    <img
                        src={data.image ? ` /storage/${data.image}` : '/storage/image/default-image.png'}
                        alt={data.name}
                        className="h-64 w-full object-cover"
                    />

                    {auth && auth.roles.includes('admin') && (
                        <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <button className="cursor-pointer rounded-md bg-white p-1 shadow hover:bg-gray-100">
                                <Pen className="h-4 w-4" onClick={() => setEditModalOpen(true)} />
                            </button>
                            <button className="rounded-md bg-white p-1 shadow hover:bg-gray-100">
                                <Trash2 className="h-4 w-4 text-red-500" onClick={() => setDeleteModalOpen(true)} />
                            </button>
                        </div>
                    )}
                </CardHeader>

                <CardFooter className="flex justify-between p-4">
                    <p className="w-full text-lg font-semibold">{data.name}</p>
                    <Badge className="mt-2" variant="outline">
                        {currency} {number_format(data.price)}
                    </Badge>
                </CardFooter>
            </Card>
            <EditItemModal onOpen={editModalOpen} onOpenChange={setEditModalOpen} categories={categories} data={data} currency={currency} />
            <ConfirmDialog
                onOpen={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={() => {
                    router.delete(item.destroy(data.id).url);
                }}
                title="Delete Item"
                description="This action cannot be undone. This will permanently delete the item and remove it from our servers."
            />
        </div>
    );
};

export default ItemCard;
