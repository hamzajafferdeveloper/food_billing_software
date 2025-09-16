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
import { User } from '@/types';
import { ExistingEmail, Roles } from '@/types/data';
import { UserPagination } from '@/types/pagination';
import { useState } from 'react';
import EditUserModal from './modal/edit-user-modal';
import user from '@/routes/admin/user';
import PaginationLink from '../pagination-link';

type Props = {
    usersPagination: UserPagination;
    roles: Roles[];
    existingEmail: ExistingEmail[];
};

export function UserListTable({ usersPagination, roles, existingEmail }: Props) {
    const data = usersPagination.data;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Name
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Email
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'phone_number',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Phone Number
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.getValue('phone_number')}</div>,
        },
        {
            accessorKey: 'roles.name',
            header: () => <Button variant="ghost">Role Name</Button>,
            cell: ({ row }) => {
                const user = row.original;
                const role = user.roles[0];
                const roleName = role?.name || 'N/A';
                return <div className="ml-2 lowercase">{roleName}</div>;
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original;
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
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(user)}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => console.log('Delete user:', user.id)}>
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
            <PaginationLink pagination={usersPagination} currentPageLink={user.index().url} />

            {selectedUser && (
                <EditUserModal
                    onOpen={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    roles={roles}
                    existingEmail={existingEmail}
                    prevData={selectedUser}
                />
            )}
        </div>
    );
}
