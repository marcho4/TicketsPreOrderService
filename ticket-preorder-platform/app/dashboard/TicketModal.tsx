import {CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import { useState } from "react";

interface TicketData {
    sector: string;
    row: string;
    seat: string;
    price: number;
    status: string;
}

interface TicketModalProps {
    ticketData: TicketData;
    matchName: string;
    stadium: string;
}

export default function TicketModal({ ticketData, matchName, stadium }: TicketModalProps) {
    const [isPaid, setIsPaid] = useState<boolean>(ticketData.status == "paid")

    return (
        <div>
            <CardHeader>
                <CardTitle className="text-2xl">
                    Данные билета
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <div>Матч: {matchName}</div>
                    <div>Стадион: {stadium}</div>
                    <div>Сектор: {ticketData.sector}</div>
                    <div>Ряд: {ticketData.row}</div>
                    <div>Место: {ticketData.seat}</div>
                    <div>Стоимость: {ticketData.price} {ticketData.price % 10 > 4 ? "рублей" : (ticketData.price == 1 ? "рубль" : "рубля")}</div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-row justify-between w-full">
                <Button variant="destructive">
                    Вернуть билет
                </Button>
                <Button disabled={isPaid}>
                    Оплатить билет
                </Button>
            </CardFooter>
        </div>
    )
}