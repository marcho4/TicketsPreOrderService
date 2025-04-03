"use client";

import React, { Suspense, useMemo } from "react";
import { createResource } from "@/lib/createResource";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Modal} from "@/components/Modal";
import TicketModal from "@/app/dashboard/TicketModal";
import {formatDate} from "@/app/matches/MatchCard";
import TicketErrorBoundary from "@/app/dashboard/TicketErrorBoundary";

export interface TicketCardProps {
    id: string,
    match_id: string,
    price: number,
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
    props: TicketCardProps;
}


async function fetchMatchData(id: string): Promise<MatchInfoProps> {
    try {
        const response = await fetch(`http://localhost:8000/api/matches/${id}`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Не удалось получить данные о матче ${response.statusText}`);
        }

        const result = await response.json();
        return result.data as MatchInfoProps;
    } catch (error) {
        console.error("Ошибка обработки данных билета: ", error);
        throw error;
    }
}

export default function TicketDynamicCard({ props }: TicketCardData) {
    const matchResource = useMemo(() => createResource(() => fetchMatchData(props.match_id)), [props.match_id]);

    return (
        <TicketErrorBoundary>
            <Suspense fallback={<TicketCardSkeleton />}>
                <TicketCard props={props} matchResource={matchResource}/>
            </Suspense>
        </TicketErrorBoundary>
    );
}

function TicketCard({ props , matchResource}: {
    props: TicketCardProps;
    matchResource: { read: () => MatchInfoProps };
}) {
    const data = props;
    const matchData = matchResource.read();
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