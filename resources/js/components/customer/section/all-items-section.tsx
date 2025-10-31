import { useState } from 'react';
import axios from 'axios';
import { FoodItemPagination } from '@/types/pagination';
import FoodCard from '../card/food-card';
import { Button } from '@/components/ui/button';

export const AllItemSection = ({
    foodItems,
    uniqueId,
}: {
    foodItems: FoodItemPagination;
    uniqueId: string;
}) => {
    const [items, setItems] = useState(foodItems.data);
    const [nextPage, setNextPage] = useState(2);
    const [hasMore, setHasMore] = useState(foodItems.next_page_url !== null);
    const [loading, setLoading] = useState(false);

    const loadMore = async () => {
        if (!hasMore) return;
        setLoading(true);

        try {
            const res = await axios.get(`/${uniqueId}/food-items/load-more?page=${nextPage}`);
            const newFoodItems: FoodItemPagination = res.data;

            if (newFoodItems.data.length) {
                setItems((prev) => [...prev, ...newFoodItems.data]);
                setNextPage(nextPage + 1);
                setHasMore(!!newFoodItems.next_page_url);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Failed to load more items:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 px-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {items.map((foodItem) => (
                    <FoodCard
                        key={foodItem.id}
                        image={foodItem.image}
                        title={foodItem.name}
                        price={foodItem.price}
                        id={foodItem.id}
                        addons={foodItem.addons}
                        extras={foodItem.extras}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="mt-8 flex justify-center">
                    <Button
                        onClick={loadMore}
                        disabled={loading}
                        className="rounded-full bg-primary px-6 py-2 text-white"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}
        </div>
    );
};
