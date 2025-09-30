import { getStoredUniqueId } from "@/lib/utils";
import { items } from "@/routes/customer/food";
import { Link } from "@inertiajs/react";

interface FoodCardProps {
    image?: string;
    title: string;
    onAdd?: () => void;
}

const uniqueId = getStoredUniqueId();

export default function CategoryCard({ image, title, onAdd }: FoodCardProps) {
    return (
        <div className="flex w-full sm:w-64 flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            {/* Image */}
            <img src={`/storage/${image}`} alt={title} className="mb-3 h-24 w-24 rounded-full object-cover" />

            {/* Title */}
            <h3 className="text-lg mb-4 font-bold text-gray-800">{title}</h3>
            {/* Button */}
            <Link
                href={items(uniqueId || '').url + `?category=${title}`}
                className="flex max-w-[200px] w-full justify-center cursor-pointer items-center gap-2 btn-primary"
            >
                View All Items
            </Link>
        </div>
    );
}
