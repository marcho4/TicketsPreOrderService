"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import fetchData from "@/lib/fetchData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Request {
    id: string;
    companyName: string;
    email: string;
    inn: string;
}

const AdminHome = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(false);
    //const router = useRouter();

    useEffect(() => {
        const fetchRequests = async () => {
            const response = await fetchData("http://localhost:8080/api/requests", "GET", null, setLoading);
            if (response && response.data) {
                setRequests(response.data);
            } else { // заглушка
                setRequests([
                    { id: "1", companyName: "Компания 1", email: "email1@example.com", inn: "1234567890" },
                    { id: "2", companyName: "Компания 2", email: "email2@example.com", inn: "0987654321" },
                    { id: "3", companyName: "Компания 3", email: "email3@example.com", inn: "1122334455" },
                ]);
            }
        };

        fetchRequests();
    }, []);

    const handleResponse = async (requestId: string, action: "accept" | "reject") => {
        const response = await fetchData(
            `http://localhost:8080/api/requests/${action}`,
            "POST",
            { id: requestId },
            setLoading
        );

        if (response.status === 200) {
            setRequests(requests.filter((req) => req.id !== requestId));
        } else {
            console.log(`Error ${action}ing request`);
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto py-10">
            <Card className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl bg-opacity-90">
                <CardHeader className="space-y-1 pt-8">
                    <CardTitle className="text-3xl font-bold text-center">Список заявок</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center">Загрузка...</p>
                    ) : (
                        <div className="space-y-4">
                            {requests.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">ID</th>
                                            <th className="px-4 py-2 text-left">Компания</th>
                                            <th className="px-4 py-2 text-left">Email</th>
                                            <th className="px-4 py-2 text-left">ИНН</th>
                                            <th className="px-4 py-2 text-left">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request) => (
                                            <tr key={request.id}>
                                                <td className="px-4 py-2">{request.id}</td>
                                                <td className="px-4 py-2">{request.companyName}</td>
                                                <td className="px-4 py-2">{request.email}</td>
                                                <td className="px-4 py-2">{request.inn}</td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <Button
                                                        onClick={() => handleResponse(request.id, "accept")}
                                                        className="bg-green-500 hover:bg-green-600"
                                                    >
                                                        Принять
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleResponse(request.id, "reject")}
                                                        className="bg-red-500 hover:bg-red-600"
                                                    >
                                                        Отклонить
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center">Заявок нет.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminHome;
