import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import CategoryCard from '@/components/customer/card/category-card';
import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import CustomerSideBarLayout from '@/layouts/customer/customer-layout';
import { storeUniqueId } from '@/lib/utils';
import { FoodCategory } from '@/types/data';

interface PaginatedCategory {
    data: FoodCategory[];
    next_page_url?: string | null;
}

export default function AllFoodCategories({ uniqueId, foodCategories }: { uniqueId: string; foodCategories: PaginatedCategory }) {
    const [categories, setCategories] = useState<FoodCategory[]>(foodCategories.data || []);
    // @ts-ignore
    const [nextPage, setNextPage] = useState<string | null>(foodCategories.next_page_url);

    useEffect(() => {
        storeUniqueId(uniqueId);
    }, [uniqueId]);

    const loadMore = async () => {
        if (!nextPage) return;

        try {
            // Ensure the next page URL includes uniqueId
            const pageUrl = `/${uniqueId}/food-categories/load-more?page=${nextPage.split('=')[1]}`;

            const response = await axios.get(pageUrl);
            const newData = response.data;

            if (Array.isArray(newData.data)) {
                setCategories((prev) => [...prev, ...newData.data]);
                setNextPage(newData.next_page_url);
            }
        } catch (error) {
            console.error('Error loading more categories:', error);
        }
    };

    return (
        <CustomerSideBarLayout uniqueId={uniqueId}>
            <Head title="All Food Categories" />
            <CustomerSidebarHeader uniqueId={uniqueId} />

            <div className="mt-8 grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {categories.map((cat) => (
                    <CategoryCard
                        key={cat.id}
                        image={cat.image ? `${cat.image}` : 'images/default-image.png'}
                        title={cat.name}
                        onAdd={() => {}}
                    />
                ))}
            </div>

            {nextPage && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={loadMore}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80"
                    >
                        Load More
                    </button>
                </div>
            )}
        </CustomerSideBarLayout>
    );
}
