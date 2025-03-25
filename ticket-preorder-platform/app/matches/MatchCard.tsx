"use client";

import { useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import Image from "next/image";
import ErrorBoundary from "../../components/ErrorBoundary";
import { createResource } from "@/lib/createResource";
import {Dot} from "lucide-react"
import {fetchMatchData} from "@/lib/dataFetchers";


export interface MatchData {
    teamHome: string;
    teamAway: string;
    matchDateTime: string;
    stadium: string;
    id: string;
    organizerId: string;
    matchStatus: string;
    description: string;
}

interface MatchCardProps {
    id: string;
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

export default function MatchCard({ id }: MatchCardProps) {
    const resource = useMemo(() => createResource(() => fetchMatchData(id)), [id]);

    return (
        <ErrorBoundary>
            <Suspense fallback={<MatchCardLoading />}>
                <MatchCardContent resource={resource} id={id} />
            </Suspense>
        </ErrorBoundary>
    );
}

function MatchCardContent({resource, id}: {
    resource: ReturnType<typeof createResource<MatchData>>;
    id: string;
}) {
    const data = resource.read();
    const router = useRouter();

    const handleClick = () => {
        router.push(`/match/${id}`);
    };
    const date = new Date(data.matchDateTime).toISOString();
    const curr_date = date.split("T")[0];
    const time = date.split("T")[1].slice(0, 5);

    return (
        <div className="group w-full max-w-96 cursor-pointer" onClick={handleClick}>
            <section
                className="group relative flex max-w-96 h-52 w-full overflow-hidden rounded-lg cursor-pointer"
                aria-label={`Match between ${data.teamHome} and ${data.teamAway}`}
            >
                {/* We use next/image for the background, but let's wrap it in a container. */}
                <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
                    <Image
                        src="/match_preview.jpg"
                        alt="Match preview background"
                        fill
                        className="object-cover"
                        priority={false}
                    />
                </div>
            </section>
            <div className="flex flex-col items-center justify-center w-full ">
                <div className="bg-opacity-90 rounded-lg  py-2  min-w-full ">
                    <h2 className="text-xl font-semibold text-gray-800 min-w-full leading-tight text-left">
                        {data.teamHome} - {data.teamAway}
                    </h2>
                </div>
                <div className="flex items-center  text-left min-w-full text-gray-600 ">
                    {data.stadium} <Dot/> {formatDate(curr_date)}, {time}
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