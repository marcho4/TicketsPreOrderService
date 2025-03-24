import {CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";


export default function TicketModal({ticketData, matchName, stadium}) {
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
                <Button
                 variant="destructive">
                    Вернуть билет
                </Button>
                <Button>Оплатить билет</Button>
            </CardFooter>
        </div>
    )
}