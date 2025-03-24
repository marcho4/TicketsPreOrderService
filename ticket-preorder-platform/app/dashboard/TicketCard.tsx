"use client";

import React, { Suspense, useMemo } from "react";
import Image from "next/image";
import ErrorBoundary from "../../components/ErrorBoundary";
import { createResource } from "@/lib/createResource";
import {toast} from "@/hooks/use-toast";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Dot} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {Modal} from "@/components/Modal";
import TicketModal from "@/app/dashboard/TicketModal";
import {formatDate} from "@/components/MatchCard";

export interface TicketCardProps {
    id: string,
    match_id: string,
    price: string,
    row: string,
    seat: string,
    sector: string,
    status: string,
    user_id: string
}

export interface MatchInfoProps {
    id: string,
    matchDateTime: string,
    matchDescription: string,
    matchStatus: string,
    organizerId: string,
    stadium: string,
    teamAway: string,
    teamHome: string
}


export interface TicketCardData {
    id: string;
    matchId: string;
}

async function fetchTicketData(id: string): Promise<TicketCardProps> {
    try {
        const response = await fetch(`http://localhost:8000/api/tickets/ticket/${id}`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            toast({
                title:"Ошибка при получении данных о билетах",
                description: "Разработчики уже работают",
            })
            throw new Error(`Не удалось получить данные о билете ${response.statusText}`);
        }

        const result = await response.json();
        return result.data as TicketCardProps;
    } catch (error) {
        console.error("Ошибка обработки данных билета: ", error);
        throw error;
    }
}
async function fetchMatchData(id: string): Promise<TicketCardProps> {
    try {
        const response = await fetch(`http://localhost:8000/api/matches/${id}`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            toast({
                title:"Ошибка при получении данных о матче",
                description: "Разработчики уже работают",
            })
            throw new Error(`Не удалось получить данные о билете ${response.statusText}`);
        }

        const result = await response.json();
        return result.data as TicketCardProps;
    } catch (error) {
        console.error("Ошибка обработки данных билета: ", error);
        throw error;
    }
}

export default function TicketDynamicCard({ id, matchId }: TicketCardData) {
    const resource = useMemo(
        () => createResource(() => fetchTicketData(id)),
        [id]
    );
    const matchResource = useMemo(() => createResource(() => fetchMatchData(matchId)), [matchId]);

    return (
        <ErrorBoundary>
            <Suspense fallback={<TicketCardSkeleton />}>
                <TicketCard resource={resource} matchResource={matchResource}/>
            </Suspense>
        </ErrorBoundary>
    );
}

function TicketCard({resource, matchResource}: {
    resource: ReturnType<typeof createResource<TicketCardProps>>;
    matchResource: ReturnType<typeof createResource<MatchInfoProps>>;
}) {
    const data = resource.read() as TicketCardProps;
    const matchData = matchResource.read() as MatchInfoProps;
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleClick = () => {
        setIsModalOpen((prevState) => !prevState);
    };

    const date = new Date(matchData.matchDateTime).toISOString();
    const time = date.split("T")[1].slice(0, 5);

    return (
        <div>
            <Card className="cursor-pointer" onClick={handleClick}>
                <CardHeader>
                    <CardTitle>
                        {matchData.teamHome} - {matchData.teamAway}
                    </CardTitle>
                    <CardDescription className="flex flex-row w-full justify-between">
                        <div>{formatDate(date)}<br/>{matchData.stadium}<br/>{time}</div>
                        <div>Место: {data.seat}<br/>Ряд: {data.row}<br/>Сектор: {data.sector}</div>
                    </CardDescription>
                </CardHeader>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <TicketModal
                    ticketData={data}
                    matchName={`${matchData.teamHome} - ${matchData.teamAway}`}
                    stadium={matchData.stadium}/>
            </Modal>
        </div>
    )
}

function TicketCardSkeleton(): JSX.Element {
    return (
        <Skeleton className="block">
            <CardHeader>
                <Skeleton className={"h-8"}/>
            </CardHeader>
        </Skeleton>
    );
}