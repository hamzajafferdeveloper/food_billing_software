import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, PenBox } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import room from '@/routes/admin/room';
import { RoomBooking } from '@/types';
import { roomBookingsPagination } from '@/types/pagination';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import PaginationLink from '../pagination-link';
import EditRoomBookingModal from './modal/edit-room-booking-modal';

type Props = {
    roomBookingsPagination: roomBookingsPagination;
};

export function RoomBookingTable({ roomBookingsPagination }: Props) {
    const data = roomBookingsPagination.data;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [selectedRoom, setSelectedRoom] = useState<RoomBooking | null>(null);
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

    const handleEditClick = (room: RoomBooking) => {
        setSelectedRoom(room);
        setEditModalOpen(true);
    };

    const handleStatusUpdate = (id: number, status: string) => {
        try {
            router.put(room.booking.update.status.url(id), { status });
        } catch (error) {
            console.error(error);
        }
    };

    const columns: ColumnDef<RoomBooking>[] = [
        {
            accessorKey: 'guest',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Guest
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="ml-2 lowercase">
                    <h1>{row.original.guest?.name}</h1>
                    <p>{row.original.guest?.document_number}</p>
                </div>
            ),
        },
        {
            accessorKey: 'guest.email',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Email
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.original.guest?.email}</div>,
        },
        {
            accessorKey: 'guest.phone_number',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Phone Number
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.original.guest?.phone_number}</div>,
        },
        {
            accessorKey: 'room.number',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Room Number
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.original.room?.number}</div>,
        },
        {
            accessorKey: 'expected_days',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Expected Days
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.original.expected_days}</div>,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Status
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="ml-2 lowercase">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-full">
                            <Button variant="outline" role="combobox" className="w-full cursor-pointer justify-between rounded-lg border">
                                {row.original.status ? (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`h-2 w-2 rounded-full ${
                                                row.original.status === 'active'
                                                    ? 'bg-blue-500'
                                                    : row.original.status === 'checked_out'
                                                      ? 'bg-green-500'
                                                      : 'bg-red-500'
                                            }`}
                                        />{' '}
                                        {row.original.status}
                                    </div>
                                ) : (
                                    'Select status...'
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        {row.original.status === 'active' && (
                            <DropdownMenuContent>
                            <DropdownMenuItem
                                className="cursor-pointer hover:!bg-blue-300/50"
                                onClick={() => handleStatusUpdate(row.original.id, 'active')}
                            >
                                <div className="h-2 w-2 rounded-full bg-blue-500" /> Active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer hover:!bg-green-300/50"
                                onClick={() => handleStatusUpdate(row.original.id, 'checked_out')}
                            >
                                <div className="h-2 w-2 rounded-full bg-green-500" /> Check Out
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer hover:!bg-red-300/50"
                                onClick={() => handleStatusUpdate(row.original.id, 'cancelled')}
                            >
                                <div className="h-2 w-2 rounded-full bg-red-500" /> Cancelled
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        )}
                    </DropdownMenu>
                </div>
            ),
        },
        {
            accessorKey: 'check_in',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Check In
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.getValue('check_in')}</div>,
        },
        {
            accessorKey: 'check_out',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Check Out
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => {
                return row.getValue('check_out') ? (
                    <div className="ml-2 w-full text-gray-700 lowercase">{row.getValue('check_out')}</div>
                ) : (
                    <div className="w-full py-1 text-center">------</div>
                );
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            header: () => <Button variant="ghost">Action</Button>,
            cell: ({ row }) => {
                const room = row.original;
                return (
                    <div className='flex justify-center mr-4'>
                        <PenBox onClick={() => handleEditClick(room)} className="cursor-pointer " size={15}  />
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full">
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <PaginationLink pagination={roomBookingsPagination} currentPageLink={room.booking.index().url} />

            {selectedRoom && (
                <EditRoomBookingModal
                    onOpen={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    booking={selectedRoom}
                />
            )}
        </div>
    );
}
