"use client"

import {useAuth} from "@/providers/authProvider";
import {useRouter} from "next/navigation";
import DataCard from "@/components/DataCard";
import {useEffect, useState} from "react";

export default function Dashboard() {
    const router = useRouter()
    const { user, userRole, isLoading } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(true); // Состояние для загрузки билетов
    const [ticketsError, setTicketsError] = useState(null); // Состояние для ошибок

    let fetchUrl = `http://localhost:8000/api/user/${user}`;
    let updateUrl = `http://localhost:8000/api/user/${user}/update`;
    const const_fields = ["email"];
    const mutableFields = ["birthday", "last_name", "name", "phone"];

    useEffect(() => {
        if (user) {
            // Загружаем билеты пользователя
            setTicketsLoading(true);
            fetch(`http://localhost:8000/api/tickets/user/${user}`)
                .then(response => {
                    if (!response.ok) {
                        console.log(response.body)
                        throw new Error('Ошибка при загрузке билетов');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && Array.isArray(data.data)) {
                        setTickets(data.data);
                    } else {
                        setTickets([]); // Если данные некорректны, устанавливаем пустой массив
                    }
                })
                .catch(error => {
                    console.error('Error fetching tickets:', error);
                    setTicketsError(error.message); // Сохраняем ошибку
                })
                .finally(() => {
                    setTicketsLoading(false); // Завершаем загрузку
                });
        }
    }, [user]);

    if (isLoading) {
        return <p>Загрузка...</p>;
    }

    // Если проверка окончена, но user по-прежнему null - значит, не залогинен
    if (!user) {
        return <p>Пользователь не залогинен</p>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header>
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 bg-white lg:px-8 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                </div>
            </header>
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-6 grid grid-cols-2 gap-4">
                    <div>
                        <DataCard const_fields={const_fields} fetchLink={fetchUrl}
                                  updateLink={updateUrl} mutable_fields={mutableFields}>
                        </DataCard>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ваши билеты</h2>
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            {ticketsLoading ? (
                                <p>Загрузка билетов...</p>
                            ) : ticketsError ? (
                                <p className="text-red-500">Ошибка: {ticketsError}</p>
                            ) : Array.isArray(tickets) && tickets.length > 0 ? (
                                <ul>
                                    {tickets.map(ticket => (
                                        <li key={ticket.id} className="mb-4">
                                            <p><strong>ID билета:</strong> {ticket.id}</p>
                                            <p><strong>Матч ID:</strong> {ticket.match_id}</p>
                                            <p><strong>Цена:</strong> {ticket.price}</p>
                                            <p><strong>Ряд:</strong> {ticket.row}</p>
                                            <p><strong>Место:</strong> {ticket.seat}</p>
                                            <p><strong>Сектор:</strong> {ticket.sector}</p>
                                            <p><strong>Статус:</strong> {ticket.status}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>У вас пока нет билетов.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}