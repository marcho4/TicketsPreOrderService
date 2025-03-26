"use client";

import Image from "next/image";
import { createResource } from "../../../lib/createResource";
import { useParams } from "next/navigation";
import {Suspense, useEffect, useMemo, useState} from "react";
import {X} from "lucide-react";
import ErrorBoundary from "../../../components/ErrorBoundary";
import {Button} from "../../../components/ui/button";
import {Table, TableHead, TableHeader, TableRow} from "../../../components/ui/table";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "../../../components/ui/card";
import {toast} from "../../../hooks/use-toast";
import FetchedTickets from "./FetchedTickets";
import {Skeleton} from "../../../components/ui/skeleton";
import {Label} from "../../../components/ui/label";

export function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export default function Page() {
    const { id } = useParams();
    const [refreshResourceKey, setRefreshResourceKey] = useState(1);

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
    const imageUrl = `https://stadium-schemes.s3.us-east-1.amazonaws.com/matches/${id}`;


    // Создаем ресурс только при изменении id
    const resource = useMemo(() => createResource(fetchMatchData), [id]);
    const ticketsResource = useMemo(() => createResource(fetchAvailableTickets), [id, refreshResourceKey]);
    return (
        <Suspense fallback={<Loading />}>
            <MatchRendered schemeUrl={imageUrl} resource={resource} ticketsResource={ticketsResource} setRefreshResourceKey={setRefreshResourceKey} />
        </Suspense>
    );
}

function Loading() {
    return (
        <Skeleton className="h-[350px] w-full"/>
    );
}


function MatchRendered({ resource, ticketsResource, setRefreshResourceKey, schemeUrl}) {
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
            <main className="flex flex-col w-full mx-10 rounded-lg items-center gap-y-5 mb-10">
                <div className="flex flex-col items-center justify-center mx-auto">
                    <Label htmlFor={"stadium-scheme"} className="text-xl mb-5">
                        Схема стадиона
                    </Label>
                    <Image
                        id={"stadium-scheme"}
                        src={schemeUrl}
                        alt="Организатор не загрузил схему :("
                        width={700}
                        height={50}
                        className={"rounded-lg"}
                    />
                </div>
                <Button size="lg" onClick={() => setModal(true)}>
                    Забронировать билет
                </Button>
                <div id="background" onClick={() => setModal(!modal)} className={`${modal ? 'fixed inset-0 flex items-center justify-center bg-black/80' : 'hidden'}
                    z-[11] cursor-pointer`}>
                    <Card id="active-modal" className="relative max-w-2xl w-full h-[550px] rounded-lg bg-gray-50 cursor-default"
                         onClick={(e) => e.stopPropagation()}>

                        <X className="absolute top-3 right-3 h-6 w-6 text-gray-700 cursor-pointer"
                           onClick={() => setModal(!modal)}/>

                        <div id="modal-content" className="">
                            <CardHeader className="text-2xl font-semibold">
                                <CardTitle>Выберите билет из списка снизу</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ErrorBoundary>
                                    <Suspense fallback={<Loading />}>
                                        <FetchedTickets resource={ticketsResource} setRefreshResourceKey={setRefreshResourceKey}/>
                                    </Suspense>
                                </ErrorBoundary>
                            </CardContent>
                            <CardFooter className="text-gray-500">
                                После успешного предзаказа вам придет письмо на почту.<br/>
                                Спасибо за выбор нашего сервиса!
                            </CardFooter>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

