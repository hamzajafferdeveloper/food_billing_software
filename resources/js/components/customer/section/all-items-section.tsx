import { FoodItemPagination } from '@/types/pagination';
import FoodCard from '../card/food-card';

export const AllItemSection = ({ foodItems }: { foodItems: FoodItemPagination }) => {
    return (
        <div className="mt-8 grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {foodItems.data.map((foodItem) => (
                <FoodCard key={foodItem.id} image={foodItem.image} title={foodItem.name} price={foodItem.price} id={foodItem.id} />
            ))}
        </div>
    );
};
