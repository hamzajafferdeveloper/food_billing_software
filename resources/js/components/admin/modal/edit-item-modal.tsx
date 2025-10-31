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
import { ManageExtraModal } from './manage-extra-modal copy';
import { ManageAddonModal } from './manage-addon-modal';

interface Props {
    onOpen: boolean;
    onOpenChange: (open: boolean) => void;
    categories: FoodCategory[];
    data: FoodItem;
    currency: string;
}

const EditItemModal = ({ onOpen, onOpenChange, categories, data, currency }: Props) => {
    const [name, setName] = useState(data.name);
    const [price, setPrice] = useState(data.price.toString());
    const [categoryId, setCategoryId] = useState<string>(data.category_id.toString());
    const [openCategory, setOpenCategory] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>('/storage/' + data.image);
    const [errors, setErrors] = useState<FoodItemValidationErrors>({});
    const [addons, setAddons] = useState<{ name: string; price: number }[]>(data.addons || []);
    const [addonModalOpen, setAddonModalOpen] = useState(false);
    const [extras, setExtras] = useState<{ name: string; price: number }[]>(data.extras || []);
    const [extraModalOpen, setExtraModalOpen] = useState(false);

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

        const result = foodItemSchema.safeParse({
            name,
            price,
            category_id: categoryId,
            image: image || undefined,
            addons,
            extras,
        });

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0] as string;
                fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category_id', categoryId);

        if (image) {
            formData.append('image', image);
        }

        // ✅ Append addons + extras as JSON
        formData.append('addons', JSON.stringify(addons));
        formData.append('extras', JSON.stringify(extras));

        formData.append('_method', 'PUT');

        router.post(item.update.url(data.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setName('');
                setPrice('');
                setCategoryId('');
                setImage(null);
                setPreviewImage(null);
                setAddons([]);
                setExtras([]);
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
                            <Label>Add-ons</Label>

                            {/* Selected Addons UI */}
                            {addons.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {addons.map((a, index) => (
                                        <div key={index} className="flex items-center gap-2 rounded-md border px-2 py-1">
                                            <span className="text-sm font-medium">{a.name}</span>
                                            <span className="text-xs opacity-70">({currency}{a.price})</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No add-ons selected yet.</p>
                            )}

                            <Button type="button" onClick={() => setAddonModalOpen(true)} className="w-full cursor-pointer">
                                Manage Add-ons
                            </Button>
                        </div>

                        {/* ✅ EXTRAS Section */}
                        <div className="grid gap-3">
                            <Label>Extras (Optional)</Label>

                            {extras.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {extras.map((ex, index) => (
                                        <div key={index} className="flex items-center gap-2 rounded-md border px-2 py-1">
                                            <span className="text-sm font-medium">{ex.name}</span>
                                            <span className="text-xs opacity-70">({currency}{ex.price})</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No extras added yet.</p>
                            )}

                            <Button type="button" onClick={() => setExtraModalOpen(true)} className="w-full cursor-pointer">
                                Manage Extras
                            </Button>
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
                        <Button className="cursor-pointer" type="submit">
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            {extraModalOpen && <ManageExtraModal open={extraModalOpen} onOpenChange={setExtraModalOpen} extras={extras} setExtras={setExtras} />}
            {addonModalOpen && <ManageAddonModal open={addonModalOpen} onOpenChange={setAddonModalOpen} addons={addons} setAddons={setAddons} />}
        </Dialog>
    );
};

export default EditItemModal;
