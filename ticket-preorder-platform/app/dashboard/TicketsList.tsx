import React, { useState, useEffect } from "react";
import TicketDynamicCard from "@/app/dashboard/TicketCard";

import { TicketCardProps } from "./TicketCard";

interface TicketsListProps {
    resource: { read: () => {data: TicketCardProps[] } };
    onTicketUpdate?: () => void;
}

export default function TicketsList({ resource, onTicketUpdate }: TicketsListProps) {
    const [tickets, setTickets] = useState<TicketCardProps[]>([]);
    const ticketsData = resource.read();

    // Инициализация списка билетов
    useEffect(() => {
        if (ticketsData && ticketsData.data) {
            setTickets(ticketsData.data);
        }
    }, [ticketsData]);

    // Функция для обновления списка билетов
    const handleTicketRemoved = (ticketId: string) => {
        setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));
        
        // Вызываем родительскую функцию обновления списка для полного обновления из API
        if (onTicketUpdate) {
            onTicketUpdate();
        }
    };

    if (!tickets || tickets.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-xl text-gray-600">Нет доступных билетов</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <TicketDynamicCard 
                    key={ticket.id} 
                    props={ticket} 
                />
            ))}
        </div>
    );
}
