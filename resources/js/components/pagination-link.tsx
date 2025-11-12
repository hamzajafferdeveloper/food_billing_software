import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination } from '@/types/pagination';
import { router } from '@inertiajs/react';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';

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

    const handlePageClick = (page: number) => {
        router.get(currentPageLink, { per_page: page }, { preserveState: true });
    };

    return (
        <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex items-center space-x-2">
                <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-sm border px-2 py-1 items-center gap-2 flex shadow-2xs">
                        {pagination.per_page}
                        <ChevronDown className="ml-2 h-4 w-4" />
                        </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {[10, 15, 20, 25].map((perPage) => (
                            <DropdownMenuItem key={perPage} onClick={() => handlePageClick(perPage)}>
                                {perPage}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex-1 text-sm text-muted-foreground">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} entries
                </div>
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
