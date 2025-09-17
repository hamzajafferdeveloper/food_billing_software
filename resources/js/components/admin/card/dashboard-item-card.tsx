import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Pen, Trash2 } from 'lucide-react';
import { FoodItem } from '@/types/data';
import { Badge } from "@/components/ui/badge"

const DashboardItemCard = ({ data }: { data: FoodItem, }) => {
    function number_format(number: number) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    }

    return (
        <div>
            <Card className="group relative max-w-sm gap-0 overflow-hidden shadow-xl py-0">
                <CardHeader className="relative p-0">
                    {/* Image */}
                    <img src={`/storage/${data.image}`} alt={data.name} className="h-64 w-full object-cover " />
                </CardHeader>

                <CardFooter className='flex justify-between p-4'>
                    <p className="w-full text-lg font-semibold">{data.name}</p>
                    <Badge className="mt-2" variant="outline">$ {number_format(data.price)}</Badge>
                </CardFooter>
            </Card>

        </div>
    );
};

export default DashboardItemCard;
