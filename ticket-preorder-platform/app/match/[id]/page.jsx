"use client";

import Image from "next/image";
import { createResource } from "../../../lib/createResource";
import { useParams } from "next/navigation";
import {Suspense, useEffect, useMemo, useState} from "react";
import {X} from "lucide-react";
import ErrorBoundary from "../../../components/ErrorBoundary";
import {Button} from "../../../components/ui/button";
import {useAuth} from "../../../providers/authProvider";

// Функция для форматирования даты в формат DD/MM/YYYY
export function formatDate(dateString) {
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
            return result.data;
        } catch (error) {
            console.error("Ошибка в fetchMatchData:", error);
            throw error;
        }
    };

    // Функция для получения всех билетов на матч
    const fetchAvailableTickets = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/tickets/${id}?available=true`, {
                method: "GET",
                credentials: "same-origin",
            });

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error("Ошибка в fetchMatchData:", error);
            throw error;
        }
    }

    // Создаем ресурс только при изменении id
    const resource = useMemo(() => createResource(fetchMatchData), [id]);
    const ticketsResource = useMemo(() => createResource(fetchAvailableTickets), [id]);
    return (
        <Suspense fallback={<Loading />}>
            <MatchRendered resource={resource} ticketsResource={ticketsResource} />
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

function MatchRendered({ resource, ticketsResource }) {
    const matchData = resource.read();
    const [modal, setModal] = useState(false);
    useEffect(() => {
        if (modal) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [modal]);

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
                <Button
                    onClick={() => setModal(true)}
                    className="">
                    Забронировать билет
                </Button>
                <div id="background" onClick={() => setModal(!modal)} className={`${modal ? 'fixed inset-0 flex items-center justify-center bg-black/80' : 'hidden'}
                    z-[11] cursor-pointer`}>
                    <div id="active-modal" className="relative max-w-2xl w-full h-[450px] rounded-lg bg-gray-50 cursor-default"
                         onClick={(e) => e.stopPropagation()}>

                        <X className="absolute top-3 right-3 h-6 w-6 text-gray-700 cursor-pointer"
                           onClick={() => setModal(!modal)}/>

                        <div id="modal-content" className="p-6">
                            <div className="text-2xl font-semibold text-gray-700 mb-3">
                                Выберите билеты из списка снизу
                            </div>
                            <div>
                                <ErrorBoundary>
                                    <Suspense fallback={<Loading />}>
                                        <FetchedTickets resource={ticketsResource} />
                                    </Suspense>
                                </ErrorBoundary>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function FetchedTickets({resource}) {
    const tickets = resource.read();
    const {user_id} = useAuth();

    if (tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center mx-auto h-full">
                На данный момент нет доступных для предзаказа билетов
                <Button className="mt-10">
                    Встать в очередь за билетами
                </Button>
            </div>
        );
    }

    return (
        <div className="relative max-h-[350px] min-w-[300px] overflow-x-auto w-full overflow-y-auto border border-gray-300 rounded-lg bg-white">
            <table className="table-fixed w-full">
                <thead className="sticky top-0 bg-gray-100 z-10 max-h-96 overflow-y-scroll">
                <tr className="text-left">
                    <th className="w-1/5 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                        Ряд
                    </th>
                    <th className="w-1/5 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                        Место
                    </th>
                    <th className="w-1/5 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                        Цена
                    </th>
                    <th className="w-1/5 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                        Сектор
                    </th>
                    <th className="w-1/5 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                        Предзаказ
                    </th>
                </tr>
                </thead>
                <tbody>
                {tickets.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">
                            {item.row}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                            {item.seat}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                            {item.price}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                            {item.sector}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200 gap-x-2">
                            <Button onClick={async () => {
                                    try {
                                        let resp = await fetch(`http://localhost:8000/api/tickets/preorder/${item.id}`,
                                            {
                                                method: 'PUT',
                                                credentials: 'include',
                                                body: JSON.stringify({
                                                    user_id: "sdsd",
                                                    match_id: item.match_id
                                                }),
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                }
                                            })
                                        const data = await resp.json();
                                        console.log(data);
                                    } catch (e) {
                                        console.error(e)
                                    }
                                }}>
                                Предзаказать
                            </Button>
                        </td>

                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )

}