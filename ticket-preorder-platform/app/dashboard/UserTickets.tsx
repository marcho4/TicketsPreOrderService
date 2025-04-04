import React, {Suspense, useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TicketCardProps} from "./TicketCard";
import TicketDynamicCard from "./TicketCard";
import {useAuth} from "@/providers/authProvider";
import {createResource} from "@/lib/createResource";
import { Skeleton } from "@/components/ui/skeleton";
import TicketsList from "./TicketsList";

interface UserTickets {
    data: TicketCardProps[]
    msg: string | undefined | null
}

interface UserTicketsProps {
    userId: string;
}

export default function UserTicketsCard ({userId}: UserTicketsProps ) {
    const struct: UserTickets = {
        data: [],
        msg: "",
    };

    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const { user, userRole } = useAuth();

    const getTickets = async () => {
        if (!userId) return struct;
        try {
            const response = await fetch(`http://localhost:8000/api/tickets/user/${userId}`, {
                method: 'GET',
                credentials: "include",
            });

            if (!response || !response.ok) {
                throw new Error('Ошибка при загрузке билетов');
            }

            const result = await response.json();
            return result;
        } catch (err: any) {
            console.error(err);
            return struct;
        }
    };

    const ticketsResource = useMemo(() => {
        if (user && userRole === "USER") {
            return createResource(getTickets);
        }
        return null;
    }, [user, userRole, refreshTrigger]);

    // Функция для обновления списка билетов
    const handleTicketUpdate = () => {
        console.log("Обновление списка билетов...");
        setRefreshTrigger(prev => prev + 1);
    };

    if (!ticketsResource) {
        return <Card>
            <CardHeader>
                <CardTitle>
                    Вы не являетесь авторизованным пользователем, чтобы видеть этот раздел
                </CardTitle>
            </CardHeader>
        </Card>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold mb-4">Ваши билеты</CardTitle>
            </CardHeader>
            <Suspense fallback={<TicketCardSkeleton />}>
                <CardContent className="space-y-4 max-h-72 overflow-y-auto">
                    <TicketsList resource={ticketsResource} onTicketUpdate={handleTicketUpdate} />
                </CardContent>
            </Suspense>
        </Card>
    );
};


const TicketCardSkeleton = () => {
    return (
        <CardContent>
            <Skeleton className="h-32" />
        </CardContent>
    );
};


