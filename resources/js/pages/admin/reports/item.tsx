import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import { cn } from '@/lib/utils';
import { items, sale } from '@/routes/admin/reports';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Item Reports', href: sale().url }];

type Row = {
    date: string;
    item: string;
    category: string;
    sold: number;
    cancelled: number;
};

export default function ItemReports({
    itemData,
    total,
    page: currentPage,
    pageSize: initialPageSize,
}: {
    itemData: Row[];
    total: number;
    page: number;
    pageSize: number;
}) {
    const [salesDate, setSalesDate] = useState<DateRange | undefined>();
    const [filterType, setFilterType] = useState<'top' | 'cancelled' | 'all'>('all');
    const [query, setQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<keyof Row>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState<number>(currentPage);
    const [pageSize, setPageSize] = useState<number>(initialPageSize);

    // fetch from server
    function fetchData() {
        router.get(
            items().url,
            {
                search: query,
                filterType,
                startDate: salesDate?.from ? format(salesDate.from, 'yyyy-MM-dd') : undefined,
                endDate: salesDate?.to ? format(salesDate.to, 'yyyy-MM-dd') : undefined,
                sortBy,
                sortDir,
                page,
                pageSize,
            },
            { preserveState: true, replace: true },
        );
    }

    useEffect(() => {
        fetchData();
    }, [query, filterType, salesDate, sortBy, sortDir, page, pageSize]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);

    function toggleSort(column: keyof Row) {
        if (sortBy === column) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(column);
            setSortDir('desc');
        }
        setPage(1);
    }

    function onFilterChange(fn: () => void) {
        fn();
        setPage(1);
    }

    function exportToExcel() {
        if (!itemData.length) return;
        const ws = XLSX.utils.json_to_sheet(
            itemData.map((row) => ({
                Item: row.item,
                Category: row.category,
                Sold: row.sold,
                Cancelled: row.cancelled,
            })),
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Item Reports');
        XLSX.writeFile(wb, `item_reports_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    }

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Item Reports" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Item Report</CardTitle>
                            <CardDescription>Filter by date, top sellers, or cancelled items</CardDescription>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                placeholder="Search item / category..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-[250px]"
                            />

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(!salesDate && 'text-muted-foreground', 'justify-start text-left font-normal')}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {salesDate?.from ? (
                                            salesDate.to ? (
                                                `${format(salesDate.from, 'MMM d')} - ${format(salesDate.to, 'MMM d, yyyy')}`
                                            ) : (
                                                format(salesDate.from, 'MMM d, yyyy')
                                            )
                                        ) : (
                                            <span>Select date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end">
                                    <Calendar
                                        mode="range"
                                        selected={salesDate}
                                        onSelect={(r) => onFilterChange(() => setSalesDate(r))}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Select value={filterType} onValueChange={(v: 'top' | 'cancelled' | 'all') => onFilterChange(() => setFilterType(v))}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Items</SelectItem>
                                    <SelectItem value="top">Top Selling</SelectItem>
                                    <SelectItem value="cancelled">Cancelled Items</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" className="cursor-pointer hover:bg-gray-600/20" onClick={exportToExcel}>
                                Export
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <div className="overflow-x-auto rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead onClick={() => toggleSort('item')} className="cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                Item{' '}
                                                {sortBy === 'item' && <ChevronUp className={cn('h-3 w-3', sortDir === 'asc' ? '' : 'rotate-180')} />}
                                            </div>
                                        </TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead onClick={() => toggleSort('sold')} className="cursor-pointer text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                Sold{' '}
                                                {sortBy === 'sold' && <ChevronUp className={cn('h-3 w-3', sortDir === 'asc' ? '' : 'rotate-180')} />}
                                            </div>
                                        </TableHead>
                                        <TableHead onClick={() => toggleSort('cancelled')} className="cursor-pointer text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                Cancelled{' '}
                                                {sortBy === 'cancelled' && (
                                                    <ChevronUp className={cn('h-3 w-3', sortDir === 'asc' ? '' : 'rotate-180')} />
                                                )}
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {itemData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{row.item}</TableCell>
                                            <TableCell>{row.category}</TableCell>
                                            <TableCell className="text-right font-medium">{row.sold}</TableCell>
                                            <TableCell className="text-right font-medium text-red-500">{row.cancelled}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {itemData.length === 0 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">No data found for selected filters</div>
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-sm">
                                    Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage >= totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Rows</span>
                                <Select
                                    value={String(pageSize)}
                                    onValueChange={(v) => {
                                        setPageSize(Number(v));
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[80px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminSidebarLayout>
    );
}
