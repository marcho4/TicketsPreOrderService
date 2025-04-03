"use client"

import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnFiltersState,
    VisibilityState,
    getFilteredRowModel,
} from "@tanstack/react-table"

import * as React from "react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {Button} from "@/components/ui/button";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {X} from "lucide-react";
import {Label} from "@/components/ui/label";
import {toast} from "@/hooks/use-toast";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    match_id: string,
    refreshFunc: any
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             match_id,
                                             refreshFunc
                                         }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [statusValue, setStatusValue] = React.useState("");

    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange: setRowSelection,
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const resetFilter = () => {
        table.getColumn("status")?.setFilterValue(undefined);
        setStatusValue("");
    };

    /// Возвращает true, если в выбранных рядах нет оплаченных или зарезервированных билетов
    const validateChosen = () => {
        return table.getSelectedRowModel().rows.filter(
            (row) => row.getValue("status") === "paid" || row.getValue("status") === "reserved"
        ).length === 0;
    }

    const deleteTickets = async () => {
        if (!validateChosen()) {
            toast({
                title: "Можно удалять только свободные билеты"
            })
            return;
        }
        const idsToDelete = table.getSelectedRowModel().rows.map((row) =>  row.original.id);
        console.log(idsToDelete);

        try {
            const response = await fetch(`http://localhost:8000/api/tickets/${match_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ ticket_ids : idsToDelete }),
            });
            const body = await response.json();

            if (response.status == 200) {
                toast({
                    title: "Успешно!",
                    description: body.msg || "",
                });
                refreshFunc((prev: number) => prev + 1);
            } else {
                toast({
                    title: "Произошла ошибка при удалении",
                    description: body.data || ""
                })
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Произошла ошибка при удалении",
                description: error.message || "",
            })
        }

    }

    return (
        <div>
            <div className="flex justify-start items-end space-x-2 mb-2">
                <div>
                    <Label className="px-2 mb-2 font-semibold">Фильтр по статусу</Label>
                    <Select value={statusValue} onValueChange={(e) => {table.getColumn("status")?.setFilterValue(e); setStatusValue(e);}}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Статус</SelectLabel>
                                <SelectItem value="available">Свободен</SelectItem>
                                <SelectItem value="reserved">Зарезервирован</SelectItem>
                                <SelectItem value="paid">Оплачен</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <Button size="icon" onClick={resetFilter}><X/></Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Нет билетов
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex border-t w-full items-center justify-between space-x-2 py-4 ">
                <div>
                    <Button
                        variant="secondary"
                        size={"sm"}
                        disabled={table.getSelectedRowModel().rows.length == 0}
                        onClick={() => deleteTickets()}
                    >
                        Удалить выбранные билеты
                    </Button>
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Предыдущая
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Следующая
                    </Button>
                </div>

            </div>
        </div>
    )
}
