import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import category from '@/routes/admin/food/category';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    onOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreateCategoryModal = ({ onOpen, onOpenChange }: Props) => {
    const [name, setName] = useState('');
    const [image, setImage] = useState<File | null>(null);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // You can send this data to backend using Inertia or fetch/axios
        const formData = new FormData();
        formData.append('name', name);
        if (image) {
            formData.append('image', image);
        }

        router.post(category.store.url(), formData);

        // reset
        setName('');
        setImage(null);
        onOpenChange(false);
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
                            <Input type="file" id="image" name="image" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
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

export default CreateCategoryModal;
