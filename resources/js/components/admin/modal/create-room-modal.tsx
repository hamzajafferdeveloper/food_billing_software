import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import room from '@/routes/admin/room';
import { roomSchema } from '@/schema/room-schema';
import { UserSchema } from '@/schema/user-schema';
import { ExistingEmail, Roles } from '@/types/data';
import { RoomValidationErrors } from '@/types/validation';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    onOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreateRoomModal = ({ onOpen, onOpenChange, }: Props) => {
    const [data, setData] = useState({
        number: '',
        type: '',
        price_per_night: '',
        note: '',
    });

    const [errors, setErrors] = useState<RoomValidationErrors>({});

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setData({
                number: '',
                type: '',
                price_per_night: '',
                note: '',
            });
            setErrors({});
        }
        onOpenChange(open);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = roomSchema.safeParse(data);

        if (!result.success) {
            // map Zod errors
            const fieldErrors: RoomValidationErrors = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0] as 'number' | 'type' | 'price_per_night' | 'note';
                fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        // clear errors if validation passes
        setErrors({});

        router.post(room.store.url(), data);

        // reset
        setData({
            number: '',
            type: '',
            price_per_night: '',
            note: '',
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={onOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>Add New Room</DialogTitle>
                        <DialogDescription>
                            Fill the form and click <b>‘Save changes’</b> to create a new room.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="number">Room Number</Label>
                            <Input
                                id="number"
                                name="number"
                                placeholder="e.g. X-867"
                                value={data.number}
                                onChange={(e) => setData({ ...data, number: e.target.value })}
                            />
                            {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="number">Type</Label>
                            <Input
                                id="status"
                                name="status"
                                placeholder="e.g. “Deluxe”, “Suite”"
                                value={data.type}
                                onChange={(e) => setData({ ...data, type: e.target.value })}
                            />
                            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Price Per Night</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    placeholder="e.g. 39.99"
                                    value={data.price_per_night}
                                    onChange={(e) => setData({ ...data, price_per_night: e.target.value })}
                                />
                            </div>
                            {errors.price_per_night && <p className="text-sm text-red-500">{errors.price_per_night}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="note">Note</Label>
                            <div className="relative">
                                <Input
                                    id="note"
                                    name="note"
                                    placeholder="e.g. Enter Note Here"
                                    value={data.note}
                                    onChange={(e) => setData({ ...data, note: e.target.value })}
                                />
                            </div>
                            {errors.note && <p className="text-sm text-red-500">{errors.note}</p>}
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
        </Dialog>
    );
};

export default CreateRoomModal;
