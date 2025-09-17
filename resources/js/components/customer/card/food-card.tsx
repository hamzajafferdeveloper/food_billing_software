interface FoodCardProps {
    image?: string;
    title: string;
    onAdd: () => void;
    price: number;
}

export default function FoodCard({ image, title, price, onAdd }: FoodCardProps) {
    return (
        <div className="flex w-full sm:w-64 flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            {/* Image */}
            <img src={`/storage/${image}`} alt={title} className="mb-3 h-24 w-24 rounded-full object-cover" />

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>

            {/* Description */}
            <p className="mb-4 text-sm text-gray-500">{price}</p>

            {/* Button */}
            <button
                onClick={onAdd}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 font-medium text-white transition hover:bg-gray-800"
            >
                <span className="text-lg">+</span> Add Item
            </button>
        </div>
    );
}
