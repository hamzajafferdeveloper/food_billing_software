import { Pagination } from '@/types/pagination';
import { router } from '@inertiajs/react';
import { Button } from './ui/button';

const PaginationLink = ({ pagination, currentPageLink }: { pagination: Pagination; currentPageLink: string }) => {
    const handleNextPageClick = () => {
        if (pagination.next_page_url) {
            router.get(pagination.next_page_url, {}, { preserveState: true });
        }
    };

    const handlePreviousPageClick = () => {
        if (pagination.prev_page_url) {
            router.get(pagination.prev_page_url, {}, { preserveState: true });
        }
    };

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                Showing {pagination.from} to {pagination.to} of {pagination.total} entries
            </div>
            <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => handlePreviousPageClick()} disabled={!pagination.prev_page_url}>
                    Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleNextPageClick()} disabled={!pagination.next_page_url}>
                    Next
                </Button>
            </div>
        </div>
    );
};

export default PaginationLink;
