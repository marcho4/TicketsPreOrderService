import {CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/authProvider";

interface TicketData {
    id?: string;
    sector: string;
    row: string;
    seat: string;
    price: number;
    status: string;
    user_id?: string;
    match_id?: string;
}

interface TicketModalProps {
    ticketData: TicketData;
    matchName: string;
    stadium: string;
    onTicketUpdate?: () => void;
}

export default function TicketModal({ ticketData, matchName, stadium, onTicketUpdate }: TicketModalProps) {
    const [isPaid, setIsPaid] = useState<boolean>(ticketData.status === "paid");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleCancelTicket = async () => {
        const userId = user || ticketData.user_id;
        
        if (!ticketData.id || !userId || !ticketData.match_id) {
            toast({
                title: "Ошибка",
                description: "Не удалось найти ID билета, пользователя или матча",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/tickets/cancel/${ticketData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    match_id: ticketData.match_id,
                    user_id: userId,
                    ticket_id: ticketData.id
                })
            });

            if (response.ok) {
                toast({
                    title: "Успех",
                    description: "Билет успешно возвращен"
                });
                
                if (onTicketUpdate) {
                    onTicketUpdate();
                }
            } else {
                let errorMessage = "Ошибка при возврате билета";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    console.error("Не удалось прочитать ответ с ошибкой:", e);
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error("Ошибка при возврате билета:", error);
            toast({
                title: "Ошибка",
                description: error instanceof Error ? error.message : "Не удалось вернуть билет. Пожалуйста, попробуйте позже.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                    <div>Статус: {isPaid ? "Оплачен" : "Не оплачен"}</div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-row justify-between w-full">
                <Button 
                    variant="destructive" 
                    onClick={handleCancelTicket} 
                    disabled={isLoading}
                >
                    {isLoading ? "Подождите..." : "Вернуть билет"}
                </Button>
                <Button
                >
                    Оплатить билет
                </Button>
            </CardFooter>
        </div>
    )
}