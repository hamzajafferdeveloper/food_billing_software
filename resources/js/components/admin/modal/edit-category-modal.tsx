import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import category from '@/routes/admin/food/category';
import { FoodCategory } from '@/types/pagination';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    onOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: FoodCategory;
}

const EditCategoryModal = ({ onOpen, onOpenChange, data }: Props) => {
    const [name, setName] = useState(data.name);
    const [previewImage, setPreviewImage] = useState<string>(`/storage/${data.image}`);
    const [image, setImage] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImage(file);

        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
        } else {
            setPreviewImage(`/storage/${data.image}`); // fallback to original
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        if (image) {
            formData.append('image', image);
        }
        // ✅ method spoofing for Laravel
        formData.append('_method', 'PUT');

        router.post(category.update.url(data.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                onOpenChange(false);
                setImage(null);
            },
        });
    };

    return (
        <Dialog open={onOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Fill the form and click <b>‘Save changes’</b> to create a new category.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Burgers" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="image">Image (Optional)</Label>
                            <img src={previewImage} alt="" className="h-10 w-10 rounded-md object-cover" />
                            <Input type="file" id="image" name="image" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditCategoryModal;
