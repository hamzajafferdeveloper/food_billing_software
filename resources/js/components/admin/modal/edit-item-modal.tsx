import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import item from '@/routes/admin/food/item';
import { foodItemSchema } from '@/schema/food-item-schema';
import { FoodCategory, FoodItem } from '@/types/data';
import { FoodItemValidationErrors } from '@/types/validation';
import { router } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

interface Props {
    onOpen: boolean;
    onOpenChange: (open: boolean) => void;
    categories: FoodCategory[];
    data: FoodItem;
}

const EditItemModal = ({ onOpen, onOpenChange, categories, data }: Props) => {
    const [name, setName] = useState(data.name);
    const [price, setPrice] = useState(data.price.toString());
    const [categoryId, setCategoryId] = useState<string>(data.category_id.toString());
    const [openCategory, setOpenCategory] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>('/storage/' + data.image);
    const [errors, setErrors] = useState<FoodItemValidationErrors>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImage(file);

        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setPreviewImage(null);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = foodItemSchema.safeParse({ name, image: image || undefined });

        if (!result.success) {
            // map Zod errors
            const fieldErrors: { name?: string; image?: string } = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0] as 'name' | 'image';
                fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        // clear errors if validation passes
        setErrors({});

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category_id', categoryId);
        if (image) {
            formData.append('image', image);
        }

        formData.append('_method', 'PUT'); // For Laravel to recognize it as a PUT request

        router.post(item.update.url(data.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setName('');
                setPrice('');
                setCategoryId('');
                setImage(null);
                setPreviewImage(null);
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={onOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                        <DialogDescription>
                            Fill the form and click <b>‘Save changes’</b> to edit item.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Cheeseburger"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 19.99"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                        </div>

                        <div className="grid gap-3">
                            <Label>Category</Label>
                            <Popover open={openCategory} onOpenChange={setOpenCategory}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={openCategory} className="w-full justify-between">
                                        {categoryId ? categories.find((cat) => String(cat.id) === categoryId)?.name : 'Select category'}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search category..." />
                                        <CommandList>
                                            <CommandEmpty>No category found.</CommandEmpty>
                                            <CommandGroup>
                                                {categories.map((cat) => (
                                                    <CommandItem
                                                        key={cat.id}
                                                        onSelect={() => {
                                                            setCategoryId(String(cat.id));
                                                            setOpenCategory(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                categoryId === String(cat.id) ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                        {cat.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="image">Image (Optional)</Label>
                            {previewImage && <img src={previewImage} alt="Preview" className="h-20 w-20 rounded-md object-cover" />}
                            <Input type="file" id="image" name="image" accept="image/*" onChange={handleFileChange} />
                            {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
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

export default EditItemModal;
