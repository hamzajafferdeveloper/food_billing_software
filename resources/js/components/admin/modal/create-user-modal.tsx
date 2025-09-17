import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import user from '@/routes/admin/user';
import { UserSchema } from '@/schema/user-schema';
import { ExistingEmail, Roles } from '@/types/data';
import { UserValidationErrors } from '@/types/validation';
import { router } from '@inertiajs/react';
import { Check, ChevronsUpDown, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface Props {
    onOpen: boolean;
    onOpenChange: (open: boolean) => void;
    roles: Roles[];
    existingEmail: ExistingEmail[];
}

const CreateUserModal = ({ onOpen, onOpenChange, roles, existingEmail }: Props) => {
    const [data, setData] = useState({
        name: '',
        email: '',
        number: '',
        role_id: '',
        password: '',
        password_confirmation: '',
    });

    const [openRoles, setOpenRoles] = useState<boolean>(false);
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
            setData({
                name: '',
                email: '',
                number: '',
                role_id: '',
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

        const result = UserSchema.safeParse(data);

        if (!result.success) {
            // map Zod errors
            const fieldErrors: UserValidationErrors = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0] as 'name' | 'email' | 'number' | 'password' | 'password_confirmation' | 'role';
                fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        // clear errors if validation passes
        setErrors({});

        router.post(user.store.url(), data);

        // reset
        setData({
            name: '',
            email: '',
            number: '',
            role_id: '',
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
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Fill the form and click <b>‘Save changes’</b> to create a new user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">User Name</Label>
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
                            <Label htmlFor="number">User Number</Label>
                            <Input
                                id="number"
                                name="number"
                                placeholder="e.g. +0000000000"
                                value={data.number}
                                onChange={(e) => setData({ ...data, number: e.target.value })}
                            />
                            {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="role">User Role</Label>
                            <Popover open={openRoles} onOpenChange={setOpenRoles}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={openRoles} className="w-full justify-between">
                                        {data.role_id ? roles.find((rol) => String(rol.id) === data.role_id)?.name : 'Select category'}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full max-w-full p-0">
                                    <Command className="w-full">
                                        <CommandInput placeholder="Search category..." />
                                        <CommandList>
                                            <CommandEmpty>No category found.</CommandEmpty>
                                            <CommandGroup>
                                                {roles.map((rol) => (
                                                    <CommandItem
                                                        key={rol.id}
                                                        onSelect={() => {
                                                            setData({ ...data, role_id: String(rol.id) });
                                                            setOpenRoles(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                data.role_id === String(rol.id) ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                        {rol.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">User Password</Label>
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
                            <Label htmlFor="password_confirmation">ReType Password</Label>
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
                        <Button className='cursor-pointer' type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateUserModal;
