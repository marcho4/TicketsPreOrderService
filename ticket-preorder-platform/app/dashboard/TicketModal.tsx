import {CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/authProvider";
import { PaymentEvents } from "./UserPayments";

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
    const [isFetchingPaymentId, setIsFetchingPaymentId] = useState<boolean>(false);
    const { toast } = useToast();
    const { user } = useAuth();

    // Получение payment_id для текущего билета
    useEffect(() => {
        if (isPaid && ticketData.id) {
            fetchPaymentId();
        }
    }, [isPaid, ticketData.id]);

    const fetchPaymentId = async () => {
        if (isFetchingPaymentId) return;
        
        setIsFetchingPaymentId(true);
        try {
            const response = await fetch('http://localhost:8000/api/payments', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            console.log(response);

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                const payments = data.data || [];
                console.log(payments);
                console.log(ticketData.id);
                const payment = payments.find((p: Payment) => 
                    p.ticket_id === ticketData.id
                );
                
                if (payment) {
                    setPaymentId(payment.payment_id);
                    return payment.payment_id;
                }
            }
            console.log("No payment found");
            return null;
        } catch (error) {
            console.error("Ошибка при получении платежей:", error);
            return null;
        } finally {
            setIsFetchingPaymentId(false);
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
                // Не выбрасываем исключение для некритичных ошибок оплаты
                toast({
                    title: "Платеж не прошел",
                    description: errorData.msg || "Не удалось создать платеж",
                    variant: "destructive"
                });
                return;
            }

            // Платеж успешно создан, статус билета обновляется внутри оркестратора
            toast({
                title: "Успех",
                description: "Билет успешно оплачен"
            });
            
            setIsPaid(true);
            
            // Уведомляем о новом платеже через шину событий
            PaymentEvents.notify();
            
            // Ждем небольшой промежуток времени для обновления на сервере
            setTimeout(async () => {
                // Получаем ID платежа для возможного возврата средств
                const newPaymentId = await fetchPaymentId();
                if (newPaymentId) {
                    setPaymentId(newPaymentId);
                }
                
                if (onTicketUpdate) {
                    onTicketUpdate();
                }
            }, 500);
        } catch (error) {
            console.error("Ошибка при оплате билета:", error);
            toast({
                title: "Ошибка",
                description: "Не удалось оплатить билет. Пожалуйста, попробуйте позже.",
                variant: "destructive"
            });
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const handleRefundPayment = async () => {
        // Если у нас еще нет paymentId, пытаемся его получить снова
        let currentPaymentId = paymentId;
        if (!currentPaymentId) {
            setIsRefundLoading(true);
            
            toast({
                title: "Получение данных",
                description: "Получаем информацию о платеже..."
            });
            
            currentPaymentId = await fetchPaymentId();
            console.log(currentPaymentId);
            
            if (!currentPaymentId) {
                toast({
                    title: "Ошибка",
                    description: "Не удалось найти ID платежа. Пожалуйста, подождите несколько секунд и попробуйте снова.",
                    variant: "destructive"
                });
                setIsRefundLoading(false);
                return;
            }
        }

        setIsRefundLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/payments/refund/${currentPaymentId}`, {
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
            setPaymentId(null);
            
            // Уведомляем о новом возврате через шину событий
            PaymentEvents.notify();
            
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
                <CardTitle className="text-2xl font-semibold">
                    Данные билета
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <div className="text-lg font-semibold">{matchName}</div>
                    <div className="text-gray-600 mb-2">{stadium}</div>
                    <div className="mb-2">Сектор {ticketData.sector} <br/> Ряд {ticketData.row} <br/> Место {ticketData.seat}</div>
                    <div className="mb-2">{ticketData.price} {ticketData.price % 10 > 4 ? "рублей" : (ticketData.price == 1 ? "рубль" : "рубля")}</div>
                    <div className={`font-semibold ${isPaid ? "text-green-600" : "text-red-600"}`}>{isPaid ? "Оплачен" : "Не оплачен"}</div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-row justify-between w-full">
                {isPaid ? (
                    <Button 
                        variant="destructive" 
                        onClick={handleRefundPayment} 
                        disabled={isRefundLoading || isFetchingPaymentId}
                        className="w-full"
                    >
                        {isRefundLoading || isFetchingPaymentId ? "Подождите..." : "Вернуть средства"}
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