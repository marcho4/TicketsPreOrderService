"use client"

import { Button } from "@/components/ui/button";
import { ColumnDef, FilterFn } from "@tanstack/react-table"
import { TicketItem } from "./FetchedTickets";
import { ArrowUpDown, Check, SquareCheck, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

type Ticket = {
    id: string;
    match_id: string;
    status: "available";
    sector: string;
    row: number;
    seat: number;
    price: number;
}

export const sectorFilter: FilterFn<Ticket> = (row, columnId, filterValue) => {
    const sector = row.getValue(columnId)
    if (!filterValue || filterValue.length === 0) return true
    return filterValue.includes(sector)
}


export const createColumns = (preorderTicket: (item: TicketItem) => Promise<void>): ColumnDef<Ticket>[] => 
[
    {
        header: ({ column }) => 
            <div className="flex justify-center items-center gap-2">
                <span className="text-black font-semibold">Сектор</span>
                <Popover>
                    <PopoverTrigger asChild className="bg-none border-none p-0">
                        <button className="bg-none border-none p-0">
                            <Filter className="h-4 w-4 text-black" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[110] w-[120px]">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold leading-none">Сектор</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 items-center justify-center w-full">
                        {['A','B','C','D','E','F','G','H','I','J'].map(sector => (
                                    <div key={sector} className="flex items-center justify-between gap-2 w-full">
                                        <span className="text-sm">{sector}</span>
                                        <input
                                            type="checkbox"
                                            checked={column.getFilterValue()?.includes(sector)}
                                            onChange={(e) => {
                                                const checked = e.target.checked
                                                let currentFilters: string[] = column.getFilterValue() as string[] || []
                                                if (checked) {
                                                    currentFilters = [...currentFilters, sector]
                                                } else {
                                                    currentFilters = currentFilters.filter(s => s !== sector)
                                                }
                                                column.setFilterValue(currentFilters)
                                            }}
                                        />
                                    </div>
                                ))}
                        </div>
                        <div className="flex flex-row items-center justify-end gap-2">
                                <X 
                                    className="h-4 w-4 text-black/50 hover:cursor-pointer hover:text-red-600" 
                                    onClick={() => column.setFilterValue([])} 
                                />
                            </div>
                    </div>
                    </PopoverContent>
                </Popover>
            </div>,
        accessorKey: "sector",
        cell: ({ row }) => (    
            <div className="flex justify-center">
                {row.original.sector}
            </div>
        ),
        enableColumnFilter: true,
        enableSorting: true,
        filterFn: sectorFilter,
    },
    {
        header: () => <div className="flex justify-center text-black font-semibold">Ряд</div>,
        accessorKey: "row",
        cell: ({ row }) => (
            <div className="flex justify-center">
                {row.original.row}
            </div>
        )
    },
    {
        header: () => <div className="flex justify-center text-black font-semibold">Место</div>,
        accessorKey: "seat",
        cell: ({ row }) => (
            <div className="flex justify-center">
                {row.original.seat}
            </div>
        )
    },
    {
        header: ({ column }) => {
            return (
                <div className="flex justify-center text-black font-semibold">
                    <Button
                        className="font-semibold"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Цена
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>

            )
          },
        accessorKey: "price",
        cell: ({ row }) => (
            <div className="flex justify-center">
                {row.original.price} ₽
            </div>
        ),
        enableSorting: true,
    },
    {
        header: () => <div className="flex justify-center text-black font-semibold">Предзаказ</div>,
        accessorKey: "actions",
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Button onClick={() => preorderTicket(row.original as TicketItem)} size="sm">
                    Предзаказать
                </Button>
            </div>
            
        )
    },
]
