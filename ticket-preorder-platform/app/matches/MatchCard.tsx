"use client";

import { useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import ErrorBoundary from "../../components/ErrorBoundary";
import { createResource } from "@/lib/createResource";
import {Dot} from "lucide-react"
import { checkImageExists } from "@/lib/dataFetchers";


export interface MatchData {
    teamHome: string;
    teamAway: string;
    matchDateTime: string;
    stadium: string;
    id: string;
    organizerId: string;
    matchStatus: string;
    description: string;
    logoUrl: string;
}


export function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');

    const monthNames = [
        'января',
        'февраля',
        'марта',
        'апреля',
        'мая',
        'июня',
        'июля',
        'августа',
        'сентября',
        'октября',
        'ноября',
        'декабря'
    ];

    // Преобразуем номер месяца в индекс массива (месяцы начинаются с 0)
    const monthIndex = parseInt(month, 10) - 1;

    // Преобразуем день, чтобы избавиться от возможного ведущего нуля
    const dayNumber = parseInt(day, 10);

    // Если месяц указан неверно, можно выбросить ошибку или вернуть исходную дату
    if (monthIndex < 0 || monthIndex > 11) {
        throw new Error("Неверный формат даты");
    }

    return `${dayNumber} ${monthNames[monthIndex]}`;
}




export async function fetchMatchData(id: string): Promise<boolean> {
    try {
        const imageUrl = `https://match-photos.s3.us-east-1.amazonaws.com/matches/${id}`;
        const imageExists = await checkImageExists(imageUrl);
        return imageExists;
    } catch (error) {
        throw error;
    }
}

export default function MatchCard({ id, teamHome, teamAway, matchDateTime, stadium, organizerId, matchStatus, description }: MatchData) {
    const router = useRouter();


    const checkImageExistsCallback = useCallback(async () => {
        try {
            const imageUrl = `https://match-photos.s3.us-east-1.amazonaws.com/matches/${id}`;
            const imageExists = await checkImageExists(imageUrl);
            return imageExists;
        } catch (error) {
            console.error(error);
            return false;
        }
    }, [id]);

    const resource = useMemo(() => createResource(checkImageExistsCallback), [checkImageExistsCallback]);

    return (
        <MatchCardContent id={id} teamHome={teamHome} teamAway={teamAway} matchDateTime={matchDateTime} stadium={stadium} />
    );
}

function MatchCardContent({ id, teamHome, teamAway, matchDateTime, stadium}: {
    id: string;
    teamHome: string;
    teamAway: string;
    matchDateTime: string;
    stadium: string;
}) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/match/${id}`);
    };
    const curr_date = matchDateTime.split("T")[0];
    const time = matchDateTime.split("T")[1].slice(0, 5);

    const logo = `https://match-photos.s3.us-east-1.amazonaws.com/matches/${id}`;

    return (
        <div className="group w-full max-w-96 cursor-pointer " onClick={handleClick}>
            <section
                className="group relative flex max-w-96 aspect-[16/9] w-full overflow-hidden rounded-lg cursor-pointer"
                aria-label={`Match between ${teamHome} and ${teamAway}`}
            >
                <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
                <Image
                        src={logo}
                        alt="Match preview background"
                        fill
                        className="object-cover shadow-lg"
                        priority={false}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/match_preview.jpg";
                        }}
                    />
                </div>
            </section>
            <div className="flex flex-col items-center justify-center w-full mt-2">
                <div className="bg-opacity-90 rounded-lg py-2 w-full">
                    <h2 className="text-xl font-semibold text-gray-800 w-full leading-tight text-left">
                        {teamHome} - {teamAway}
                    </h2>
                </div>
                <div className="flex items-center text-left w-full text-gray-600">
                    {stadium} <Dot/> {formatDate(curr_date)}, {time}
                </div>
            </div>
        </div>
    );
}

function MatchCardLoading() {
    return (
        <div className="group w-full max-w-96 cursor-pointer">
            <div className="relative flex h-52 w-full overflow-hidden rounded-lg bg-gray-200 animate-pulse" />
            <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
        </div>
    );
}