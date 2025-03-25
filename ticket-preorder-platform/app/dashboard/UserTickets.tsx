import React, {Suspense, useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TicketCardProps} from "./TicketCard";
import TicketDynamicCard from "./TicketCard";
import {useAuth} from "@/providers/authProvider";
import {createResource} from "@/lib/createResource";
import ErrorBoundary from "@/app/organizer/ErrorBoundary";
import {LoadingSkeleton} from "@/app/organizer/MatchesSection";
import TicketsList from "@/app/dashboard/TicketsList";

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
    const [tickets, setTickets] = useState<UserTickets>(struct);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);
    const { user, userRole } = useAuth();

    const fetchTickets = async () => {
        try {
            let response = await fetch(`http://localhost:8000/api/tickets/user/${userId}`, {
                method: 'GET',
                credentials: 'same-origin',
            });
            response = await response.json();
            return response.data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    };
    const ticketsResource = useMemo(() => {
        if (user && userRole === "USER") {
            return createResource(fetchTickets);
        }
        return null;
    }, [user, userRole]);

    if (!user) {
        return <Card>
            <CardHeader>
                <CardTitle>
                    Идёт загрузка...
                </CardTitle>
            </CardHeader>
        </Card>;
    }

    if (!ticketsResource) {
        return <Card>
            <CardHeader>
                <CardTitle>
                    Вы не являетесь пользователем, чтобы видеть этот раздел
                </CardTitle>
            </CardHeader>
        </Card>
    }

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
