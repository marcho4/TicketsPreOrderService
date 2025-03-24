import React, {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TicketCardProps} from "./TicketCard";
import TicketDynamicCard from "./TicketCard";

interface UserTickets {
    data: TicketCardProps[]
    msg: string | undefined | null
}

export default function UserTicketsCard ({userId} ) {
    const struct: UserTickets = {
        data: [],
        msg: "",
    };
    const [tickets, setTickets] = useState<UserTickets>(struct);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getTickets = async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/tickets/user/${userId}`, {
                method: 'GET',
                credentials: "include",
            });

            if (!response || !response.ok) {
                throw new Error('Failed to fetch tickets');
            }

            const result = await response.json();
            setTickets(result as UserTickets);
        } catch (err) {
            setError(err.message || 'An error occurred while fetching tickets');
            console.error('Error fetching tickets:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getTickets();
    }, [userId]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        Идёт загрузка...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">
                        Ошибка: {error}
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (tickets.data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        У вас нет билетов в данный момент
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold mb-4">Ваши билеты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-72 overflow-y-auto">
                {tickets.data.map((ticket) => (
                    <TicketDynamicCard id={ticket.id} key={ticket.id} matchId={ticket.match_id} />
                ))}
            </CardContent>
        </Card>
    );
};
