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

export type Ticket = {
    id: string;
    status: "reserved" | "available" | "paid";
    sector: string;
    row: number;
    seat: number;
}

export const columns : ColumnDef<Ticket>[] = [
    {
        accessorKey: "row",
        header: "Ряд"
    },
    {
        accessorKey: "seat",
        header: "Место"
    },
    {
        accessorKey: "sector",
        header: "Сектор"
    },
    {
        accessorKey: "status",
        header: "Статус"
    },
    {
        accessorKey: "price",
        header: () => <div className="">Цена</div>,
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("ru-RU", {
                style: "currency",
                currency: "RUB",
            }).format(price)

            return <div className="font-medium">{formatted}</div>
        }
    },

    {
        header: () => <div className={"text-right"}>Действие</div>,
        id: "actions",
        cell: ({ row }) => {
            const payment = row.original

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
                                onClick={() => navigator.clipboard.writeText(payment.id)}
                            >
                                Скопировать ID платежа
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
