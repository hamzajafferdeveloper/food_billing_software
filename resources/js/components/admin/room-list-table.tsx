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
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

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
import { Room, User } from '@/types';
import { ExistingEmail, Roles } from '@/types/data';
import { roomsPagination } from '@/types/pagination';
import { useState } from 'react';
import EditUserModal from './modal/edit-user-modal';
import user from '@/routes/admin/user';
import PaginationLink from '../pagination-link';
import room from '@/routes/admin/room';
import EditRoomModal from './modal/edit-room-modal';
import { router } from '@inertiajs/react';

type Props = {
    roomsPagination: roomsPagination;
};

export function RoomListTable({ roomsPagination }: Props) {
    const data = roomsPagination.data;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

    const handleEditClick = (room: Room) => {
        setSelectedRoom(room);
        setEditModalOpen(true);
    };

    const deleteRoom = async (id: number) => {
        try {
            router.delete(room.destroy.url(id));
        } catch (error) {
            console.error(error);
        }
    };

    const columns: ColumnDef<Room>[] = [
        {
            accessorKey: 'number',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Number
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.getValue('number')}</div>,
        },
        {
            accessorKey: 'type',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Type
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.getValue('type')}</div>,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Status
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.getValue('status')}</div>,
        },
        {
            accessorKey: 'price_per_night',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Price Per Night
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.getValue('price_per_night')}</div>,
        },
        {
            id: 'actions',
            enableHiding: false,
            header: () => (
                <Button variant="ghost">
                    Action
                </Button>
            ),
            cell: ({ row }) => {
                const room = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(room)}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => deleteRoom(room.id)}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
            <PaginationLink pagination={roomsPagination} currentPageLink={room.index().url} />

            {selectedRoom && (
                <EditRoomModal
                    onOpen={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    prevData={selectedRoom}
                />
            )}
        </div>
    );
}
