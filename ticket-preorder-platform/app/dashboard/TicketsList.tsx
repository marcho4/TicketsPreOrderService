import MatchCard from "@/app/organizer/MatchCard";
import React from "react";
import TicketDynamicCard from "@/app/dashboard/TicketCard";


export default function TicketsList({ resource }) {
    const tickets = resource.read();

    if (!tickets || tickets.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-xl text-gray-600">Нет доступных матчей</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <TicketDynamicCard key={ticket.id} id={ticket.id} matchId={ticket.match_id}  />
            ))}
        </div>
    );
}
