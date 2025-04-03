import React, { Suspense, useState, useEffect } from "react";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/providers/authProvider";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/app/matches/MatchCard";

interface Payment {
    payment_id: string;
    user_id: string;
    amount: string;
    currency: string;
    status: string;
    match_id: string;
    ticket_id: string;
    created_at: string;
}

interface Refund {
    refund_id: string;
    payment_id: string;
    user_id: string;
    status: string;
    created_at: string;
}

interface PaymentModalProps {
    payment: Payment;
    onClose: () => void;
}

interface RefundModalProps {
    refund: Refund;
    payments: Payment[];
    onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ payment, onClose }) => {
    return (
        <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">Детали платежа</h2>
            <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">ID платежа:</div>
                <div>{payment.payment_id}</div>
                
                <div className="font-semibold">Сумма:</div>
                <div>{payment.amount} {payment.currency}</div>
                
                <div className="font-semibold">Статус:</div>
                <div>{payment.status}</div>
                
                <div className="font-semibold">ID матча:</div>
                <div>{payment.match_id}</div>
                
                <div className="font-semibold">ID билета:</div>
                <div>{payment.ticket_id}</div>
                
                <div className="font-semibold">Дата создания:</div>
                <div>{formatDate(payment.created_at)}</div>
            </div>
            <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={onClose}>Закрыть</Button>
            </div>
        </div>
    );
};

const RefundModal: React.FC<RefundModalProps> = ({ refund, payments, onClose }) => {
    // Найдем платеж, связанный с этим возвратом
    const relatedPayment = payments.find(p => p.payment_id === refund.payment_id);

    return (
        <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">Детали возврата</h2>
            <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">ID возврата:</div>
                <div>{refund.refund_id}</div>
                
                <div className="font-semibold">ID платежа:</div>
                <div>{refund.payment_id}</div>
                
                <div className="font-semibold">Статус:</div>
                <div>{refund.status}</div>

                <div className="font-semibold">Дата создания:</div>
                <div>{formatDate(refund.created_at)}</div>

                {relatedPayment && (
                    <>
                        <div className="font-semibold">Сумма возврата:</div>
                        <div>{relatedPayment.amount} {relatedPayment.currency}</div>
                        
                        <div className="font-semibold">ID матча:</div>
                        <div>{relatedPayment.match_id}</div>
                        
                        <div className="font-semibold">ID билета:</div>
                        <div>{relatedPayment.ticket_id}</div>
                    </>
                )}
            </div>
            <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={onClose}>Закрыть</Button>
            </div>
        </div>
    );
};

const PaymentsList = ({ payments, onPaymentClick }: { payments: Payment[], onPaymentClick: (payment: Payment) => void }) => {
    if (!payments || payments.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-500">Платежи не найдены</p>
            </div>
        );
    }

    // Сортировка платежей по дате (более новые сверху)
    const sortedPayments = [...payments].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {sortedPayments.map((payment) => (
                <Card 
                    key={payment.payment_id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onPaymentClick(payment)}
                >
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-medium">{payment.amount} {payment.currency}</div>
                                <div className="text-sm text-gray-500">{formatDate(payment.created_at)}</div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs ${
                                payment.status === 'paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {payment.status}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const RefundsList = ({ refunds, payments, onRefundClick }: 
    { refunds: Refund[], payments: Payment[], onRefundClick: (refund: Refund) => void }) => {
    if (!refunds || refunds.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-500">Возвраты не найдены</p>
            </div>
        );
    }

    // Сортировка возвратов по дате (более новые сверху)
    const sortedRefunds = [...refunds].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {sortedRefunds.map((refund) => {
                // Находим соответствующий платеж для отображения суммы
                const relatedPayment = payments.find(p => p.payment_id === refund.payment_id);
                
                return (
                    <Card 
                        key={refund.refund_id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => onRefundClick(refund)}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    {relatedPayment && (
                                        <div className="font-medium">{relatedPayment.amount} {relatedPayment.currency}</div>
                                    )}
                                    <div className="text-sm text-gray-500">{formatDate(refund.created_at)}</div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs ${
                                    refund.status === 'completed' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {refund.status}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default function UserPaymentsCard() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("payments");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();

    const fetchPayments = async () => {
        setLoading(true);
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
                setPayments(data.data || []);
            }
        } catch (error) {
            console.error('Ошибка при получении платежей:', error);
        }
    };

    const fetchRefunds = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/payments/refunds', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setRefunds(data || []);
            }
        } catch (error) {
            console.error('Ошибка при получении возвратов:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPayments();
            fetchRefunds();
        }
    }, [user]);

    const handlePaymentClick = (payment: Payment) => {
        setSelectedPayment(payment);
        setSelectedRefund(null);
        setIsModalOpen(true);
    };

    const handleRefundClick = (refund: Refund) => {
        setSelectedRefund(refund);
        setSelectedPayment(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
        setSelectedRefund(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold mb-2">Ваши финансы</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full mb-4">
                        <TabsTrigger value="payments" className="flex-1">Платежи</TabsTrigger>
                        <TabsTrigger value="refunds" className="flex-1">Возвраты</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="payments" className="mt-2">
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : (
                            <PaymentsList 
                                payments={payments} 
                                onPaymentClick={handlePaymentClick} 
                            />
                        )}
                    </TabsContent>
                    
                    <TabsContent value="refunds" className="mt-2">
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : (
                            <RefundsList 
                                refunds={refunds} 
                                payments={payments}
                                onRefundClick={handleRefundClick} 
                            />
                        )}
                    </TabsContent>
                </Tabs>

                {isModalOpen && (
                    <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                        {selectedPayment && (
                            <PaymentModal 
                                payment={selectedPayment} 
                                onClose={handleCloseModal} 
                            />
                        )}
                        {selectedRefund && (
                            <RefundModal 
                                refund={selectedRefund} 
                                payments={payments}
                                onClose={handleCloseModal} 
                            />
                        )}
                    </Modal>
                )}
            </CardContent>
        </Card>
    );
} 