import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import user from '@/routes/admin/user';
import waiter from '@/routes/admin/waiter';
import { EditUserSchema } from '@/schema/user-schema';
import { EditWaiterSchema } from '@/schema/waiter-schema';
import { User } from '@/types';
import { ExistingEmail } from '@/types/data';
import { UserValidationErrors } from '@/types/validation';
import { router } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface Props {
    onOpen: boolean;
    onOpenChange: (open: boolean) => void;
    existingEmail: ExistingEmail[];
    prevData: User;
}

const EditWaiterModal = ({ onOpen, onOpenChange, existingEmail, prevData }: Props) => {
    const [data, setData] = useState({
        name: prevData?.name || '',
        email: prevData?.email || '',
        number: prevData?.phone_number || '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState<UserValidationErrors>({});
    const [isConfirmPasswordMatched, setIsConfirmPasswordMatched] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState<boolean>(false);

    const handlePasswordConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, password_confirmation: e.target.value });
        setIsConfirmPasswordMatched(data.password === e.target.value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setData({ ...data, email: value });

        const emailExists = existingEmail.some((item) => item.email === value);

        if (emailExists) {
            setErrors({ ...errors, email: 'This email is already taken' });
        } else {
            const { email, ...rest } = errors;
            setErrors(rest);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset back to original prevData
            setData({
                name: prevData?.name || '',
                email: prevData?.email || '',
                number: prevData?.phone_number || '',
                password: '',
                password_confirmation: '',
            });
            setErrors({});
            setIsConfirmPasswordMatched(true);
        }
        onOpenChange(open);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = EditWaiterSchema.safeParse(data);

        if (!result.success) {
            // map Zod errors
            const fieldErrors: UserValidationErrors = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0] as 'name' | 'email' | 'number' | 'password' | 'password_confirmation';
                fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        // clear errors if validation passes
        setErrors({});

        router.put(waiter.update.url(prevData?.id), data);

        // reset
        setData({
            name: '',
            email: '',
            number: '',
            password: '',
            password_confirmation: '',
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={onOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>Edit Waiter</DialogTitle>
                        <DialogDescription>
                            Fill the form and click <b>‘Save changes’</b> to edit waiter.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Waiter Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. John Doe"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="email">User Email</Label>
                            <Input id="email" name="email" placeholder="e.g. johndoe@example.com" value={data.email} onChange={handleEmailChange} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="number">Waiter Number</Label>
                            <Input
                                id="number"
                                name="number"
                                type='tel'
                                placeholder="e.g. +0000000000"
                                value={data.number}
                                onChange={(e) => setData({ ...data, number: e.target.value })}
                            />
                            {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="e.g. Enter Password Here"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="absolute top-1/2 right-4 -translate-y-1/2 transform text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password_confirmation">ReType New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    placeholder="e.g. Retype Password Here"
                                    value={data.password_confirmation}
                                    onChange={(e) => handlePasswordConfirmationChange(e)}
                                />
                                <button
                                    type="button"
                                    className="absolute top-1/2 right-4 -translate-y-1/2 transform text-gray-500"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                >
                                    {showPasswordConfirmation ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>

                            {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                            {!isConfirmPasswordMatched && <p className="text-sm text-red-500">Passwords do not match</p>}
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

export default EditWaiterModal;
