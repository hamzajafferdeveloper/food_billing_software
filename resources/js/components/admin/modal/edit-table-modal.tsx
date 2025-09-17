import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import category from '@/routes/admin/food/category'
import table from '@/routes/admin/table';
import { tableSchema } from '@/schema/table-schema';
import { Table } from '@/types/data';
import { TableValidationErrors } from '@/types/validation';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    onOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: Table
}

const EditTableModal = ({ onOpen, onOpenChange, data }: Props) => {
    const [tableNumber, setTableNumber] = useState(data.table_number.toString());
    const [errors, setErrors] = useState<TableValidationErrors>({});

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = tableSchema.safeParse({ table_number: tableNumber });

        if (!result.success) {
            // map Zod errors
            const fieldErrors: TableValidationErrors = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0] as 'table_number';
                fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        // clear errors if validation passes
        setErrors({});

        router.put(table.update.url(data.id), { table_number: tableNumber });

        // reset
        setTableNumber('');
        onOpenChange(false);
    };

    return (
        <Dialog open={onOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>Add New Table</DialogTitle>
                        <DialogDescription>
                            Fill the form and click <b>‘Save changes’</b> to create a new table.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="table_number">Table Number</Label>
                            <Input id="table_number" name="table_number" type='number' placeholder="e.g. 123" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required />
                            {errors.table_number && <p className="text-sm text-red-500">{errors.table_number}</p>}
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

export default EditTableModal;
