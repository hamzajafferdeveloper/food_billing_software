import { ConfirmDialog } from '@/components/confirm-dialogbox';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Pen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FoodCategory, FoodItem } from '@/types/data';
import item from '@/routes/admin/food/item';
import { Badge } from "@/components/ui/badge"
import EditItemModal from '../modal/edit-item-modal';

const ItemCard = ({ data, categories }: { data: FoodItem, categories: FoodCategory[] }) => {
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
            <Card className="group relative max-w-sm gap-0 overflow-hidden shadow-xl py-0">
                <CardHeader className="relative p-0">
                    {/* Image */}
                    <img src={`/storage/${data.image}`} alt={data.name} className="h-64 w-full object-cover " />

                    {/* Hover Icons */}
                    <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button className="cursor-pointer rounded-md bg-white p-1 shadow hover:bg-gray-100">
                            <Pen className="h-4 w-4" onClick={() => setEditModalOpen(true)} />
                        </button>
                        <button className="rounded-md bg-white p-1 shadow hover:bg-gray-100">
                            <Trash2 className="h-4 w-4 text-red-500" onClick={() => setDeleteModalOpen(true)} />
                        </button>
                    </div>
                </CardHeader>

                <CardFooter className='flex justify-between p-4'>
                    <p className="w-full text-lg font-semibold">{data.name}</p>
                    <Badge className="mt-2" variant="outline">$ {number_format(data.price)}</Badge>
                </CardFooter>
            </Card>
            <EditItemModal onOpen={editModalOpen} onOpenChange={setEditModalOpen} categories={categories} data={data} />
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
