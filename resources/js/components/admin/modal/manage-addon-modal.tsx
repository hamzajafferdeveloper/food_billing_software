import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    addons: { name: string; price: number }[];
    setAddons: React.Dispatch<React.SetStateAction<{ name: string; price: number }[]>>;
}

export const ManageAddonModal = ({ open, onOpenChange, addons, setAddons }: Props) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    const handleAddAddon = () => {
        if (!name || !price) return;
        setAddons([...addons, { name, price: Number(price) }]);
        setName("");
        setPrice("");
    };

    const removeAddon = (index: number) => {
        setAddons(addons.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Manage Add-ons</DialogTitle>
                </DialogHeader>

                {/* Add Form */}
                <div className="flex gap-3">
                    <Input
                        placeholder="Addon name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-[60%]"
                    />
                    <Input
                        placeholder="Price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-[30%]"
                    />
                    <Button onClick={handleAddAddon}>Add</Button>
                </div>

                {/* List */}
                <div className="space-y-2 max-h-40 overflow-auto">
                    {addons.map((a, i) => (
                        <div key={i} className="flex justify-between items-center border rounded-md px-3 py-2">
                            <span>{a.name} — ${a.price}</span>
                            <Button variant="destructive" size="sm" onClick={() => removeAddon(i)}>
                                Remove
                            </Button>
                        </div>
                    ))}

                    {addons.length === 0 && (
                        <p className="text-sm text-muted-foreground">No add-ons added yet.</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
