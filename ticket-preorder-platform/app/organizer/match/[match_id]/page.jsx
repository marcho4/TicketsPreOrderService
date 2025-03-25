"use client"

import {useParams} from "next/navigation";
import {Suspense, useMemo} from "react";
import {createResource} from "../../../../lib/createResource";
import {RenderedMatchInfo} from "./RenderedMatch";
import {TicketsRendered} from "./TicketsRendered";

export default function Page() {
    const {match_id} = useParams();

    async function fetchMatchData() {
        try {
            const response = await fetch(`http://localhost:8000/api/matches/${match_id}`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                console.error(`Failed to fetch match data: ${response.text()}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error("Error fetching match data:", error);
            throw error;
        }
    }
    async function fetchTickets() {
        try {
            const response = await fetch(`http://localhost:8000/api/tickets/${match_id}`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                console.error(`Failed to fetch match data: ${response.text()}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error("Error fetching match data:", error);
            throw error;
        }
    }

    const resource = useMemo(()=> {
        return createResource(fetchMatchData)
    }, [match_id]);

    const ticketResource = useMemo(() => {
        return createResource(fetchTickets)
    }, [match_id]);


    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <RenderedMatchInfo resource={resource} />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
                <TicketsRendered resource={ticketResource} match_id={match_id} />
            </Suspense>
        </div>
    )
}

