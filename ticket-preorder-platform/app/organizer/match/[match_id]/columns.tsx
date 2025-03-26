"use client"

import {ColumnDef} from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export type Ticket = {
    id: string;
    match_id: string;
    status: "reserved" | "available" | "paid";
    sector: string;
    row: number;
    seat: number;
    user_id: string;
}

export const columns : ColumnDef<Ticket>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "row",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ряд
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="px-4">{row.getValue("row")}</div>
        )
    },
    {
        accessorKey: "seat",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Место
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="px-4">{row.getValue("seat")}</div>
        )
    },
    {
        accessorKey: "sector",
        header: "Сектор",
        cell: ({ row }) => (
            <div className="">{row.getValue("sector")}</div>
        )
    },
    {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => {
            const original = row.getValue("status");
            if (original === "available") {
                return "Свободен"
            } else if (original === "paid") {
                return "Оплачен"
            } else if (original === "reserved") {
                return "Зарезервирован"
            }
        }
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Цена
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("ru-RU", {
                style: "currency",
                currency: "RUB",
            }).format(price)

            return <div className="font-medium px-4">{formatted}</div>
        }
    },

    {
        header: () => <div className={"text-right"}>Действие</div>,
        id: "actions",
        cell: ({ row }) => {
            const ticket = row.original

            return (<div className={"text-right"}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(ticket.id)}
                            >
                                Скопировать ID билета
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Посмотреть покупателя</DropdownMenuItem>
                            <DropdownMenuItem>Посмотреть детали платежа</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]
