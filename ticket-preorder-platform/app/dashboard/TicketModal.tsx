import {CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import { useState, useEffect } from "react";
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

interface Payment {
    payment_id: string;
    ticket_id: string;
    match_id: string;
    status: string;
}

interface TicketModalProps {
    ticketData: TicketData;
    matchName: string;
    stadium: string;
    onTicketUpdate?: () => void;
    onClose?: () => void;
}

export default function TicketModal({ ticketData, matchName, stadium, onTicketUpdate, onClose }: TicketModalProps) {
    const [isPaid, setIsPaid] = useState<boolean>(ticketData.status === "sold");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
    const [isRefundLoading, setIsRefundLoading] = useState<boolean>(false);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    // Получение payment_id для текущего билета
    useEffect(() => {
        if (isPaid && ticketData.id) {
            fetchPaymentId();
        }
    }, [isPaid, ticketData.id]);

    const fetchPaymentId = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/payments', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                const payments = data.data;
                const payment = payments.find((p: Payment) => 
                    p.ticket_id === ticketData.id && 
                    p.match_id === ticketData.match_id && 
                    p.status === 'paid'
                );
                
                if (payment) {
                    setPaymentId(payment.payment_id);
                }
            }
        } catch (error) {
            console.error("Ошибка при получении платежей:", error);
        }
    };

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
                
                if (onClose) {
                    onClose();
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

    const handlePayTicket = async () => {
        const userId = user || ticketData.user_id;
        
        if (!ticketData.id || !userId || !ticketData.match_id) {
            toast({
                title: "Ошибка",
                description: "Не удалось найти ID билета, пользователя или матча",
                variant: "destructive"
            });
            return;
        }

        setIsPaymentLoading(true);
        try {
            // Создаем платеж через оркестратор
            const paymentResponse = await fetch(`http://localhost:8000/api/payments/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userId,
                    amount: ticketData.price.toString(),
                    currency: "RUB",
                    provider: "Stripe", // Используем Stripe как провайдер по умолчанию
                    match_id: ticketData.match_id,
                    ticket_id: ticketData.id
                })
            });

            if (!paymentResponse.ok) {
                const errorData = await paymentResponse.json();
                throw new Error(errorData.msg || "Не удалось создать платеж");
            }

            // Платеж успешно создан, статус билета обновляется внутри оркестратора
            toast({
                title: "Успех",
                description: "Билет успешно оплачен"
            });
            
            setIsPaid(true);
            
            if (onTicketUpdate) {
                onTicketUpdate();
            }
        } catch (error) {
            console.error("Ошибка при оплате билета:", error);
            toast({
                title: "Ошибка",
                description: error instanceof Error ? error.message : "Не удалось оплатить билет. Пожалуйста, попробуйте позже.",
                variant: "destructive"
            });
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const handleRefundPayment = async () => {
        if (!paymentId) {
            toast({
                title: "Ошибка",
                description: "Не удалось найти ID платежа",
                variant: "destructive"
            });
            return;
        }

        setIsRefundLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/payments/refund/${paymentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Не удалось вернуть средства");
            }

            toast({
                title: "Успех",
                description: "Средства успешно возвращены"
            });
            
            setIsPaid(false);
            
            if (onTicketUpdate) {
                onTicketUpdate();
            }
            
            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error("Ошибка при возврате средств:", error);
            toast({
                title: "Ошибка",
                description: error instanceof Error ? error.message : "Не удалось вернуть средства. Пожалуйста, попробуйте позже.",
                variant: "destructive"
            });
        } finally {
            setIsRefundLoading(false);
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
                {isPaid ? (
                    <Button 
                        variant="destructive" 
                        onClick={handleRefundPayment} 
                        disabled={isRefundLoading}
                        className="w-full"
                    >
                        {isRefundLoading ? "Подождите..." : "Вернуть средства"}
                    </Button>
                ) : (
                    <>
                        <Button 
                            variant="destructive" 
                            onClick={handleCancelTicket} 
                            disabled={isLoading || isPaymentLoading}
                        >
                            {isLoading ? "Подождите..." : "Вернуть билет"}
                        </Button>
                        <Button
                            onClick={handlePayTicket}
                            disabled={isLoading || isPaymentLoading}
                        >
                            {isPaymentLoading ? "Обработка..." : "Оплатить билет"}
                        </Button>
                    </>
                )}
            </CardFooter>
        </div>
    )
}