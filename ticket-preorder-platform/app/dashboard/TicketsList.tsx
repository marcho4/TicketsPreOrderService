import React from "react";
import TicketDynamicCard from "@/app/dashboard/TicketCard";


import { TicketCardProps } from "./TicketCard";

export default function TicketsList({ resource }: { resource: { read: () => {data: TicketCardProps[] } } }) {
    const tickets = resource.read();

    if (!tickets || tickets.data.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-xl text-gray-600">Нет доступных матчей</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.data.map((ticket) => (
                <TicketDynamicCard key={ticket.id} props={ticket} />
            ))}
        </div>
    );
}
