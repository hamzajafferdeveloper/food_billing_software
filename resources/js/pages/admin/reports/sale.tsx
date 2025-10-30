import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import { cn } from '@/lib/utils';
import { sale } from '@/routes/admin/reports';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';

export default function SaleReports({ salesData, filters, allWaiters }: { salesData: any; filters: any; allWaiters: string[] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [waiter, setWaiter] = useState(filters.waiter || 'all');
    const [sortBy, setSortBy] = useState(filters.sortBy || 'date');
    const [sortDir, setSortDir] = useState(filters.sortDir || 'desc');
    const [salesDate, setSalesDate] = useState<DateRange | undefined>(
        filters.from && filters.to ? { from: new Date(filters.from), to: new Date(filters.to) } : undefined,
    );
    const [perPage, setPerPage] = useState(filters.perPage || 10);

    // ✅ Reusable handler to refetch with updated params
    const handleFilterChange = (extra = {}) => {
        router.get(
            sale().url,
            {
                search,
                waiter,
                sortBy,
                sortDir,
                from: salesDate?.from ? format(salesDate.from, 'yyyy-MM-dd') : '',
                to: salesDate?.to ? format(salesDate.to, 'yyyy-MM-dd') : '',
                perPage,
                ...extra,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // ✅ Debounced search to avoid spamming requests
    useEffect(() => {
        const timeout = setTimeout(() => handleFilterChange(), 400);
        return () => clearTimeout(timeout);
    }, [search]);

    // @ts-ignore
    const toggleSort = (column) => {
        const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(newDir);
        handleFilterChange({ sortBy: column, sortDir: newDir });
    };

    // @ts-ignore
    const handlePagination = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    function exportToExcel() {
        if (!salesData.data.length) return;
        console.log(salesData.data);
        const ws = XLSX.utils.json_to_sheet(
            // @ts-ignore
            salesData.data.map((row) => ({
                Price: row.sales,
                Waiter: row.waiter,
                Data: row.date ? format(new Date(row.date), 'dd-MM-yyyy') : '-',
            })),
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sale Reports');
        XLSX.writeFile(wb, `sale_reports_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    }

    return (
        <AdminSidebarLayout breadcrumbs={[{ title: 'Sale Reports', href: sale().url }]}>
            <Head title="Sale Reports" />
            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Sales Report</CardTitle>
                            <CardDescription>Server-side filtering, sorting & pagination</CardDescription>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                placeholder="Search waiter/date/amount..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[260px]"
                            />

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn('justify-start text-left font-normal', !salesDate && 'text-muted-foreground')}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {salesDate?.from ? (
                                            salesDate.to ? (
                                                <>
                                                    {format(salesDate.from, 'MMM d')} - {format(salesDate.to, 'MMM d, yyyy')}
                                                </>
                                            ) : (
                                                format(salesDate.from, 'MMM d, yyyy')
                                            )
                                        ) : (
                                            <span>Select date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="p-0">
                                    <Calendar
                                        mode="range"
                                        numberOfMonths={2}
                                        selected={salesDate}
                                        onSelect={(r) => {
                                            setSalesDate(r);
                                            handleFilterChange({
                                                from: r?.from ? format(r.from, 'yyyy-MM-dd') : '',
                                                to: r?.to ? format(r.to, 'yyyy-MM-dd') : '',
                                            });
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Select
                                value={waiter}
                                onValueChange={(v) => {
                                    setWaiter(v);
                                    handleFilterChange({ waiter: v });
                                }}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Select waiter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Waiters</SelectItem>
                                    {allWaiters.map((w) => (
                                        <SelectItem key={w} value={w}>
                                            {w}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" className="cursor-pointer hover:bg-gray-600/20" onClick={exportToExcel}>
                                Export
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto rounded-lg">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="cursor-pointer p-2 text-right" onClick={() => toggleSort('sales')}>
                                            <div className="flex items-center gap-2">
                                                Price
                                                {sortBy === 'sales' &&
                                                    (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                                            </div>
                                        </th>
                                        <th className="cursor-pointer p-2" onClick={() => toggleSort('waiter')}>
                                            <div className="flex items-center gap-2">
                                                Waiter
                                                {sortBy === 'waiter' &&
                                                    (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                                            </div>
                                        </th>
                                        <th className="cursor-pointer p-2" onClick={() => toggleSort('date')}>
                                            <div className="flex items-center justify-end gap-2">
                                                Date
                                                {sortBy === 'date' &&
                                                    (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData.data.length > 0 ? (
                                        // @ts-ignore
                                        salesData.data.map((item, i) => (
                                            <tr key={i} className="border-b hover:bg-muted/40">
                                                <td className="p-2">$ {Number(item.sales).toLocaleString()}</td>
                                                <td className="p-2">{item.waiter}</td>
                                                <td className="p-2 text-right font-medium">
                                                    <span>{item.date ? format(new Date(item.date), 'dd-MM-yyyy') : '-'}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-6 text-center text-muted-foreground">
                                                No sales found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={!salesData.prev_page_url}
                                    onClick={() => handlePagination(salesData.prev_page_url)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm">
                                    Page <strong>{salesData.current_page}</strong> of {salesData.last_page}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={!salesData.next_page_url}
                                    onClick={() => handlePagination(salesData.next_page_url)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            <Select
                                value={String(perPage)}
                                onValueChange={(v) => {
                                    setPerPage(v);
                                    handleFilterChange({ perPage: v });
                                }}
                            >
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminSidebarLayout>
    );
}
