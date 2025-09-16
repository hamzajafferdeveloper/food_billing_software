import { ConfirmDialog } from '@/components/confirm-dialogbox';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import category from '@/routes/admin/food/category';
import { router } from '@inertiajs/react';
import { Pen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import EditCategoryModal from '../modal/edit-category-modal';
import { FoodCategory } from '@/types/data';

const CategoryCard = ({ data }: { data: FoodCategory }) => {
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    return (
        <div>
            <Card className="group relative max-w-sm overflow-hidden py-0 pb-6">
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

                <CardFooter>
                    <p className="w-full text-center text-lg font-semibold">{data.name}</p>
                </CardFooter>
            </Card>
            <EditCategoryModal onOpen={editModalOpen} onOpenChange={setEditModalOpen} data={data} />
            <ConfirmDialog
                onOpen={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={() => {
                    router.delete(category.destroy(data.id).url);
                }}
                title="Delete Category"
                description="This action cannot be undone. This will permanently delete the category and remove it from our servers."
            />
        </div>
    );
};

export default CategoryCard;
