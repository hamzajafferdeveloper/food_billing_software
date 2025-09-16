import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import { dashboard } from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { FoodItemPagination } from '@/types/pagination';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ ItemsPagination }: { ItemsPagination: FoodItemPagination }) {
    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* List all Category */}
                <section>
                    {ItemsPagination.data.length === 0 ? (
                        <p>No items found.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {ItemsPagination.data.map((item) => (
                                // <ItemCard key={item.id} data={item} categories={categories} />
                                <PlaceholderPattern key={item.id} className="h-48 w-full rounded-lg" />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminSidebarLayout>
    );
}
