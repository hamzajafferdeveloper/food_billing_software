import CreateRoomBookingModal from '@/components/admin/modal/create-room-booking-modal';
import { RoomBookingTable } from '@/components/admin/room-booking-table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import { cn } from '@/lib/utils';
import room from '@/routes/admin/room';
import { Room, SharedData, type BreadcrumbItem } from '@/types';
import { roomBookingsPagination } from '@/types/pagination';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Rooms Booking',
        href: room.index().url,
    },
];

export default function Tables({
    roomBookingsPagination,
    rooms,
    filters,
}: {
    roomBookingsPagination: roomBookingsPagination;
    rooms: Room[];
    filters: any;
}) {
    const { flash } = usePage<SharedData>().props as any;

    useEffect(() => {
        if (flash?.success) toast?.success(flash?.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // --- State ---
    const [onCreateModalOpen, setOnCreateModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [roomNumber, setRoomNumber] = useState(filters.room_number || '');
    const [roomSearch, setRoomSearch] = useState(filters.room_number || '');
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
        from: filters.from ? new Date(filters.from) : undefined,
        to: filters.to ? new Date(filters.to) : undefined,
    });

    // --- Debounce search ---
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchValue), 300);
        return () => clearTimeout(handler);
    }, [searchValue]);

    // --- Common function to sync filters ---
    const updateFilters = (extra: Record<string, any> = {}) => {
        const params = {
            search: debouncedSearch || undefined,
            status: status || undefined,
            room_number: roomNumber || undefined,
            from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
            to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
            ...extra,
        };

        router.get(room.booking.index().url, params, {
            preserveState: true,
            replace: true,
        });
    };

    // --- Effects to trigger queries ---
    useEffect(() => {
        updateFilters();
    }, [debouncedSearch, status, roomNumber, dateRange]);

    // --- Handlers ---
    const handleStatusFilter = (s: string) => setStatus(s);
    const handleRoomNumberFilter = (num: string) => setRoomNumber(num);
    const handleDateRangeChange = (range: { from?: Date; to?: Date }) => setDateRange(range || {});

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="All Rooms Booking" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <header className="w-full rounded-2xl border px-4 py-3 space-y-4 gap-2 md:space-y-0 xl:flex md:items-center md:justify-between">
                    {/* 🔹 Title + Search */}
                    <div className="w-full space-y-3 md:flex md:items-center md:gap-4 md:space-y-0">
                        <h1 className="text-lg w-fit font-medium md:text-xl">All Rooms Booking</h1>

                        <Input
                            placeholder="Search Booking by room or guest details..."
                            value={searchValue}
                            type="search"
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full xl:w-80"
                        />
                    </div>

                    {/* 🔹 Filters Area */}
                    <div className="flex w-full mt-3 xl:mt-0 flex-wrap gap-3">

                        {/* Status Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="w-full sm:w-[180px]">
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full cursor-pointer justify-between rounded-lg border"
                                >
                                    {status ? (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-2 w-2 rounded-full ${
                                                    status === 'active'
                                                        ? 'bg-blue-500'
                                                        : status === 'checked_out'
                                                        ? 'bg-green-500'
                                                        : 'bg-red-500'
                                                }`}
                                            />
                                            {status}
                                        </div>
                                    ) : (
                                        'Filter By Status'
                                    )}
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleStatusFilter('')}>All</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusFilter('active')}>
                                    <div className="h-2 w-2 rounded-full bg-green-500" /> Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusFilter('checked_out')}>
                                    <div className="h-2 w-2 rounded-full bg-blue-500" /> Checked Out
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusFilter('cancelled')}>
                                    <div className="h-2 w-2 rounded-full bg-red-500" /> Cancelled
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Room Filter */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-[180px] justify-between text-left">
                                    {roomNumber || 'Filter By Room No'}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[200px] p-2">
                                <Input
                                    placeholder="Search room..."
                                    value={roomSearch}
                                    onChange={(e) => setRoomSearch(e.target.value)}
                                    className="mb-2 w-full"
                                />

                                <div className="max-h-40 overflow-y-auto">
                                    <div
                                        className="cursor-pointer rounded p-1 hover:bg-gray-100"
                                        onClick={() => handleRoomNumberFilter('')}
                                    >
                                        All
                                    </div>

                                    {rooms
                                        .filter((r) => r.number.toLowerCase().includes(roomSearch.toLowerCase()))
                                        .map((r) => (
                                            <div
                                                key={r.id}
                                                className="cursor-pointer rounded p-1 hover:bg-gray-100"
                                                onClick={() => handleRoomNumberFilter(r.number)}
                                            >
                                                {r.number}
                                            </div>
                                        ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Date Range Filter */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full sm:w-[200px] justify-start text-left font-normal',
                                        dateRange.from && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />

                                    {dateRange.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                                            </>
                                        ) : (
                                            format(dateRange.from, 'MMM d, yyyy')
                                        )
                                    ) : (
                                        <span>Select Date Range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent align="end" className="p-0">
                                <Calendar
                                    mode="range"
                                    numberOfMonths={2}
                                    selected={dateRange}
                                    onSelect={handleDateRangeChange}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Create Booking */}
                        <Button
                            className="w-full sm:w-auto cursor-pointer"
                            onClick={() => setOnCreateModalOpen(true)}
                        >
                            Create New Booking
                        </Button>
                    </div>
                </header>


                <RoomBookingTable roomBookingsPagination={roomBookingsPagination} />
            </div>

            {onCreateModalOpen && <CreateRoomBookingModal onOpen={onCreateModalOpen} onOpenChange={setOnCreateModalOpen} />}
        </AdminSidebarLayout>
    );
}
