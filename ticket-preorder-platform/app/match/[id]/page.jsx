"use client";

import Image from "next/image";
import { createResource } from "../../../lib/createResource";
import { useParams } from "next/navigation";
import { Suspense, useMemo } from "react";

// Функция для форматирования даты в формат DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export default function Page() {
    const { id } = useParams();

    // Функция для получения данных матча
    const fetchMatchData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/matches/${id}`, {
                method: "GET",
                credentials: "same-origin",
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.msg || "Ошибка загрузки данных");
            }
            return result.data;
        } catch (error) {
            console.error("Ошибка в fetchMatchData:", error);
            throw error;
        }
    };

    // Создаем ресурс только при изменении id
    const resource = useMemo(() => createResource(fetchMatchData), [id]);

    return (
        <Suspense fallback={<Loading />}>
            <MatchRendered resource={resource} />
        </Suspense>
    );
}

function Loading() {
    return (
        <div className="flex flex-col items-center justify-center mx-auto">
            Загрузка...
        </div>
    );
}

function MatchRendered({ resource }) {
    const matchData = resource.read();
    return (
        <div className="flex flex-col items-center justify-center mx-6">
            {/* Заголовок */}
            <header className="flex flex-col w-full mx-10 py-10 rounded-lg items-center">
                <div className="text-2xl font-semibold text-my_black/80">
                    {formatDate(matchData.matchDateTime)}
                </div>
                <div className="text-2xl font-semibold text-my_black/80">
                    {matchData.stadium}
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-center">
                    {matchData.teamHome} - {matchData.teamAway}
                </h1>
                <div className="text-2xl font-semibold mt-2 text-my_black/80">
                    {matchData.matchDescription}
                </div>
            </header>

            {/* Основной контент */}
            <main className="flex flex-col w-full mx-10 py-10 rounded-lg items-center gap-y-5">
                <div className="flex flex-col items-center justify-center mx-auto">
                    <Image
                        src="/stadion_shema.jpg"
                        alt="Схема стадиона"
                        width={500}
                        height={50}
                    />
                </div>
                <button className="bg-button-darker text-white py-3 px-5 rounded-lg hover:scale-105 transition-transform duration-300">
                    Забронировать билет
                </button>
                <div id="reservation-menu">{/* Модальное окно при клике */}</div>
            </main>
        </div>
    );
}